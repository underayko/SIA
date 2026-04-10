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

const HR_TABLE_CANDIDATES = (
  process.env.HR_TABLE_CANDIDATES || process.env.HR_TABLE || 'hr_records,hr,hr_profiles'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

let resolvedHrTable = null;

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('relation') && message.includes('does not exist');
}

async function resolveHrTable() {
  if (resolvedHrTable) {
    return resolvedHrTable;
  }

  let lastError = null;

  for (const tableName of HR_TABLE_CANDIDATES) {
    const probe = await supabase.from(tableName).select('*').limit(1);
    if (probe.error) {
      lastError = probe.error;
      if (isMissingTableError(probe.error)) {
        continue;
      }
      continue;
    }

    resolvedHrTable = tableName;
    return resolvedHrTable;
  }

  if (lastError) {
    throw new Error(`Resolve HR table failed: ${lastError.message}`);
  }

  throw new Error('Resolve HR table failed: no candidate tables configured');
}

export async function getHrRecordById(id) {
  const table = await resolveHrTable();
  return getById(table, id);
}

export async function listHrRecords() {
  const table = await resolveHrTable();
  return listAll(table);
}

export async function listHrRecordsByUserId(userId) {
  const table = await resolveHrTable();
  return listByUserId(table, userId);
}

export async function createHrRecord(payload) {
  const table = await resolveHrTable();
  return createOne(table, payload);
}

export async function upsertHrRecord(payload, onConflict = 'id') {
  const table = await resolveHrTable();
  return upsertOne(table, payload, onConflict);
}

export async function updateHrRecord(id, updates) {
  const table = await resolveHrTable();
  return updateById(table, id, updates);
}

export async function deleteHrRecord(id) {
  const table = await resolveHrTable();
  return deleteById(table, id);
}
