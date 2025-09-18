import {
  createBookingHold,
  findBookingByToken,
  findBookingByIdAndToken,
  confirmBookingByIdAndToken,
  cancelBookingByIdAndToken,
  findAllBookingsAdmin,
  findBookingHistoryByBookingId,
  updateBookingStatusAdmin,
  deleteBookingByIdAdmin,
  deleteAllBookingsAdmin,findUserBookingById, listUserBookings
} from '../../domain/booking/booking.js';
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

// [PUBLIC] Create a booking HOLD (PENDING) and return bookingId + token
export const createBookingHoldHandler = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    resourceId,
    serviceId,
    date, // ISO date (yyyy-mm-dd) or full ISO string
    time, // minutes-from-midnight or "HH:mm"
    notes, // optional
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !resourceId ||
    !serviceId ||
    !date ||
    !time
  ) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdBooking = await createBookingHold(
      fullName,
      email,
      phoneNumber,
      resourceId,
      serviceId,
      date,
      time,
      notes
    );

    if (!createdBooking) {
      const badCreate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createBookingFail
      );
      myEmitterErrors.emit('error', badCreate);
      return sendMessageResponse(res, badCreate.code, badCreate.message);
    }

    myEmitterBookings.emit('create-booking-hold', req.user);

    sendDataResponse(res, 201, {
      booking: createdBooking, // contains id + token
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Create booking hold failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [PUBLIC-TOKEN] View booking via emailed UUID token (no account)
export const getBookingByTokenHandler = async (req, res) => {
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
    const foundBooking = await findBookingByToken(token);

    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('view-booking-by-token', req.user);

    sendDataResponse(res, 200, { booking: foundBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get booking by token failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [PUBLIC-TOKEN] Confirm booking via tokenized link
export const confirmBookingByTokenHandler = async (req, res) => {
  const { bookingId, token } = req.params;

  if (!bookingId || !token) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundBooking = await findBookingByIdAndToken(bookingId, token);

    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedBooking = await confirmBookingByIdAndToken(bookingId, token);

    if (!updatedBooking) {
      const badUpdate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.confirmBookingFail
      );
      myEmitterErrors.emit('error', badUpdate);
      return sendMessageResponse(res, badUpdate.code, badUpdate.message);
    }

    myEmitterBookings.emit('confirm-booking-by-token', req.user);

    sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Confirm booking by token failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [PUBLIC-TOKEN] Cancel booking via tokenized link
export const cancelBookingByTokenHandler = async (req, res) => {
  const { bookingId, token } = req.params;

  if (!bookingId || !token) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundBooking = await findBookingByIdAndToken(bookingId, token);

    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedBooking = await cancelBookingByIdAndToken(bookingId, token);

    if (!updatedBooking) {
      const badUpdate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingFail
      );
      myEmitterErrors.emit('error', badUpdate);
      return sendMessageResponse(res, badUpdate.code, badUpdate.message);
    }

    myEmitterBookings.emit('cancel-booking-by-token', req.user);

    sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Cancel booking by token failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [AUTH] List my bookings (server scopes by auth/email)
export const listBookingsHandler = async (req, res) => {
  try {
    const foundBookings = await listUserBookings(req.user);

    if (!foundBookings || foundBookings.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('list-my-bookings', req.user);

    sendDataResponse(res, 200, { bookings: foundBookings });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'List my bookings failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [AUTH] View a single booking I own
export const getBookingHandler = async (req, res) => {
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

    myEmitterBookings.emit('get-my-booking', req.user);

    sendDataResponse(res, 200, { booking: foundBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get my booking failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [AUTH] Reschedule my booking (ownership enforced here)
export const rescheduleBookingHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { startAt, notes } = req.body; // ISO datetime; notes optional

  if (!bookingId || !startAt) {
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

    const updatedBooking = await rescheduleUserBooking(
      bookingId,
      startAt,
      notes
    );

    if (!updatedBooking) {
      const badUpdate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingFail
      );
      myEmitterErrors.emit('error', badUpdate);
      return sendMessageResponse(res, badUpdate.code, badUpdate.message);
    }

    myEmitterBookings.emit('reschedule-my-booking', req.user);

    sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Reschedule booking failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [AUTH] Cancel my booking (client self-cancel)
export const cancelBookingHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { cancelledReason } = req.body || {};

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

    const cancelledBooking = await cancelUserBooking(
      bookingId,
      cancelledReason
    );

    if (!cancelledBooking) {
      const badCancel = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.cancelBookingFail
      );
      myEmitterErrors.emit('error', badCancel);
      return sendMessageResponse(res, badCancel.code, badCancel.message);
    }

    myEmitterBookings.emit('cancel-my-booking', req.user);

    sendDataResponse(res, 200, { booking: cancelledBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Cancel booking failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   ADMIN – Bookings
   ========================= */

// [ADMIN] List all bookings (filters: resourceId, date range, status, email)
export const listBookingsAdminHandler = async (req, res) => {
  const { resourceId, status, email, fromDate, toDate } = req.query;

  try {
    const foundBookings = await findAllBookingsAdmin({
      resourceId,
      status,
      email,
      fromDate,
      toDate,
    });

    if (!foundBookings || foundBookings.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('admin:bookings:list', req.user);
    return sendDataResponse(res, 200, { bookings: foundBookings });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `List all bookings failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] View booking history/audit
export const getBookingHistoryHandler = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const foundBooking = await findBookingById(bookingId);
    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundHistory = await findBookingHistoryByBookingId(bookingId);
    if (!foundHistory || foundHistory.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        `Failed to find booking history.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('admin:bookings:history', req.user);
    return sendDataResponse(res, 200, { history: foundHistory });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Get booking history failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Confirm a booking (operator action)
export const confirmBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const foundBooking = await findBookingById(bookingId);
    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedBooking = await updateBookingStatusAdmin(bookingId, {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      cancelledReason: null,
      deniedReason: null,
    });

    if (!updatedBooking) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.confirmBookingFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('admin:bookings:confirm', req.user);
    return sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Confirm booking failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Deny a booking (operator action)
export const denyBookingHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { deniedReason = null } = req.body || {};

  try {
    const foundBooking = await findBookingById(bookingId);
    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedBooking = await updateBookingStatusAdmin(bookingId, {
      status: 'DENIED',
      deniedReason,
    });

    if (!updatedBooking) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.denyBookingFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('admin:bookings:deny', req.user);
    return sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Deny booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Cancel a booking (operator action; can set cancelledReason)
export const cancelBookingAdminHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { cancelledReason = null } = req.body || {};

  try {
    const foundBooking = await findBookingById(bookingId);
    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedBooking = await updateBookingStatusAdmin(bookingId, {
      status: 'CANCELLED',
      cancelledReason,
    });

    if (!updatedBooking) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('admin:bookings:cancel', req.user);
    return sendDataResponse(res, 200, { booking: updatedBooking });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Cancel booking (admin) failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Delete a booking row (hard delete)
export const deleteBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const foundBooking = await findBookingById(bookingId);
    if (!foundBooking) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedBooking = await deleteBookingByIdAdmin(bookingId);
    if (!deletedBooking) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteBookingFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('admin:bookings:delete', req.user);
    return sendDataResponse(res, 200, {
      message: `Successfully deleted booking`,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Delete ALL bookings (danger!)
export const deleteAllBookingsHandler = async (req, res) => {
  try {
    const deleted = await deleteAllBookingsAdmin();

    if (!deleted) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteBookingFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('admin:bookings:delete-all', req.user);
    return sendDataResponse(res, 200, {
      message: `Successfully deleted all bookings`,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete all bookings failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
