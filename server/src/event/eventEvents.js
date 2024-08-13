import { myEmitter } from '../utils/eventEmitter.js';
import {
    createDeleteAllEventsEvent,
    createDeleteEventsByIdEvent,
    createGetAllEventsEvent,
} from './utils/eventEventsUtils.js';

export const myEmitterEvents = myEmitter;

myEmitterEvents.on('get-all-events', async (user) => createGetAllEventsEvent(user));
myEmitterEvents.on('delete-event-by-id', async (user) => createDeleteEventsByIdEvent(user));
myEmitterEvents.on('delete-all-events', async (user) => createDeleteAllEventsEvent(user));
