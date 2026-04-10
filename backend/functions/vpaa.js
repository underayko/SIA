import {
  getById,
  listByUserId,
  listAll,
  createOne,
  upsertOne,
  updateById,
  deleteById,
} from './sharedCrud.js';

const VPAA_TABLE = 'vpaa_records';

export function getVpaaRecordById(id) {
  return getById(VPAA_TABLE, id);
}

export function listVpaaRecords() {
  return listAll(VPAA_TABLE);
}

export function listVpaaRecordsByUserId(userId) {
  return listByUserId(VPAA_TABLE, userId);
}

export function createVpaaRecord(payload) {
  return createOne(VPAA_TABLE, payload);
}

export function upsertVpaaRecord(payload, onConflict = 'id') {
  return upsertOne(VPAA_TABLE, payload, onConflict);
}

export function updateVpaaRecord(id, updates) {
  return updateById(VPAA_TABLE, id, updates);
}

export function deleteVpaaRecord(id) {
  return deleteById(VPAA_TABLE, id);
}
