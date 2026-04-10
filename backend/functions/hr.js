import {
  getById,
  listByUserId,
  listAll,
  createOne,
  upsertOne,
  updateById,
  deleteById,
} from './sharedCrud.js';

const HR_TABLE = 'hr_records';

export function getHrRecordById(id) {
  return getById(HR_TABLE, id);
}

export function listHrRecords() {
  return listAll(HR_TABLE);
}

export function listHrRecordsByUserId(userId) {
  return listByUserId(HR_TABLE, userId);
}

export function createHrRecord(payload) {
  return createOne(HR_TABLE, payload);
}

export function upsertHrRecord(payload, onConflict = 'id') {
  return upsertOne(HR_TABLE, payload, onConflict);
}

export function updateHrRecord(id, updates) {
  return updateById(HR_TABLE, id, updates);
}

export function deleteHrRecord(id) {
  return deleteById(HR_TABLE, id);
}
