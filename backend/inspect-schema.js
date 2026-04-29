import dotenv from 'dotenv';
import { supabase } from './functions/supabaseClient.js';
dotenv.config();

const candidates = (process.env.SUPABASE_AREA_SUBMISSION_TABLE_CANDIDATES || 'area_submissions,areasubmissions,submissions')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

async function inspectTable(table) {
  try {
    const cols = await supabase
      .from('information_schema.columns')
      .select('column_name,data_type,is_nullable,ordinal_position')
      .eq('table_name', table)
      .eq('table_schema', 'public')
      .order('ordinal_position', { ascending: true });

    if (!cols.error && Array.isArray(cols.data) && cols.data.length > 0) {
      console.log(`\nTable: ${table}`);
      for (const c of cols.data) {
        console.log(`  - ${c.column_name} : ${c.data_type} (${c.is_nullable})`);
      }
      return true;
    }

    // If no rows returned, attempt a probe select to see if table exists
    const probe = await supabase.from(table).select('*').limit(1);
    if (!probe.error) {
      console.log(`\nTable: ${table} exists but has no columns returned from information_schema (unexpected).`);
      return true;
    }

    console.log(`\nTable: ${table} not found or inaccessible.`);
    return false;
  } catch (e) {
    console.error('Error inspecting', table, e.message || e);
    return false;
  }
}

(async () => {
  console.log('Probing candidate tables for area submissions...');
  for (const t of candidates) {
    // skip empty
    if (!t) continue;
    await inspectTable(t);
  }
  console.log('\nDone.');
  process.exit(0);
})();
