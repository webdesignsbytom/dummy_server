import {
  findNotificationsByBookingId,
  createNotificationForBooking,
  scheduleNotificationForBooking,
  findNotificationById,
  markNotificationForResend,
} from '../../domain/booking/notification.js';
import { myEmitterErrors } from '../../event/errorEvents.js';
import { myEmitterBookings } from '../../event/bookingEvents.js';
import {
  NotFoundEvent,
  BadRequestEvent,
  ServerErrorEvent,
} from '../../event/utils/errorUtils.js';
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../../utils/responses.js';

/* =========================
   ADMIN – Notifications
   ========================= */

// [ADMIN] List notifications for a booking
export const listNotificationsForBookingHandler = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing bookingId.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundNotifications = await findNotificationsByBookingId(bookingId);

    if (!foundNotifications) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        `Failed to find notification(s).`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('notifications:list', req.user);
    return sendDataResponse(res, 200, { notifications: foundNotifications });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `List notifications failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Send an immediate notification (confirm/cancel/etc.)
export const sendNotificationHandler = async (req, res) => {
  const { bookingId } = req.params;
  const {
    channel,          // 'EMAIL' | 'SMS' | 'PUSH' ...
    toEmail = null,
    toPhone = null,
    subject = null,
    templateKey = null,
    body = null,
    meta = {},        // optional payload/extensions
  } = req.body || {};

  if (!bookingId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing bookingId.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if (!channel || (!toEmail && !toPhone)) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing channel or recipient.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdNotification = await createNotificationForBooking(bookingId, {
      channel,
      toEmail,
      toPhone,
      subject,
      templateKey,
      body,
      meta,
      // immediate send semantics
      status: 'QUEUED',
      sendAt: new Date(),
    });

    if (!createdNotification) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Failed to create notification.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('notifications:send', req.user);
    return sendDataResponse(res, 201, { notification: createdNotification });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Send notification failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Schedule a reminder (sets sendAt)
export const scheduleReminderHandler = async (req, res) => {
  const { bookingId } = req.params;
  const {
    sendAt,           // ISO timestamp for future send
    channel,
    toEmail = null,
    toPhone = null,
    subject = null,
    templateKey = null,
    body = null,
    meta = {},
  } = req.body || {};

  if (!bookingId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing bookingId.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if (!sendAt || !channel || (!toEmail && !toPhone)) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing sendAt, channel or recipient.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  const parsed = new Date(sendAt);
  if (Number.isNaN(parsed.getTime())) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Invalid sendAt value.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const scheduledNotification = await scheduleNotificationForBooking(
      bookingId,
      {
        channel,
        toEmail,
        toPhone,
        subject,
        templateKey,
        body,
        meta,
        status: 'SCHEDULED',
        sendAt: parsed,
      }
    );

    if (!scheduledNotification) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Failed to schedule notification.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('notifications:schedule-reminder', req.user);
    return sendDataResponse(res, 201, { notification: scheduledNotification });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Schedule reminder failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Re-send a notification
export const resendNotificationHandler = async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing notificationId.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundNotification = await findNotificationById(notificationId);

    if (!foundNotification) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        `Failed to find notification.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedNotification = await markNotificationForResend(notificationId);

    if (!updatedNotification) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Failed to queue notification for resend.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('notifications:resend', req.user);
    return sendDataResponse(res, 200, { notification: updatedNotification });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Resend notification failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
