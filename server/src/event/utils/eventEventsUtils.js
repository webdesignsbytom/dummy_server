import { myEmitterErrors } from '../errorEvents.js';
import { createEvent } from './events.js';

// --- ERROR CLASS ---
export class NoPermissionEvent extends Error {
  constructor(userId, message = 'Action not authorized') {
    super(message);
    this.name = 'NoPermissionEvent';
    this.userId = userId;
    this.code = 403;
  }
}

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

// --- ROLE CHECK ---
const checkDeveloperRole = (user) => {
  if (user.role !== 'DEVELOPER') {
    const notAuthorized = new NoPermissionEvent(user.id, 'Action not authorized');
    myEmitterErrors.emit('error', notAuthorized);
    throw new Error('You do not have permission to perform this action');
  }
};

// --- EVENT CREATORS ---
export const createGetAllEventsEvent = async (user) => {
  const u = normalizeUser(user);
  checkDeveloperRole(u);

  await createEvent(
    u,
    u.role,
    'Get All Events',
    `All events retrieved by ${u.id}`,
    200
  );
};

export const createDeleteEventsByIdEvent = async (user) => {
  const u = normalizeUser(user);
  checkDeveloperRole(u);

  await createEvent(
    u,
    u.role,
    'Delete Event By Id',
    `Event deleted by ${u.id}`,
    204
  );
};

export const createDeleteAllEventsEvent = async (user) => {
  const u = normalizeUser(user);
  checkDeveloperRole(u);

  await createEvent(
    u,
    u.role,
    'Delete All Events',
    `All events deleted by ${u.id}`,
    204
  );
};
