import http from 'node:http';
import { supabase } from './functions/supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.BACKEND_PORT || 3001;

function jsonResponse(res, status, payload) {
  const body = JSON.stringify(payload || {});
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body, 'utf8'),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-upload-key',
  });
  res.end(body);
}

async function handleUpload(req, res) {
  console.log(`[${new Date().toISOString()}] ◆ UPLOAD REQUEST: method=${req.method} url=${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('[uploads] responding to OPTIONS');
    return jsonResponse(res, 204, {});
  }

  if (req.method !== 'POST') {
    console.log('[uploads] rejecting non-POST method:', req.method);
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;

  let payload;
  try {
    payload = JSON.parse(raw || '{}');
  } catch (e) {
    return jsonResponse(res, 400, { error: 'Invalid JSON' });
  }

  // `file_path` is required; application_id may be inferred if missing
  const required = ['file_path'];
  for (const k of required) {
    if (!payload[k]) {
      return jsonResponse(res, 400, { error: `Missing required field: ${k}` });
    }
  }
  // Optional shared key validation to protect the endpoint in dev environments
  const requiredKey = process.env.BACKEND_UPLOAD_KEY;
  if (requiredKey) {
    const provided = req.headers['x-upload-key'] || req.headers['authorization'] || '';
    if (String(provided).trim() !== String(requiredKey).trim()) {
      return jsonResponse(res, 403, { error: 'Invalid upload key' });
    }
  }

  // If application_id is missing, try to infer a reasonable candidate from the submitting faculty user_id
  let applicationId = payload.application_id || null;
  if (!applicationId) {
    const appCandidates = (process.env.SUPABASE_APPLICATION_TABLE_CANDIDATES || 'applications,ranking_applications,faculty_applications')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const facultyId = payload.user_id || null;
    if (facultyId !== null && facultyId !== undefined && facultyId !== '') {
      for (const t of appCandidates) {
        try {
          const probe = await supabase
            .from(t)
            .select('*')
            .eq('faculty_id', facultyId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!probe.error && probe.data) {
            applicationId = probe.data.id || probe.data.application_id || null;
            if (applicationId) break;
          }
        } catch (e) {
          // ignore and continue
        }
      }

      if (!applicationId) {
        for (const t of appCandidates) {
          try {
            const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
            if (!probe.error && probe.data) {
              applicationId = probe.data.id || probe.data.application_id || null;
              if (applicationId) break;
            }
          } catch (e) {
            // ignore and continue
          }
        }
      }
    }
  }

  // Track what area_id was received vs what will be used
  const receivedAreaId = payload.area_id;
  console.log(`[uploads] area_id from request body: ${receivedAreaId}`);

  // Use the client-provided area_id if present; only infer if missing
  let areaId = payload.area_id || null;
  
  if (!areaId) {
    // Only infer a default area_id if the client did not provide one
    console.log('[uploads] area_id missing from request, inferring default...');
    const areaCandidates = (process.env.SUPABASE_AREA_TABLE_CANDIDATES || 'areas,ranking_areas,area_definitions')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const t of areaCandidates) {
      try {
        const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
        if (!probe.error && probe.data) {
          areaId = probe.data.id || probe.data.area_id || probe.data.code || probe.data.area_code || null;
          if (areaId) {
            console.log(`[uploads] inferred area_id=${areaId} from first row of ${t}`);
            break;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }

  const insertPayload = {
    application_id: applicationId,
    area_id: areaId,
    file_path: payload.file_path,
    uploaded_at: payload.uploaded_at || new Date().toISOString(),
    user_id: payload.user_id || null,
  };

  console.log(`[uploads] using area_id=${areaId} (received: ${receivedAreaId || 'none'})`);

  // Include optional `part_id` if provided by client
  // Do not include unknown columns like `part_id` unless DB schema supports them.

  try {
    // Idempotency: try to find existing submission to update instead of inserting duplicates.
    let existing = null;

    // 1) Try exact file_path match
    try {
      const byPath = await supabase
        .from('area_submissions')
        .select('*')
        .eq('file_path', insertPayload.file_path)
        .maybeSingle();
      if (!byPath.error && byPath.data) existing = byPath.data;
    } catch (e) {
      // ignore
    }

    // 2) Try application_id + area_id + user_id
    if (!existing && applicationId && areaId && payload.user_id) {
      try {
        const byTrip = await supabase
          .from('area_submissions')
          .select('*')
          .eq('application_id', applicationId)
          .eq('area_id', areaId)
          .eq('user_id', payload.user_id)
          .maybeSingle();
        if (!byTrip.error && byTrip.data) existing = byTrip.data;
      } catch (e) {
        // ignore
      }
    }

    // (No part_id-based lookup: table may not include that column)

    if (existing) {
      const idVal = existing.submission_id || existing.id;
      console.log('[uploads] existing submission found, id=', idVal);
      try {
        const upd = await supabase
          .from('area_submissions')
          .update(insertPayload)
          .eq('submission_id', idVal)
          .select('*')
          .maybeSingle();
        if (!upd.error && upd.data) {
          console.log('[uploads] updated row:', JSON.stringify(upd.data).slice(0, 200));
          return jsonResponse(res, 200, { data: upd.data });
        }
      } catch (e) {
        // try fallback by id
        try {
          const upd2 = await supabase
            .from('area_submissions')
            .update(insertPayload)
            .eq('id', idVal)
            .select('*')
            .maybeSingle();
          if (!upd2.error && upd2.data) {
            console.log('[uploads] updated row (by id):', JSON.stringify(upd2.data).slice(0, 200));
            return jsonResponse(res, 200, { data: upd2.data });
          }
        } catch (ie) {
          // ignore and fallback to insert
        }
      }
    }

    // No existing row found — insert a new one
    console.log('[uploads] inserting new area_submissions row', insertPayload);
    const result = await supabase.from('area_submissions').insert([insertPayload]).select('*').maybeSingle();
    if (result.error) {
      console.log('[uploads] insert error:', result.error.message || result.error);
      return jsonResponse(res, 500, { error: result.error.message || result.error });
    }

    console.log('[uploads] inserted row:', JSON.stringify(result.data).slice(0, 200));
    return jsonResponse(res, 201, { data: result.data });
  } catch (e) {
    return jsonResponse(res, 500, { error: e.message || String(e) });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
  
  if (url.pathname === '/api/uploads') {
    return handleUpload(req, res);
  }

  // simple health check
  if (url.pathname === '/health') {
    console.log('[health] ping');
    return jsonResponse(res, 200, { ok: true, timestamp: new Date().toISOString() });
  }

  jsonResponse(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n════════════════════════════════════════`);
  console.log(`  Backend running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Upload: POST http://localhost:${PORT}/api/uploads`);
  console.log(`════════════════════════════════════════\n`);
});
