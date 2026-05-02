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
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 204, {});
  }

  if (req.method !== 'POST') {
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

  // If area_id is missing, try to infer a valid area id similarly
  let areaId = payload.area_id || null;
  if (!areaId) {
    const areaCandidates = (process.env.SUPABASE_AREA_TABLE_CANDIDATES || 'areas,ranking_areas,area_definitions')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const t of areaCandidates) {
      try {
        const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
        if (!probe.error && probe.data) {
          areaId = probe.data.id || probe.data.area_id || probe.data.code || probe.data.area_code || null;
          if (areaId) break;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // If a client-provided areaId does not match any known area, try to resolve it
  if (payload.area_id) {
    const areaCandidates = (process.env.SUPABASE_AREA_TABLE_CANDIDATES || 'areas,ranking_areas,area_definitions')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let matched = false;
    for (const t of areaCandidates) {
      try {
        const probe = await supabase
          .from(t)
          .select('*')
          .or(`id.eq.${payload.area_id},area_id.eq.${payload.area_id},code.eq.${payload.area_id},area_code.eq.${payload.area_id}`)
          .limit(1)
          .maybeSingle();
        if (!probe.error && probe.data) {
          areaId = probe.data.id || probe.data.area_id || probe.data.code || probe.data.area_code || areaId;
          matched = true;
          break;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!matched) {
      // fallback: pick any valid area id from candidates
      for (const t of areaCandidates) {
        try {
          const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
          if (!probe.error && probe.data) {
            areaId = probe.data.id || probe.data.area_id || probe.data.code || probe.data.area_code || areaId;
            break;
          }
        } catch (e) {
          // ignore
        }
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

  try {
    const result = await supabase.from('area_submissions').insert([insertPayload]).select().maybeSingle();
    if (result.error) {
      return jsonResponse(res, 500, { error: result.error.message || result.error });
    }

    return jsonResponse(res, 201, { data: result.data });
  } catch (e) {
    return jsonResponse(res, 500, { error: e.message || String(e) });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/uploads') {
    return handleUpload(req, res);
  }

  // simple health
  if (url.pathname === '/health') {
    return jsonResponse(res, 200, { ok: true });
  }

  jsonResponse(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend upload endpoint listening on http://localhost:${PORT}`);
});
