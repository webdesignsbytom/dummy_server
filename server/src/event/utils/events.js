import dbClient from '../../utils/dbClient.js';
// Emitters
import { myEmitterErrors } from '../errorEvents.js';
import { CreateEventError } from './errorUtils.js';

export const createEvent = async (user, type, topic, content, code) => {
  try {
    await dbClient.event.create({
      data: {
        type,
        topic,
        content,
        createdById: user.id,
        code,
      },
    });
  } catch (err) {
    const error = new CreateEventError(user.id, topic);
    myEmitterErrors.emit('error', error);
    throw err;
  }
};

export const createErrorEvent = async (errorEvent, additionalContent = '') => {
  let userId = null; // Default value for userId
  let codeId = 'Unknown';

  try {
    userId = errorEvent.user?.id || null;
    codeId = errorEvent.code || 'Unknown';
    const content = `${errorEvent.code} ${errorEvent.message} ${additionalContent}`;

    await dbClient.event.create({
      data: {
        type: 'ERROR',
        topic: errorEvent.topic,
        content: content,
        receivedById: userId,
        code: codeId,
      },
    });
  } catch (err) {
    const error = new CreateEventError(userId, errorEvent.topic);
    myEmitterErrors.emit('error', error);
    throw err;
  }
};
