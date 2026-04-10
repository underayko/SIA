import { supabase } from './supabaseClient.js';

function ensureValue(value, name) {
  if (!value || String(value).trim() === '') {
    throw new Error(`${name} is required`);
  }
}

function ensurePayload(payload, name = 'payload') {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`${name} must be an object`);
  }
}

function unwrap(result, actionLabel) {
  const { data, error } = result;
  if (error) {
    throw new Error(`${actionLabel} failed: ${error.message}`);
  }
  return data;
}

export async function getById(table, id) {
  ensureValue(table, 'table');
  ensureValue(id, 'id');

  const result = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  return unwrap(result, `Get ${table} by id`);
}

export async function listByUserId(table, userId) {
  ensureValue(table, 'table');
  ensureValue(userId, 'userId');

  const result = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return unwrap(result, `List ${table} by user_id`);
}

export async function listAll(table) {
  ensureValue(table, 'table');

  const result = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  return unwrap(result, `List ${table}`);
}

export async function createOne(table, payload) {
  ensureValue(table, 'table');
  ensurePayload(payload);

  const result = await supabase.from(table).insert([payload]).select().single();
  return unwrap(result, `Create ${table}`);
}

export async function upsertOne(table, payload, onConflict = 'id') {
  ensureValue(table, 'table');
  ensurePayload(payload);

  const result = await supabase
    .from(table)
    .upsert([payload], { onConflict })
    .select()
    .single();

  return unwrap(result, `Upsert ${table}`);
}

export async function updateById(table, id, updates) {
  ensureValue(table, 'table');
  ensureValue(id, 'id');
  ensurePayload(updates, 'updates');

  const result = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return unwrap(result, `Update ${table}`);
}

export async function deleteById(table, id) {
  ensureValue(table, 'table');
  ensureValue(id, 'id');

  const result = await supabase.from(table).delete().eq('id', id).select().single();
  return unwrap(result, `Delete ${table}`);
}
