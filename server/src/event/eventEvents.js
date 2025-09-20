import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllEventsEvent,
  createDeleteEventsByIdEvent,
  createDeleteAllEventsEvent,
  createGetByIdEvent,
} from './utils/eventEventsUtils.js';

export const myEmitterEvents = myEmitter;

const safe = (fn) => async (user) => {
  try {
    await fn(user);
  } catch (e) {
    console.error('[myEmitterEvents] listener error:', e);
  }
};

myEmitterEvents.on('get-all-events', safe(createGetAllEventsEvent));
myEmitterEvents.on('get-event-by-id', safe(createGetByIdEvent));
myEmitterEvents.on('delete-event-by-id', safe(createDeleteEventsByIdEvent));
myEmitterEvents.on('delete-all-events', safe(createDeleteAllEventsEvent));
