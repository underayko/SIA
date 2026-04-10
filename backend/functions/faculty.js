import {
  getById,
  listByUserId,
  listAll,
  createOne,
  upsertOne,
  updateById,
  deleteById,
} from './sharedCrud.js';

const FACULTY_TABLE = 'faculty_records';

export function getFacultyRecordById(id) {
  return getById(FACULTY_TABLE, id);
}

export function listFacultyRecords() {
  return listAll(FACULTY_TABLE);
}

export function listFacultyRecordsByUserId(userId) {
  return listByUserId(FACULTY_TABLE, userId);
}

export function createFacultyRecord(payload) {
  return createOne(FACULTY_TABLE, payload);
}

export function upsertFacultyRecord(payload, onConflict = 'id') {
  return upsertOne(FACULTY_TABLE, payload, onConflict);
}

export function updateFacultyRecord(id, updates) {
  return updateById(FACULTY_TABLE, id, updates);
}

export function deleteFacultyRecord(id) {
  return deleteById(FACULTY_TABLE, id);
}
