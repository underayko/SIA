import { supabase } from './supabaseClient.js';

const USERS_TABLE_CANDIDATES = (
  process.env.USERS_TABLE_CANDIDATES || process.env.USERS_TABLE || 'users,profiles,accounts,user_accounts'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const USER_ID_COLUMN = process.env.USERS_ID_COLUMN || 'id';
const USER_ID_COLUMNS = [USER_ID_COLUMN, 'id', 'user_id', 'uid']
  .filter((value, index, arr) => arr.indexOf(value) === index);

const USER_ROLE_COLUMN = process.env.USERS_ROLE_COLUMN || 'role';
const USER_ROLE_COLUMNS = [
  USER_ROLE_COLUMN,
  'role',
  'user_role',
  'account_role',
  'portal_role',
]
  .filter((value, index, arr) => arr.indexOf(value) === index);
const USER_EMAIL_COLUMNS = (process.env.USERS_EMAIL_COLUMNS || 'email,gc_email,user_email')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const UPSERT_CONFLICT_COLUMN = process.env.USERS_UPSERT_CONFLICT_COLUMN || USER_EMAIL_COLUMNS[0] || 'email';

let resolvedUsersTable = null;

function ensureValue(value, fieldName) {
  if (!value || String(value).trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
}

function unwrapSingle(result, actionLabel) {
  const { data, error } = result;
  if (error) {
    throw new Error(`${actionLabel} failed: ${error.message}`);
  }
  return data;
}

function isMissingColumnError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('column') && message.includes('does not exist');
}

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('relation') && message.includes('does not exist');
}

async function resolveUsersTable() {
  if (resolvedUsersTable) {
    return resolvedUsersTable;
  }

  let lastError = null;

  for (const tableName of USERS_TABLE_CANDIDATES) {
    const probe = await supabase.from(tableName).select('*').limit(1);
    if (probe.error) {
      lastError = probe.error;
      if (isMissingTableError(probe.error)) {
        continue;
      }
      continue;
    }

    resolvedUsersTable = tableName;
    return resolvedUsersTable;
  }

  if (lastError) {
    throw new Error(`Resolve users table failed: ${lastError.message}`);
  }

  throw new Error('Resolve users table failed: no candidate tables configured');
}

async function findUserByEmail(email) {
  const usersTable = await resolveUsersTable();
  let lastError = null;
  let hadSuccessfulQuery = false;
  let missingColumnErrors = 0;

  for (const columnName of USER_EMAIL_COLUMNS) {
    const result = await supabase
      .from(usersTable)
      .select('*')
      .eq(columnName, email)
      .maybeSingle();

    if (result.error) {
      // Keep trying because the column might not exist in this schema.
      lastError = result.error;
      if (String(result.error.message).includes('column') && String(result.error.message).includes('does not exist')) {
        missingColumnErrors += 1;
      }
      continue;
    }

    hadSuccessfulQuery = true;
    if (result.data) {
      return result.data;
    }
  }

  if (hadSuccessfulQuery) {
    return null;
  }

  if (missingColumnErrors === USER_EMAIL_COLUMNS.length) {
    return null;
  }

  if (lastError) {
    throw new Error(`Get user by email failed: ${lastError.message}`);
  }

  throw new Error('Get user by email failed: no valid email columns configured');
}

export async function getUserById(id) {
  ensureValue(id, 'id');
  const usersTable = await resolveUsersTable();

  let lastError = null;
  for (const idColumn of USER_ID_COLUMNS) {
    const result = await supabase
      .from(usersTable)
      .select('*')
      .eq(idColumn, id)
      .maybeSingle();

    if (result.error) {
      lastError = result.error;
      if (isMissingColumnError(result.error)) {
        continue;
      }
      throw new Error(`Get user by id failed: ${result.error.message}`);
    }

    return result.data;
  }

  if (lastError) {
    throw new Error(`Get user by id failed: ${lastError.message}`);
  }

  return null;
}

export async function getUserByEmail(email) {
  ensureValue(email, 'email');
  return findUserByEmail(email);
}

export async function getUserRoleByEmail(email) {
  ensureValue(email, 'email');

  const row = await findUserByEmail(email);
  if (!row) {
    return null;
  }

  const roleColumn = USER_ROLE_COLUMNS.find((columnName) => row[columnName] != null);
  return roleColumn ? row[roleColumn] : null;
}

export async function listUsersByRole(role) {
  ensureValue(role, 'role');
  const usersTable = await resolveUsersTable();

  let lastError = null;
  for (const roleColumn of USER_ROLE_COLUMNS) {
    const result = await supabase
      .from(usersTable)
      .select('*')
      .eq(roleColumn, role)
      .order('created_at', { ascending: false });

    if (result.error) {
      lastError = result.error;
      if (isMissingColumnError(result.error)) {
        continue;
      }
      throw new Error(`List users by role failed: ${result.error.message}`);
    }

    return result.data;
  }

  if (lastError) {
    throw new Error(`List users by role failed: ${lastError.message}`);
  }

  return [];
}

export async function createUser(userPayload) {
  if (!userPayload || typeof userPayload !== 'object') {
    throw new Error('userPayload is required');
  }
  const usersTable = await resolveUsersTable();

  const result = await supabase
    .from(usersTable)
    .insert([userPayload])
    .select()
    .single();

  return unwrapSingle(result, 'Create user');
}

export async function upsertUser(userPayload, onConflict = UPSERT_CONFLICT_COLUMN) {
  if (!userPayload || typeof userPayload !== 'object') {
    throw new Error('userPayload is required');
  }
  const usersTable = await resolveUsersTable();

  const result = await supabase
    .from(usersTable)
    .upsert([userPayload], { onConflict })
    .select()
    .single();

  return unwrapSingle(result, 'Upsert user');
}

export async function updateUser(id, updates) {
  ensureValue(id, 'id');
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    throw new Error('updates object is required');
  }
  const usersTable = await resolveUsersTable();

  let lastError = null;
  for (const idColumn of USER_ID_COLUMNS) {
    const result = await supabase
      .from(usersTable)
      .update(updates)
      .eq(idColumn, id)
      .select()
      .single();

    if (result.error) {
      lastError = result.error;
      if (isMissingColumnError(result.error)) {
        continue;
      }
      throw new Error(`Update user failed: ${result.error.message}`);
    }

    return result.data;
  }

  if (lastError) {
    throw new Error(`Update user failed: ${lastError.message}`);
  }

  return null;
}

export async function deleteUser(id) {
  ensureValue(id, 'id');
  const usersTable = await resolveUsersTable();

  let lastError = null;
  for (const idColumn of USER_ID_COLUMNS) {
    const result = await supabase
      .from(usersTable)
      .delete()
      .eq(idColumn, id)
      .select()
      .single();

    if (result.error) {
      lastError = result.error;
      if (isMissingColumnError(result.error)) {
        continue;
      }
      throw new Error(`Delete user failed: ${result.error.message}`);
    }

    return result.data;
  }

  if (lastError) {
    throw new Error(`Delete user failed: ${lastError.message}`);
  }

  return null;
}
