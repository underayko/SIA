export { supabase } from './supabaseClient.js';
export {
	getUserById,
	getUserByEmail,
	getUserRoleByEmail,
	listUsersByRole,
	createUser,
	upsertUser,
	updateUser,
	deleteUser,
} from './users.js';

export {
	getFacultyRecordById,
	listFacultyRecords,
	listFacultyRecordsByUserId,
	createFacultyRecord,
	upsertFacultyRecord,
	updateFacultyRecord,
	deleteFacultyRecord,
} from './faculty.js';

export {
	getHrRecordById,
	listHrRecords,
	listHrRecordsByUserId,
	createHrRecord,
	upsertHrRecord,
	updateHrRecord,
	deleteHrRecord,
} from './hr.js';

export {
	getVpaaRecordById,
	listVpaaRecords,
	listVpaaRecordsByUserId,
	createVpaaRecord,
	upsertVpaaRecord,
	updateVpaaRecord,
	deleteVpaaRecord,
} from './vpaa.js';
