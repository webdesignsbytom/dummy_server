import { myEmitter } from '../utils/eventEmitter.js';
import { createGenericErrorEvent } from './utils/errorUtils.js';

export const myEmitterErrors = myEmitter;

const safe = (fn) => async (error) => {
  try {
    await fn(error);
  } catch (e) {
    console.error('[myEmitterErrors] listener error:', e);
  }
};

// General errors
myEmitterErrors.on('error', safe(createGenericErrorEvent));
