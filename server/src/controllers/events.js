// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  deleteAllEventsFromDB,
  deleteEventId,
  findAllEvents,
} from '../domain/events.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  NotFoundEvent,
  ServerErrorEvent,
  MissingFieldEvent,
  RegistrationServerErrorEvent,
} from '../event/utils/errorUtils.js';

export const getAllEvents = async (req, res) => {
  console.log('get all events');

  try {
    const foundEvents = await findAllEvents();
    console.log('found events:', foundEvents);

    if (!foundEvents) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.eventTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // // myEmitterEvents.emit('get-all-events', req.user);
    return sendDataResponse(res, 200, { events: foundEvents });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Get all events failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteEventByIdHandler = async (req, res) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await deleteEventId(eventId);

    myEmitterEvents.emit('delete-event-by-id', req.user);
    return sendDataResponse(res, 200, { event: deletedEvent });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete event by id failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteAllEventsHandler = async (req, res) => {
  try {
    await deleteAllEventsFromDB();

    myEmitterEvents.emit('delete-all-events', req.user);
    return sendDataResponse(res, 200, {
      events: 'Success: All events Deleted',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete all events failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
