import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllEvent,
  createGetByIdEvent,
  createRegisterEvent,
  createVerifyEmailEvent,
  createNewEmailVerifyEvent,
  createPasswordResetEvent,
  createUpdateUserEvent,
  createChangeUserRoleEvent,
  createDeleteUserEvent,
} from './utils/userUtils.js';

export const myEmitterUsers = myEmitter;

const safe = (fn) => async (user) => {
  try {
    await fn(user);
  } catch (e) {
    console.error('[myEmitterUsers] listener error:', e);
  }
};

myEmitterUsers.on('get-all-users', safe(createGetAllEvent));
myEmitterUsers.on('get-user-by-id', safe(createGetByIdEvent));
myEmitterUsers.on('register', safe(createRegisterEvent));
myEmitterUsers.on('verified-email', safe(createVerifyEmailEvent));
myEmitterUsers.on('resend-verification', safe(createNewEmailVerifyEvent));
myEmitterUsers.on('verification-email-created', safe(createNewEmailVerifyEvent));
myEmitterUsers.on('password-reset-request', safe(createPasswordResetEvent));
myEmitterUsers.on('update-user-data', safe(createUpdateUserEvent));
myEmitterUsers.on('change-user-role', safe(createChangeUserRoleEvent));
myEmitterUsers.on('deleted-user', safe(createDeleteUserEvent));
