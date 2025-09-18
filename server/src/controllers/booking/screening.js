import {
  upsertUserScreening,
  findUserScreeningByBookingId,
} from '../../domain/booking/screening.js';
import { findUserBookingById } from '../../domain/booking/booking.js';
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

/* =========================================================
   [AUTH] Attach/update screening responses for my booking
   PUT /user/:bookingId/screening
   Body: { answers: object, notes?: string }
   ========================================================= */
export const upsertScreeningHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { answers, notes } = req.body || {};

  if (!bookingId || !answers || typeof answers !== 'object') {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundBooking = await findUserBookingById(bookingId, req.user);

    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const upsertedScreening = await upsertUserScreening(bookingId, answers, notes);

    if (!upsertedScreening) {
      const badUpdate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingFail
      );
      myEmitterErrors.emit('error', badUpdate);
      return sendMessageResponse(res, badUpdate.code, badUpdate.message);
    }

    myEmitterBookings.emit('upsert-my-screening', req.user);

    sendDataResponse(res, 200, { screening: upsertedScreening });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Upsert screening failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =============================================
   [AUTH] Get my screening responses
   GET /user/:bookingId/screening
   ============================================= */
export const getScreeningHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundBooking = await findUserBookingById(bookingId, req.user);

    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundScreening = await findUserScreeningByBookingId(bookingId);

    if (!foundScreening) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.verificationNotFound // closest generic "not found" message in your file
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('get-my-screening', req.user);

    sendDataResponse(res, 200, { screening: foundScreening });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get screening failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

