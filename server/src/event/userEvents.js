import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllEvent,
  createRegisterEvent,
  createVerifyEmailEvent,
  createNewEmailVerifyEvent,
  createPasswordResetEvent,
  createDeleteUserEvent,
  createUpdateUserEvent,
  createGetByIdEvent
} from './utils/userUtils.js';

export const myEmitterUsers = myEmitter;

// Event listeners for user events
myEmitterUsers.on('get-all-users', async (user) => createGetAllEvent(user));
myEmitterUsers.on('get-user-by-id', async (user) => createGetByIdEvent(user));
myEmitterUsers.on('register', async (user) => createRegisterEvent(user));
myEmitterUsers.on('verified-email', async (user) => createVerifyEmailEvent(user));
myEmitterUsers.on('resend-verification', async (user) => createNewEmailVerifyEvent(user));
myEmitterUsers.on('verification-email-created', async (user) => createNewEmailVerifyEvent(user));
myEmitterUsers.on('password-reset-request', async (user) => createPasswordResetEvent(user));
myEmitterUsers.on('update-user-data', async (user) => createUpdateUserEvent(user));
myEmitterUsers.on('change-user-role', async (user) => createChangeUserRoleEvent(user));
myEmitterUsers.on('deleted-user', async (user) => createDeleteUserEvent(user));
