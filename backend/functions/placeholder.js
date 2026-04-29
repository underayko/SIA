import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
	console.log('This backend package only exports Supabase helper functions. Run npm run dev in the frontend folder to start the app.');
}

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
