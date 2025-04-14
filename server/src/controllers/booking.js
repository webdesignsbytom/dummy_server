// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  checkBookingSlot,
  confirmBooking,
  createNewBooking,
  deleteAllBookings,
  deleteBookingById,
  denyBooking,
  findAllBookings,
  findBookingsByDate,
  findBookingsByEmail,
  findBookingsForDay,
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
import {
  sendBookingConfirmationFailed,
  sendBookingConfirmedEmailToCustomer,
  sendBookingConfirmedEmailToOwner,
  sendBookingEmail,
  sendBookingNotificationEmail,
  sendBookingRequestRecievedEmail,
} from '../utils/email/emailHandler.js';
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

    // Only keep time and date for each booking
    const shortBookings = foundBookings.map((booking) => ({
      time: booking.time,
      date: booking.date,
    }));

    return sendDataResponse(res, 200, { bookings: shortBookings });
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

export const getBookingByIdHandler = async (req, res) => {
  const { bookingId } = req.params;
  console.log(`Fetching booking with ID: ${bookingId}`);

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
  console.log(`Fetching bookings for date: ${date}`);

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
  console.log(`Fetching bookings for email: ${email}`);

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
  console.log('get all bookings');

  try {
    const today = new Date();

    // Set the time to midnight UTC (00:00:00)
    today.setUTCHours(0, 0, 0, 0);

    const foundBookings = await findBookingsForDay(today);

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

    const approveUrl = `${process.env.BOOKING_API_APPROVE}/${createdBooking.id}`;
    const rejectUrl = `${process.env.BOOKING_API_REJECT}/${createdBooking.id}`;
    console.log('approveUrl', approveUrl);
    console.log('rejectUrl', rejectUrl);

    const notificationSent = await sendBookingNotificationEmail(
      process.env.BOOKING_RECIEVER_EMAIL,
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

    if (!notificationSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.notificationSendingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    const bookingRecivedSent = await sendBookingRequestRecievedEmail(
      email,
      'New Booking Notification',
      'bookingRecieved',
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
  const { bookingId } = req.params;
  console.log('bookingId', bookingId);

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const confirmedBooking = await confirmBooking(bookingId);
    console.log('confirmedBooking', confirmedBooking);

    if (!confirmedBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.confirmBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    const ownerConfirmationEmailSent = await sendBookingConfirmedEmailToOwner(
      process.env.BOOKING_RECIEVER_EMAIL, // Owner's email here
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

    // Failed to send confirmation to owner
    if (!ownerConfirmationEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerConfirmationEmailFailedToSend =
        await sendBookingConfirmationFailed(
          process.env.BOOKING_RECIEVER_EMAIL, // Owner's email here
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

      if (!ownerConfirmationEmailFailedToSend) {
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

    // Send confirmation to customer
    const customerConfirmationEmailSent =
      await sendBookingConfirmedEmailToCustomer(
        confirmedBooking.email, // Customers's email here
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

    // Failed to send confirmation to owner
    if (!customerConfirmationEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerConfirmationEmailFailedToSend =
        await sendBookingConfirmationFailed(
          process.env.BOOKING_RECIEVER_EMAIL, // Owner's email here
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

      if (!ownerConfirmationEmailFailedToSend) {
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
  console.log('bookingId', bookingId);

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const deniedBooking = await denyBooking(bookingId);
    console.log('deniedBooking', deniedBooking);

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
      process.env.BOOKING_RECIEVER_EMAIL,
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
        process.env.BOOKING_RECIEVER_EMAIL,
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
        process.env.BOOKING_RECIEVER_EMAIL,
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
  console.log('bookingId', bookingId);

  if (!bookingId) {
    return sendDataResponse(res, 409, {
      message: `Booking ID is missing.`,
    });
  }

  try {
    const cancelledBooking = await denyBooking(bookingId);
    console.log('cancelledBooking', cancelledBooking);

    if (!cancelledBooking) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.denyBookingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    // Notify Owner: Booking Denied
    const ownerRejectionEmailSent = await sendBookingEmail(
      process.env.BOOKING_RECIEVER_EMAIL,
      'Booking Denied',
      'bookingDeniedOwner',
      {
        time: cancelledBooking.time,
        date: cancelledBooking.date,
        fullName: cancelledBooking.fullName,
        phoneNumber: cancelledBooking.phoneNumber,
        email: cancelledBooking.email,
        uniqueString: cancelledBooking.id,
      }
    );

    if (!ownerRejectionEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.recievedBookingSendingFail
      );

      const ownerRejectionFailedToSend = await sendBookingEmail(
        process.env.BOOKING_RECIEVER_EMAIL,
        'Booking Denial Notification Failed',
        'sendBookingDenialFailed',
        {
          time: cancelledBooking.time,
          date: cancelledBooking.date,
          fullName: cancelledBooking.fullName,
          phoneNumber: cancelledBooking.phoneNumber,
          email: cancelledBooking.email,
          uniqueString: cancelledBooking.id,
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
      cancelledBooking.email,
      'Booking Denied',
      'bookingDeniedCustomer',
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
        process.env.BOOKING_RECIEVER_EMAIL,
        'Booking Denial Customer Notification Failed',
        'bookingDeniedCustomerFailed',
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
      message: 'Success: Booking denied',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Deny booking failed`);
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

    // Done ✅
    return sendDataResponse(res, 200, {
      message: 'Success: Booking updated',
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
