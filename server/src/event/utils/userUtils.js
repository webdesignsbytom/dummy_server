import { createEvent } from './events.js';

// Exported event creation functions
export const createGetAllEvent = async (user) => {
  await createEvent(user, 'ADMIN', 'Get all users', `Success getting all users for ${user.email}`, 200);
};

export const createGetByIdEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Get user by Id', `Success getting user with ID: ${user.id}`, 200);
};

export const createRegisterEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Register', `Register successful for ${user.email} as a ${user.role}`, 201);
};

export const createVerifyEmailEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Verify User email', `Verification successful for ${user.email} as a ${user.role}`, 201);
};

export const createNewEmailVerifyEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Verification email resend creation', `Resend verification successful for ${user.email}`, 201);
};

export const createPasswordResetEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Password Reset', `Reset password successful for ${user.email}`, 200);
};

export const createUpdateUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Updated User', `Updated user account successful for ${user.email}`, 200);
};

export const createChangeUserRoleEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Change User Role', `Changed user role for ${user.email}`, 200);
};

export const createDeleteUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Deleted User', `Account deleted successfully for ${user.email}`, 204);
};
