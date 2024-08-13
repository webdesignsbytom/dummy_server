import { myEmitter } from '../utils/eventEmitter.js';
// Error events
import { createGenericErrorEvent, createLoginErrorEvent, createResendVerifyErrorEvent } from './utils/errorUtils.js'

export const myEmitterErrors = myEmitter

// General
myEmitterErrors.on('error', async (error) => createGenericErrorEvent(error));
// User
myEmitterErrors.on('error-login', async (error) => createLoginErrorEvent(error));
myEmitterErrors.on('verification-not-found', async (error) => createResendVerifyErrorEvent(error));
