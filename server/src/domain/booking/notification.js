import dbClient from '../../utils/dbClient.js';

// [ADMIN] List notifications for a booking
export const findNotificationsByBookingId = (bookingId) =>
  dbClient.notification.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  });

// [ADMIN] Create an immediate notification (queued now)
export const createNotificationForBooking = (bookingId, data) =>
  dbClient.notification.create({
    data: {
      bookingId,
      channel: data.channel,
      toEmail: data.toEmail,
      toPhone: data.toPhone,
      subject: data.subject,
      templateKey: data.templateKey,
      body: data.body,
      meta: data.meta ?? {},
      status: data.status ?? 'QUEUED',
      sendAt: data.sendAt ?? new Date(),
    },
  });

// [ADMIN] Schedule a notification for the future
export const scheduleNotificationForBooking = (bookingId, data) =>
  dbClient.notification.create({
    data: {
      bookingId,
      channel: data.channel,
      toEmail: data.toEmail,
      toPhone: data.toPhone,
      subject: data.subject,
      templateKey: data.templateKey,
      body: data.body,
      meta: data.meta ?? {},
      status: data.status ?? 'SCHEDULED',
      sendAt: data.sendAt, // validated in controller
    },
  });

// [SHARED] Find notification by id
export const findNotificationById = (notificationId) =>
  dbClient.notification.findFirst({
    where: { id: notificationId },
  });

// [ADMIN] Mark notification for resend (queue again now)
export const markNotificationForResend = (notificationId) =>
  dbClient.notification.update({
    where: { id: notificationId },
    data: {
      status: 'QUEUED',
      sendAt: new Date(),
      resendCount: { increment: 1 },
      // Optional: clear any previous error details if you store them
      lastError: null,
    },
  });
