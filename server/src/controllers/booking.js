// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  checkBookingSlot,
  confirmBooking,
  createNewBooking,
  deleteBookingById,
  denyBooking,
  findAllBookings,
} from '../domain/booking.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  BadRequestEvent,
  MissingFieldEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { sendBookingNotificationEmail } from '../utils/email/emailHandler.js';
import { v4 as uuid } from 'uuid';

export const getAllBookingsHandler = async (req, res) => {
  console.log('get all bookings');

  try {
    const foundBookings = await findAllBookings();
    console.log('found bookings:', foundBookings);

    if (!foundBookings) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { bookings: foundBookings });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all bookings failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const createNewBookingHandler = async (req, res) => {
  const { time, date, fullName, phoneNumber, email } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  if (time == null || !date || !fullName || !phoneNumber || !lowerCaseEmail) {
    const missingField = new MissingFieldEvent(
      null,
      'Booking: Missing field(s) in request.'
    );
    return sendMessageResponse(res, missingField.code, missingField.message);
  }

  try {
    console.log('AAAAAAAAAAAAA');

    // Check if time slot is free
    // Create booking
    // Create email and url
    // Create appoval link
    // Send

    // Normalize date to remove time portion (UTC midnight)
    console.log('date', date);

    const bookingDate = new Date(date);
    console.log('bookingDate', bookingDate);

    bookingDate.setUTCHours(0, 0, 0, 0); // ensures just the calendar day is matched
    console.log(
      'bookingDate.setUTCHours(0, 0, 0, 0);',
      bookingDate.setUTCHours(0, 0, 0, 0)
    );

    // Check if time slot on that day is already booked
    const existingBooking = await checkBookingSlot(time, bookingDate);

    if (existingBooking) {
      return sendDataResponse(res, 409, {
        message: `Time slot ${time}:00 is already booked on ${bookingDate.toDateString()}.`,
      });
    }

    const createdBooking = await createNewBooking(
      time,
      date,
      fullName,
      phoneNumber,
      email
    );

    if (!createdBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    const uniqueString = uuid() + createdBooking.id;
    console.log('uniqueString', uniqueString);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
      return `${day}/${month}/${year}`;
    };

    // Example usage:
    const formattedDate = formatDate(date);
    console.log(formattedDate); // Output: 15/04/25

    const approveUrl = `${process.env.BOOKING_API_ROUTE}/confirm-booking/${createdBooking.id}`;
    const rejectUrl = `${process.env.BOOKING_API_ROUTE}/deny-booking/${createdBooking.id}`;

    // await createVerificationEmailHandler(userId, hashedString);
    await sendBookingNotificationEmail(
      email,
      'New Booking Notification',
      'bookingNotification',
      {
        time,
        date: formattedDate,
        fullName,
        phoneNumber,
        email,
        uniqueString,
        approveUrl,
        rejectUrl,
      }
    );

    // myEmitterUsers.emit('register', createdUser);
    return sendDataResponse(res, 201, { booking: createdBooking });
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      `Booking creation request Server error ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const confirmNewBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const confirmedBooking = await confirmBooking(bookingId);

    if (!confirmedBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.confirmBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // IF FAIL SEND EMAIL TO OWNER
    return sendDataResponse(res, 200, {
      message: 'Success: Booking confirmed',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const denyNewBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const confirmedBooking = await denyBooking(bookingId);

    if (!confirmedBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.denyBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // IF FAIL SEND EMAIL TO OWNER
    return sendDataResponse(res, 200, {
      message: 'Success: Booking denied',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteBookingHandler = async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const deletedBooking = await deleteBookingById(bookingId);

    if (!deletedBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Booking deleted',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
