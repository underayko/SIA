import {
  getById,
  listByUserId,
  listAll,
  createOne,
  upsertOne,
  updateById,
  deleteById,
} from './sharedCrud.js';
import { supabase } from './supabaseClient.js';

const VPAA_TABLE_CANDIDATES = (
  process.env.VPAA_TABLE_CANDIDATES || process.env.VPAA_TABLE || 'vpaa_records,vpaa,vpaa_profiles'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

let resolvedVpaaTable = null;

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('relation') && message.includes('does not exist');
}

async function resolveVpaaTable() {
  if (resolvedVpaaTable) {
    return resolvedVpaaTable;
  }

  let lastError = null;

  for (const tableName of VPAA_TABLE_CANDIDATES) {
    const probe = await supabase.from(tableName).select('*').limit(1);
    if (probe.error) {
      lastError = probe.error;
      if (isMissingTableError(probe.error)) {
        continue;
      }
      continue;
    }

    resolvedVpaaTable = tableName;
    return resolvedVpaaTable;
  }

  if (lastError) {
    throw new Error(`Resolve VPAA table failed: ${lastError.message}`);
  }

  throw new Error('Resolve VPAA table failed: no candidate tables configured');
}

export async function getVpaaRecordById(id) {
  const table = await resolveVpaaTable();
  return getById(table, id);
}

export async function listVpaaRecords() {
  const table = await resolveVpaaTable();
  return listAll(table);
}

export async function listVpaaRecordsByUserId(userId) {
  const table = await resolveVpaaTable();
  return listByUserId(table, userId);
}

export async function createVpaaRecord(payload) {
  const table = await resolveVpaaTable();
  return createOne(table, payload);
}

export async function upsertVpaaRecord(payload, onConflict = 'id') {
  const table = await resolveVpaaTable();
  return upsertOne(table, payload, onConflict);
}

export async function updateVpaaRecord(id, updates) {
  const table = await resolveVpaaTable();
  return updateById(table, id, updates);
}

export async function deleteVpaaRecord(id) {
  const table = await resolveVpaaTable();
  return deleteById(table, id);
}
