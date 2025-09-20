import { createEvent } from './events.js';

// --- SAFE HELPERS ---
const normalizeUser = (user) => {
  if (user && typeof user === 'object') {
    return {
      id: user.id ?? null,
      email: user.email ?? 'anonymous',
      role: user.role ?? 'USER',
    };
  }
  return { id: null, email: 'anonymous', role: 'USER' };
};

// --- USER EVENT CREATORS ---
export const createGetAllEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, 'ADMIN', 'Get All Users', `Success getting all users for ${u.email}`, 200);
};

export const createGetByIdEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get User By Id', `Success getting user with ID: ${u.id}`, 200);
};

export const createRegisterEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Register', `Register successful for ${u.email} as a ${u.role}`, 201);
};

export const createVerifyEmailEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Verify User Email', `Verification successful for ${u.email} as a ${u.role}`, 201);
};

export const createNewEmailVerifyEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Verification Email Resend', `Resend verification successful for ${u.email}`, 201);
};

export const createPasswordResetEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Password Reset', `Reset password successful for ${u.email}`, 200);
};

export const createUpdateUserEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Update User', `Updated user account successful for ${u.email}`, 200);
};

export const createChangeUserRoleEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Change User Role', `Changed user role for ${u.email}`, 200);
};

export const createDeleteUserEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Delete User', `Account deleted successfully for ${u.email}`, 204);
};
