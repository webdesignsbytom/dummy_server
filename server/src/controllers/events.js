// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  deleteAllEventsFromDB,
  deleteEventId,
  findAllEvents,
  findEventById,
} from '../domain/events.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';

export const getAllEvents = async (req, res) => {
  console.log('get all events');

  try {
    const foundEvents = await findAllEvents();
    console.log('found events:', foundEvents);

    if (!foundEvents) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.eventTag,
        EVENT_MESSAGES.eventNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-all-events', req.user);
    return sendDataResponse(res, 200, { events: foundEvents });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Get all events failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


export const getEventByIdHandler = async (req, res) => {
  const { eventId } = req.params;

  try {
    const eventFound = await findEventById(eventId);

    if (!eventFound) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.eventTag,
        EVENT_MESSAGES.eventNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-event-by-id', req.user);
    return sendDataResponse(res, 200, { event: eventFound });
  } catch (err) {
    console.error('Error fetching event by ID:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch event by ID`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteEventByIdHandler = async (req, res) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await deleteEventId(eventId);
    if (!deletedEvent) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.eventTag,
        EVENT_MESSAGES.deleteEventFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterEvents.emit('delete-event-by-id', req.user);
    return sendDataResponse(res, 200, { message: 'Success: Event deleted' });
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
    const deletedEvents = await deleteAllEventsFromDB();
    if (!deletedEvents) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.eventTag,
        EVENT_MESSAGES.deleteEventFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterEvents.emit('delete-all-events', req.user);
    return sendDataResponse(res, 200, {
      message: 'Success: All events Deleted',
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
