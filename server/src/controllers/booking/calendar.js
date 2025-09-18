import {
  findCalendarsByResourceId,
  createCalendarConnection,
  findCalendarById,
  deleteCalendarConnection,
  triggerManualCalendarSync,
  recordGoogleCalendarWebhookEvent,
} from '../../domain/booking/calendar.js';
import { myEmitterErrors } from '../../event/errorEvents.js';
import { myEmitterBookings } from '../../event/bookingEvents.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../../event/utils/errorUtils.js';
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../../utils/responses.js';

/* =========================
   ADMIN – Calendars
   ========================= */

// [ADMIN] List connected calendars for a resource
export const listCalendarsHandler = async (req, res) => {
  const { resourceId } = req.params;

  if (!resourceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Missing resourceId.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundCalendars = await findCalendarsByResourceId(resourceId);

    if (!foundCalendars) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Failed to find calendars.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('calendars:list', req.user);
    return sendDataResponse(res, 200, { calendars: foundCalendars });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'List calendars failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Connect a calendar
export const connectCalendarHandler = async (req, res) => {
  const { resourceId } = req.params;
  const { provider, externalId, label = null, meta = {} } = req.body || {};

  if (!resourceId || !provider || !externalId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Missing resourceId, provider or externalId.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdCalendar = await createCalendarConnection(resourceId, {
      provider,
      externalId,
      label,
      meta,
    });

    if (!createdCalendar) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Failed to connect calendar.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('calendars:connect', req.user);
    return sendDataResponse(res, 201, { calendar: createdCalendar });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Connect calendar failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Disconnect a calendar
export const disconnectCalendarHandler = async (req, res) => {
  const { resourceId, calendarId } = req.params;

  if (!resourceId || !calendarId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Missing resourceId or calendarId.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundCalendar = await findCalendarById(calendarId, resourceId);

    if (!foundCalendar) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Failed to find calendar.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedCalendar = await deleteCalendarConnection(calendarId, resourceId);

    if (!deletedCalendar) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Failed to disconnect calendar.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('calendars:disconnect', req.user);
    return sendDataResponse(res, 200, { message: 'Calendar disconnected.' });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Disconnect calendar failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Trigger a manual calendar sync
export const triggerCalendarSyncHandler = async (req, res) => {
  const { resourceId, calendarId } = req.params;

  if (!resourceId || !calendarId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Missing resourceId or calendarId.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundCalendar = await findCalendarById(calendarId, resourceId);

    if (!foundCalendar) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Failed to find calendar.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedCalendar = await triggerManualCalendarSync(calendarId);

    if (!updatedCalendar) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Failed to trigger sync.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('calendars:sync', req.user);
    return sendDataResponse(res, 200, { calendar: updatedCalendar });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Trigger calendar sync failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   PUBLIC – Google webhook
   ========================= */

export const googleCalendarWebhookHandler = async (req, res) => {
  try {
    const createdWebhookEvent = await recordGoogleCalendarWebhookEvent(
      req.headers,
      req.body
    );

    if (!createdWebhookEvent) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Failed to record webhook event.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('webhooks:google-calendar', req.user);
    // Acknowledge quickly so Google doesn’t retry
    return sendDataResponse(res, 202, { received: true });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Google webhook failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
