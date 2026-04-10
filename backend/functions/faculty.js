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

const FACULTY_TABLE_CANDIDATES = (
  process.env.FACULTY_TABLE_CANDIDATES || process.env.FACULTY_TABLE || 'faculty_records,faculty,faculty_profiles'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

let resolvedFacultyTable = null;

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('relation') && message.includes('does not exist');
}

async function resolveFacultyTable() {
  if (resolvedFacultyTable) {
    return resolvedFacultyTable;
  }

  let lastError = null;

  for (const tableName of FACULTY_TABLE_CANDIDATES) {
    const probe = await supabase.from(tableName).select('*').limit(1);
    if (probe.error) {
      lastError = probe.error;
      if (isMissingTableError(probe.error)) {
        continue;
      }
      continue;
    }

    resolvedFacultyTable = tableName;
    return resolvedFacultyTable;
  }

  if (lastError) {
    throw new Error(`Resolve faculty table failed: ${lastError.message}`);
  }

  throw new Error('Resolve faculty table failed: no candidate tables configured');
}

export async function getFacultyRecordById(id) {
  const table = await resolveFacultyTable();
  return getById(table, id);
}

export async function listFacultyRecords() {
  const table = await resolveFacultyTable();
  return listAll(table);
}

export async function listFacultyRecordsByUserId(userId) {
  const table = await resolveFacultyTable();
  return listByUserId(table, userId);
}

export async function createFacultyRecord(payload) {
  const table = await resolveFacultyTable();
  return createOne(table, payload);
}

export async function upsertFacultyRecord(payload, onConflict = 'id') {
  const table = await resolveFacultyTable();
  return upsertOne(table, payload, onConflict);
}

export async function updateFacultyRecord(id, updates) {
  const table = await resolveFacultyTable();
  return updateById(table, id, updates);
}

export async function deleteFacultyRecord(id) {
  const table = await resolveFacultyTable();
  return deleteById(table, id);
}
