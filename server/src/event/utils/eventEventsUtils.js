// Error events
import { myEmitterErrors } from '../errorEvents.js';
import { NoPermissionEvent } from './errorUtils.js';
import { createEvent } from './events.js';

const checkDeveloperRole = (user) => {
  if (user.role !== 'DEVELOPER') {
    const notAuthorized = new NoPermissionEvent(
      user.id,
      'Action not authorized'
    );
    myEmitterErrors.emit('error', notAuthorized);
    throw new Error('You do not have permission to perform this action');
  }
};

export const createGetAllEventsEvent = async (user) => {
  checkDeveloperRole(user); // Use the utility function for role check

  const type = user.role;
  await createEvent(
    user,
    type,
    'Get All Events',
    `All events retrieved by ${user.id}`,
    200
  );
};

export const createDeleteEventsByIdEvent = async (user) => {
  checkDeveloperRole(user); // Use the utility function for role check

  const type = user.role;
  await createEvent(user, type, 'Delete event by id', `Event deleted`, 204);
};

export const createDeleteAllEventsEvent = async (user) => {
  checkDeveloperRole(user); // Use the utility function for role check

  const type = user.role;
  await createEvent(
    user,
    type,
    'Delete All Events',
    `All events deleted by ${user.id}`,
    204
  );
};
