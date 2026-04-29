import dotenv from 'dotenv';
import { supabase } from './functions/supabaseClient.js';
dotenv.config();

const candidates = (process.env.SUPABASE_AREA_SUBMISSION_TABLE_CANDIDATES || 'area_submissions,areasubmissions,submissions')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

async function probe(table) {
  try {
    const res = await supabase.from(table).select('*').limit(1).maybeSingle();
    if (res.error) {
      console.log(`Table ${table} probe error:`, res.error.message || res.error);
      return false;
    }

    if (!res.data) {
      console.log(`Table ${table} exists but returned no rows.`);
      return true;
    }

    console.log(`\nTable: ${table} — returned row keys:`);
    const keys = Object.keys(res.data);
    for (const k of keys) console.log('  -', k);
    return true;
  } catch (e) {
    console.error(`Error probing ${table}:`, e.message || e);
    return false;
  }
}

(async () => {
  for (const t of candidates) {
    if (!t) continue;
    await probe(t);
  }
  console.log('\nDone.');
  process.exit(0);
})();
