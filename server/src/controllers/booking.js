// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  checkBookingSlot,
  createNewBooking,
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

    // const uniqueString = uuid() + userId;
    // const hashedString = await bcrypt.hash(uniqueString, 10);

    // await createVerificationEmailHandler(userId, hashedString);
    // await sendVerificationEmail(userId, createdUser.email, uniqueString);

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

// export const deleteEventByIdHandler = async (req, res) => {
//   const { eventId } = req.params;

//   try {
//     const deletedEvent = await deleteEventId(eventId);

//     myEmitterEvents.emit('delete-event-by-id', req.user);
//     return sendDataResponse(res, 200, { event: deletedEvent });
//   } catch (err) {
//     //
//     const serverError = new ServerErrorEvent(req.user, `Delete event by id failed`);
//     myEmitterErrors.emit('error', serverError);
//     sendMessageResponse(res, serverError.code, serverError.message);
//     throw err;
//   }
// };

// export const deleteAllEventsHandler = async (req, res) => {
//   try {
//     await deleteAllEventsFromDB();

//     myEmitterEvents.emit('delete-all-events', req.user);
//     return sendDataResponse(res, 200, {
//       events: 'Success: All events Deleted',
//     });
//   } catch (err) {
//     //
//     const serverError = new ServerErrorEvent(
//       req.user,
//       `Delete all events failed`
//     );
//     myEmitterErrors.emit('error', serverError);
//     sendMessageResponse(res, serverError.code, serverError.message);
//     throw err;
//   }
// };
