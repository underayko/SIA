import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './functions/supabaseClient.js';

const bucket = process.env.SUPABASE_SUBMISSIONS_BUCKET || 'documents';
const areaId = '01';
const partFolder = 'Part A';
const storagePath = `Faculty/Area ${areaId}/${partFolder}/test-upload/${Date.now()}_testfile.txt`;
const filePath = path.resolve('test-file.txt');

async function callUploadEndpoint(payload) {
  const url = `${process.env.BACKEND_UPLOAD_URL || 'http://localhost:3001'}/api/uploads`;
  const key = process.env.BACKEND_UPLOAD_KEY || '';

  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['x-upload-key'] = key;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const txt = await res.text();
  return { status: res.status, text: txt };
}

(async () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('Test file not found at', filePath);
      process.exit(2);
    }

    const file = fs.readFileSync(filePath);
    console.log('Uploading to', bucket, storagePath);

    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, { upsert: true });

    if (uploadResult.error) {
      console.error('Upload error:', uploadResult.error.message || uploadResult.error);
      process.exit(1);
    }

    console.log('Upload succeeded:', uploadResult.data);


    // Try to discover a valid application_id to send
    let applicationId = null;
    const appCandidates = (process.env.SUPABASE_APPLICATION_TABLE_CANDIDATES || 'applications,ranking_applications,faculty_applications')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    for (const t of appCandidates) {
      try {
        const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
        if (!probe.error && probe.data) {
          applicationId = probe.data.id || probe.data.application_id || null;
          if (applicationId) break;
        }
      } catch (e) {
        // ignore
      }
    }

    // Send null for area_id to let backend infer a valid area id (avoids FK mismatch)
    const payload = {
      application_id: applicationId,
      area_id: null,
      file_path: storagePath,
      uploaded_at: new Date().toISOString(),
    };

    const result = await callUploadEndpoint(payload);
    console.log('API upload response:', result.status, result.text);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error', err);
    process.exit(1);
  }
})();
