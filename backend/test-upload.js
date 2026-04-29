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

    const signed = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600);

    if (signed.error) {
      console.error('Signed URL error:', signed.error.message || signed.error);
      process.exit(1);
    }

    console.log('Signed URL:', signed.data.signedUrl);

    // Try inserting a metadata row into area_submissions if the table exists
    try {
      // Try to obtain an existing application_id from common candidate tables
      const appCandidates = (process.env.SUPABASE_APPLICATION_TABLE_CANDIDATES || 'applications,ranking_applications,faculty_applications')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      let applicationId = null;
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

      if (!applicationId) {
        console.warn('No application_id found in candidate application tables; skipping DB insert (table requires non-null application_id).');
      } else {
        // Find a valid area_id from candidate area tables to satisfy FK
        const areaCandidates = (process.env.SUPABASE_AREA_TABLE_CANDIDATES || 'areas,ranking_areas,area_definitions')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        let validAreaId = null;
        for (const t of areaCandidates) {
          try {
            const probe = await supabase.from(t).select('*').limit(1).maybeSingle();
            if (!probe.error && probe.data) {
              validAreaId = probe.data.id || probe.data.area_id || probe.data.code || probe.data.area_code || null;
              if (validAreaId) break;
            }
          } catch (e) {
            // ignore
          }
        }

        if (!validAreaId) {
          console.warn('No valid area_id found; skipping DB insert that requires a valid FK.');
        } else {
          const payload = {
            area_id: validAreaId,
            application_id: applicationId,
            file_path: storagePath,
            uploaded_at: new Date().toISOString(),
          };

          const insertResult = await supabase
            .from('area_submissions')
            .insert([payload])
            .select('*')
            .maybeSingle();

          if (insertResult.error) {
            console.warn('Insert row warning (non-fatal):', insertResult.error.message || insertResult.error);
          } else {
            console.log('Inserted submission row:', insertResult.data);
          }
        }
      }
    } catch (e) {
      console.warn('Insert attempt failed (ignored):', e.message || e);
    }

    console.log('Test upload complete.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error', err);
    process.exit(1);
  }
})();
