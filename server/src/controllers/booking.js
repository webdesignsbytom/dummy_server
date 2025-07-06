import bcrypt from 'bcrypt';
// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  cancelBooking,
  checkBookingSlot,
  confirmBooking,
  createClosedDay,
  createNewBooking,
  deleteAllBookings,
  deleteBookingById,
  deleteClosedDayByDate,
  denyBooking,
  findActiveBookings,
  findAllBookings,
  findBookingById,
  findBookingsByDate,
  findBookingsByEmail,
  findBookingsForDay,
  findDaysClosed,
  findOpeningTimesAsObject,
  updateBookingUniqueString,
  updateOpeningTimes,
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
import { sendBookingEmail } from '../services/email/emailHandler.js';
import { v4 as uuid } from 'uuid';

export const getAllBookingsHandler = async (req, res) => {
  try {
    const foundBookings = await findActiveBookings();
    if (!foundBookings) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundOpeningTimes = await findOpeningTimesAsObject();

    if (!foundOpeningTimes) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.openingTimesNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundClosedDays = await findDaysClosed();
    if (!foundClosedDays) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.closedDaysNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, {
      bookings: foundBookings,
      openingTimes: foundOpeningTimes,
      closedDays: foundClosedDays,
    });
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

export const getAllBookingsAdminHandler = async (req, res) => {
  try {
    const foundBookings = await findAllBookings();

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

export const getBookingByIdHandler = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await findBookingById(bookingId);

    if (!booking) {
      const notFound = new NotFoundEvent(
        req.user,
        `Booking with ID ${bookingId} not found.`,
        `No booking found for the given ID.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { booking });
  } catch (err) {
    console.error('Error fetching booking by ID:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch booking by ID`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getBookingsByDateHandler = async (req, res) => {
  const { date } = req.params;

  try {
    const bookings = await findBookingsByDate(date);

    if (!bookings || bookings.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        `No bookings found for date: ${date}`,
        `No bookings exist for the selected date.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { bookings });
  } catch (err) {
    console.error('Error fetching bookings by date:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch bookings by date`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getBookingsByEmailHandler = async (req, res) => {
  const { email } = req.params;

  try {
    const bookings = await findBookingsByEmail(email);

    if (!bookings || bookings.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        `No bookings found for email: ${email}`,
        `No bookings exist for the provided email address.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { bookings });
  } catch (err) {
    console.error('Error fetching bookings by email:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch bookings by email`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getTodaysBookingsHandler = async (req, res) => {
  try {
    const today = new Date();

    // Set the time to midnight UTC (00:00:00)
    today.setUTCHours(0, 0, 0, 0);

    const foundBookings = await findBookingsForDay(today);

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

  if (time == null || !date || !fullName || !phoneNumber || !email) {
    const missingField = new MissingFieldEvent(
      null,
      'Booking: Missing field(s) in request.'
    );
    return sendMessageResponse(res, missingField.code, missingField.message);
  }

  const lowerCaseEmail = email.toLowerCase();

  try {
    const bookingDate = new Date(date);

    bookingDate.setUTCHours(0, 0, 0, 0); // ensures just the calendar day is matched

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
      lowerCaseEmail
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
    const hashedString = await bcrypt.hash(uniqueString, 10);

    // Create database verification item
    const newVerificationString = await updateBookingUniqueString(
      createdBooking.id,
      hashedString
    );

    if (!newVerificationString) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingString
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
      return `${day}/${month}/${year}`;
    };

    // Example usage:
    const formattedDate = formatDate(date);
    // console.log(formattedDate); // Output: 15/04/25

    const approveUrl = `${process.env.BOOKING_API_APPROVE}/${uniqueString}/${createdBooking.id}`;
    const rejectUrl = `${process.env.BOOKING_API_REJECT}/${uniqueString}/${createdBooking.id}`;
    console.log('approveUrl', approveUrl);
    console.log('rejectUrl', rejectUrl);
    
    const notificationSent = await sendBookingEmail(
      process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
      'New Booking Notification',
      'bookingNotification',
      {
        time,
        date: formattedDate,
        fullName,
        phoneNumber,
        email,
        approveUrl,
        rejectUrl,
      }
    );

    if (!notificationSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.notificationSendingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    const bookingRecivedSent = await sendBookingEmail(
      email,
      'New Booking Notification',
      'bookingRecieved',
      {
        time,
        date: formattedDate,
        fullName,
        phoneNumber,
        email,
      }
    );

    if (!bookingRecivedSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

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
  console.log('🔔 confirmNewBookingHandler CALLED');

  const { bookingId } = req.params;
  const { uniqueString } = req.body;

  console.log('📥 Incoming params:', { bookingId });
  console.log('📥 Incoming body:', { uniqueString });

  if (!bookingId) {
    console.log('❗ Missing bookingId');
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  if (!uniqueString) {
    console.log('❗ Missing uniqueString');
    return sendDataResponse(res, 409, {
      message: `Unique string is missing.`,
    });
  }

  try {
    console.log('🔎 Searching for booking by ID:', bookingId);
    const foundBooking = await findBookingById(bookingId);
    console.log('📄 Found booking:', foundBooking);

    if (!foundBooking) {
      console.log('❗ Booking not found');
      const notFound = new BadRequestEvent(
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (!foundBooking.uniqueString) {
      console.log('❗ Booking found but missing confirmation string in DB');
      return sendMessageResponse(res, 401, 'Missing confirmation string');
    }

    console.log(
      '🔑 Comparing provided unique string with hashed string in booking...'
    );
    const isValid = await bcrypt.compare(
      uniqueString,
      foundBooking.uniqueString
    );

    console.log('✅ Unique string comparison result:', isValid);

    if (!isValid) {
      console.log('❗ Provided unique string is invalid or expired');
      return sendMessageResponse(
        res,
        401,
        'Invalid or expired confirmation string'
      );
    }

    console.log('📝 Confirming booking...');
    const confirmedBooking = await confirmBooking(bookingId);
    console.log('✅ Booking confirmed:', confirmedBooking);

    if (!confirmedBooking) {
      console.log('❗ Booking confirmation failed');
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.confirmBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    console.log('📧 Sending owner confirmation email...');
    const ownerConfirmationEmailSent = await sendBookingEmail(
      process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
      'New Booking Approved',
      'bookingApprovedOwner',
      {
        time: confirmedBooking.time,
        date: confirmedBooking.date,
        fullName: confirmedBooking.fullName,
        phoneNumber: confirmedBooking.phoneNumber,
        email: confirmedBooking.email,
        uniqueString: confirmedBooking.id,
      }
    );

    console.log(
      '📤 Owner confirmation email sent:',
      ownerConfirmationEmailSent
    );

    if (!ownerConfirmationEmailSent) {
      console.log(
        '❗ Owner confirmation email failed to send, sending failure notification...'
      );
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerConfirmationEmailFailedToSend = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'New Booking Approval Failed',
        'sendBookingConfirmationFailed',
        {
          time: confirmedBooking.time,
          date: confirmedBooking.date,
          fullName: confirmedBooking.fullName,
          phoneNumber: confirmedBooking.phoneNumber,
          email: confirmedBooking.email,
          uniqueString: confirmedBooking.id,
        }
      );

      console.log(
        '📤 Owner failure notification email sent:',
        ownerConfirmationEmailFailedToSend
      );

      if (!ownerConfirmationEmailFailedToSend) {
        console.log('❗ Failed to send owner failure notification email');
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.confirmBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    console.log('📧 Sending customer confirmation email...');
    const customerConfirmationEmailSent = await sendBookingEmail(
      confirmedBooking.email,
      'Booking Confirmed',
      'bookingApprovedCustomer',
      {
        time: confirmedBooking.time,
        date: confirmedBooking.date,
        fullName: confirmedBooking.fullName,
        phoneNumber: confirmedBooking.phoneNumber,
        email: confirmedBooking.email,
        uniqueString: confirmedBooking.id,
      }
    );

    console.log(
      '📤 Customer confirmation email sent:',
      customerConfirmationEmailSent
    );

    if (!customerConfirmationEmailSent) {
      console.log(
        '❗ Customer confirmation email failed, sending owner alert...'
      );
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerConfirmationEmailFailedToSend = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'New Booking Approval Confirmation Email Failed',
        'bookingApprovedCustomerFailed',
        {
          time: confirmedBooking.time,
          date: confirmedBooking.date,
          fullName: confirmedBooking.fullName,
          phoneNumber: confirmedBooking.phoneNumber,
          email: confirmedBooking.email,
          uniqueString: confirmedBooking.id,
        }
      );

      console.log(
        '📤 Owner alert for failed customer confirmation email sent:',
        ownerConfirmationEmailFailedToSend
      );

      if (!ownerConfirmationEmailFailedToSend) {
        console.log(
          '❗ Failed to send owner alert for customer confirmation failure'
        );
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.confirmBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    console.log('✅ Booking confirmation process completed successfully');
    return sendDataResponse(res, 200, {
      message: 'Success: Booking confirmed',
    });
  } catch (err) {
    console.log('🔥 Error during booking confirmation:', err);
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const denyNewBookingHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { uniqueString } = req.body;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }
  if (!uniqueString) {
    return sendDataResponse(res, 409, {
      message: `Unique string is missing.`,
    });
  }

  try {
    const foundBooking = await findBookingById(bookingId);

    if (!foundBooking) {
      const notFound = new BadRequestEvent(
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (!foundBooking.uniqueString) {
      return sendMessageResponse(res, 401, 'Missing confirmation string');
    }

    const isValid = await bcrypt.compare(
      uniqueString,
      foundBooking.uniqueString
    );

    console.log('IS VALID', isValid);

    if (!isValid) {
      return sendMessageResponse(
        res,
        401,
        'Invalid or expired confirmation string'
      );
    }

    const deniedBooking = await denyBooking(bookingId);

    if (!deniedBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.denyBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // Notify Owner: Booking Denied
    const ownerRejectionEmailSent = await sendBookingEmail(
      process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
      'Booking Denied',
      'bookingDeniedOwner',
      {
        time: deniedBooking.time,
        date: deniedBooking.date,
        fullName: deniedBooking.fullName,
        phoneNumber: deniedBooking.phoneNumber,
        email: deniedBooking.email,
        uniqueString: deniedBooking.id,
      }
    );

    if (!ownerRejectionEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerRejectionFailedToSend = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'Booking Denial Notification Failed',
        'sendBookingDenialFailed',
        {
          time: deniedBooking.time,
          date: deniedBooking.date,
          fullName: deniedBooking.fullName,
          phoneNumber: deniedBooking.phoneNumber,
          email: deniedBooking.email,
          uniqueString: deniedBooking.id,
        }
      );

      if (!ownerRejectionFailedToSend) {
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.denyBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // Notify Customer: Booking Denied
    const customerRejectionEmailSent = await sendBookingEmail(
      deniedBooking.email,
      'Booking Denied',
      'bookingDeniedCustomer',
      {
        time: deniedBooking.time,
        date: deniedBooking.date,
        fullName: deniedBooking.fullName,
        phoneNumber: deniedBooking.phoneNumber,
        email: deniedBooking.email,
        uniqueString: deniedBooking.id,
      }
    );

    if (!customerRejectionEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const rejectionFailedToNotifyOwner = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'Booking Denial Customer Notification Failed',
        'bookingDeniedCustomerFailed',
        {
          time: deniedBooking.time,
          date: deniedBooking.date,
          fullName: deniedBooking.fullName,
          phoneNumber: deniedBooking.phoneNumber,
          email: deniedBooking.email,
          uniqueString: deniedBooking.id,
        }
      );

      if (!rejectionFailedToNotifyOwner) {
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.denyBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Booking denied',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Deny booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const cancelBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const foundBooking = await findBookingById(bookingId);

    if (!foundBooking) {
      const notFound = new BadRequestEvent(
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const cancelledBooking = await cancelBooking(bookingId);

    if (!cancelledBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.denyBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // Notify Owner: Booking Denied
    const ownerCancellationEmailSent = await sendBookingEmail(
      process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
      'Booking Cancelled',
      'bookingCancelledOwner',
      {
        time: cancelledBooking.time,
        date: cancelledBooking.date,
        fullName: cancelledBooking.fullName,
        phoneNumber: cancelledBooking.phoneNumber,
        email: cancelledBooking.email,
        uniqueString: cancelledBooking.id,
      }
    );

    if (!ownerCancellationEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerCancellationFailedToSend = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'Booking Denial Notification Failed',
        'bookingCancelledFailed',
        {
          time: cancelledBooking.time,
          date: cancelledBooking.date,
          fullName: cancelledBooking.fullName,
          phoneNumber: cancelledBooking.phoneNumber,
          email: cancelledBooking.email,
          uniqueString: cancelledBooking.id,
        }
      );

      if (!ownerCancellationFailedToSend) {
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.denyBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // Notify Customer: Booking Denied
    const customerRejectionEmailSent = await sendBookingEmail(
      cancelledBooking.email,
      'Booking Cancelled',
      'bookingCancelledCustomer',
      {
        time: cancelledBooking.time,
        date: cancelledBooking.date,
        fullName: cancelledBooking.fullName,
        phoneNumber: cancelledBooking.phoneNumber,
        email: cancelledBooking.email,
        uniqueString: cancelledBooking.id,
      }
    );

    if (!customerRejectionEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const rejectionFailedToNotifyOwner = await sendBookingEmail(
        process.env.BOOKING_ADMIN_RECIEVER_EMAIL,
        'Booking Cancelled Customer Notification Failed',
        'bookingCancelledCustomerFailed',
        {
          time: cancelledBooking.time,
          date: cancelledBooking.date,
          fullName: cancelledBooking.fullName,
          phoneNumber: cancelledBooking.phoneNumber,
          email: cancelledBooking.email,
          uniqueString: cancelledBooking.id,
        }
      );

      if (!rejectionFailedToNotifyOwner) {
        const notCreated = new BadRequestEvent(
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.denyBookingFail
        );
        myEmitterErrors.emit('error', notCreated);
        return sendMessageResponse(res, notCreated.code, notCreated.message);
      }

      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Booking Cancelled',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Cancel booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const editBookingHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { date, time, fullName, phoneNumber, email } = req.body;

  console.log('Editing bookingId:', bookingId);

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    // Update booking in database
    const updatedBooking = await updateBooking(bookingId, {
      date,
      time,
      fullName,
      phoneNumber,
      email,
    });

    if (!updatedBooking) {
      const notUpdated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateBookingFail
      );
      myEmitterErrors.emit('error', notUpdated);
      return sendMessageResponse(res, notUpdated.code, notUpdated.message);
    }

    // Notify Owner: Booking Updated
    const ownerUpdateEmailSent = await sendBookingEmail(
      process.env.BOOKING_RECEIVER_EMAIL,
      'Booking Updated',
      'bookingUpdatedOwner',
      {
        date: updatedBooking.date,
        time: updatedBooking.time,
        fullName: updatedBooking.fullName,
        phoneNumber: updatedBooking.phoneNumber,
        email: updatedBooking.email,
        uniqueString: updatedBooking.id,
      }
    );

    if (!ownerUpdateEmailSent) {
      const ownerEmailFail = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.sendOwnerUpdateFail
      );
      myEmitterErrors.emit('error', ownerEmailFail);
      return sendMessageResponse(
        res,
        ownerEmailFail.code,
        ownerEmailFail.message
      );
    }

    // Notify Customer: Booking Updated
    const customerUpdateEmailSent = await sendBookingEmail(
      updatedBooking.email,
      'Your Booking Has Been Updated',
      'bookingUpdatedCustomer',
      {
        date: updatedBooking.date,
        time: updatedBooking.time,
        fullName: updatedBooking.fullName,
        phoneNumber: updatedBooking.phoneNumber,
        email: updatedBooking.email,
        uniqueString: updatedBooking.id,
      }
    );

    if (!customerUpdateEmailSent) {
      const customerEmailFail = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.sendCustomerUpdateFail
      );
      myEmitterErrors.emit('error', customerEmailFail);
      return sendMessageResponse(
        res,
        customerEmailFail.code,
        customerEmailFail.message
      );
    }

    return sendDataResponse(res, 200, {
      booking: updatedBooking,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Edit booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const foundBooking = await findBookingById(bookingId);

    if (!foundBooking) {
      const notFound = new BadRequestEvent(
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.bookingNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

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

export const deleteAllBookingHandler = async (req, res) => {
  try {
    const deletedBookings = await deleteAllBookings();

    if (!deletedBookings) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Bookings deleted',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete booking failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const setDayClosedHandler = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      return sendMessageResponse(res, 400, 'Date and reason are required.');
    }

    // Save the closed day
    const newClosedDay = await createClosedDay(date, reason);

    if (!newClosedDay) {
      const notCreated = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.closedDayFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 201, {
      message: 'Closed day successfully added.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Set day off failed.');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const undoDayOffHandler = async (req, res) => {
  const { date } = req.params;

  console.log('date', date);

  if (!date) {
    return sendMessageResponse(res, 400, 'Date is required.');
  }
  try {
    // Try delete the closed day by date
    const deletedClosedDay = await deleteClosedDayByDate(date);

    if (!deletedClosedDay) {
      const notDeleted = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.closedDayNotdeleted
      );
      myEmitterErrors.emit('error', notDeleted);
      return sendMessageResponse(res, notDeleted.code, notDeleted.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Closed day successfully removed.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Undo day off failed.');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const editOpeningTimesHandler = async (req, res) => {
  const { dayOfWeek, open, start, end } = req.body;

  try {
    if (typeof open !== 'boolean' || !start || !end || !dayOfWeek) {
      return sendMessageResponse(
        res,
        400,
        'Day, open status, start time, and end time are required.'
      );
    }

    // Update the opening times for the given day
    const updatedOpeningTime = await updateOpeningTimes(
      dayOfWeek,
      open,
      start,
      end
    );

    if (!updatedOpeningTime) {
      const notUpdated = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.openingTimeFail
      );
      myEmitterErrors.emit('error', notUpdated);
      return sendMessageResponse(res, notUpdated.code, notUpdated.message);
    }

    const foundOpeningTimes = await findOpeningTimesAsObject();

    if (!foundOpeningTimes) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.openingTimesNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, {
      updatedTimes: foundOpeningTimes,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Edit opening times failed.'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
