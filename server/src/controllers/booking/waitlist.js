import {
  createWaitlistEntry,
  listWaitlistEntries,
  deleteWaitlistEntryByToken,
  adminDeleteWaitlistEntry,
} from '../../domain/booking/waitlist.js';
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

// [PUBLIC] Join waitlist for a date (no account required)
export const joinWaitlistHandler = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    resourceId,
    serviceId,
    date,   // yyyy-mm-dd or ISO
    notes,  // optional
  } = req.body;

  if (!fullName || !email || !phoneNumber || !resourceId || !serviceId || !date) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdWaitlistEntry = await createWaitlistEntry(
      fullName,
      email,
      phoneNumber,
      resourceId,
      serviceId,
      date,
      notes
    );

    if (!createdWaitlistEntry) {
      const badCreate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createBookingFail // reusing booking message bucket
      );
      myEmitterErrors.emit('error', badCreate);
      return sendMessageResponse(res, badCreate.code, badCreate.message);
    }

    myEmitterBookings.emit('join-waitlist', req.user);

    sendDataResponse(res, 201, { waitlistEntry: createdWaitlistEntry });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Join waitlist failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [PUBLIC] List waitlist (you exposed this as public)
export const listWaitlistHandler = async (req, res) => {
  try {
    const foundWaitlist = await listWaitlistEntries();

    if (!foundWaitlist || foundWaitlist.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('list-waitlist', req.user);

    sendDataResponse(res, 200, { waitlist: foundWaitlist });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'List waitlist failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [PUBLIC] Delete a waitlist entry by token
export const deleteWaitlistEntryHandler = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const deletedWaitlistEntry = await deleteWaitlistEntryByToken(token);

    if (!deletedWaitlistEntry) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('delete-waitlist-entry', req.user);

    sendDataResponse(res, 200, { message: 'Successfully deleted waitlist entry' });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Delete waitlist entry failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Delete a waitlist entry (id or token in body)
export const adminDeleteWaitlistEntryHandler = async (req, res) => {
  const { id, token } = req.body || {};

  if (!id && !token) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const deletedWaitlistEntry = await adminDeleteWaitlistEntry(id, token);

    if (!deletedWaitlistEntry) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('admin-delete-waitlist-entry', req.user);

    sendDataResponse(res, 200, { message: 'Successfully deleted waitlist entry (admin)' });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Admin delete waitlist entry failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};