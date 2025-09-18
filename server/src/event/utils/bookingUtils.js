import { createEvent } from './events.js';

// --- SAFE HELPERS ---
const normalizeUser = (user) => {
  if (user && typeof user === 'object') {
    return {
      id: user.id ?? null,
      email: user.email ?? 'anonymous',
      role: user.role ?? 'USER',
    };
  }
  return { id: null, email: 'anonymous', role: 'USER' };
};

const logEvent = async (user, action, message, status = 200) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, action, `${message} (${u.email})`, status);
};

// =====================
// PUBLIC
// =====================
export const createGetAvailableDaysEvent = (u) =>
  logEvent(u, 'Get Available Days', 'Success getting available days');

export const createGetAvailableSlotsEvent = (u) =>
  logEvent(u, 'Get Available Slots', 'Success getting available slots');

export const createCreateBookingHoldEvent = (u) =>
  logEvent(u, 'Create Booking Hold', 'Booking hold created', 201);

export const createGetBookingByTokenEvent = (u) =>
  logEvent(u, 'Get Booking By Token', 'Success getting booking (token)');

export const createConfirmBookingByTokenEvent = (u) =>
  logEvent(u, 'Confirm Booking By Token', 'Booking confirmed (token)');

export const createCancelBookingByTokenEvent = (u) =>
  logEvent(u, 'Cancel Booking By Token', 'Booking cancelled (token)');

export const createJoinWaitlistEvent = (u) =>
  logEvent(u, 'Join Waitlist', 'Waitlist joined', 201);

export const createListWaitlistEvent = (u) =>
  logEvent(u, 'List Waitlist', 'Success listing waitlist');

export const createDeleteWaitlistEntryEvent = (u) =>
  logEvent(u, 'Delete Waitlist Entry', 'Waitlist entry deleted');

// =====================
// AUTH (customer)
// =====================
export const createListMyBookingsEvent = (u) =>
  logEvent(u, 'List My Bookings', 'Success listing my bookings');

export const createGetMyBookingEvent = (u) =>
  logEvent(u, 'Get My Booking', 'Success getting my booking');

export const createRescheduleMyBookingEvent = (u) =>
  logEvent(u, 'Reschedule My Booking', 'Booking rescheduled');

export const createCancelMyBookingEvent = (u) =>
  logEvent(u, 'Cancel My Booking', 'Booking cancelled');

export const createUpsertScreeningEvent = (u) =>
  logEvent(u, 'Upsert Screening', 'Screening upserted');

export const createGetScreeningEvent = (u) =>
  logEvent(u, 'Get Screening', 'Success getting screening');

export const createCreatePaymentForBookingEvent = (u) =>
  logEvent(u, 'Create Payment', 'Payment created', 201);

export const createListPaymentsForBookingEvent = (u) =>
  logEvent(u, 'List Payments', 'Success listing payments');

// =====================
// ADMIN – Resources
// =====================
export const createListResourcesEvent = (u) =>
  logEvent(u, 'List Resources', 'Success listing resources');

export const createGetResourceEvent = (u) =>
  logEvent(u, 'Get Resource', 'Success getting resource');

export const createCreateResourceEvent = (u) =>
  logEvent(u, 'Create Resource', 'Resource created', 201);

export const createUpdateResourceEvent = (u) =>
  logEvent(u, 'Update Resource', 'Resource updated');

export const createDeleteResourceEvent = (u) =>
  logEvent(u, 'Delete Resource', 'Resource deleted');

export const createAttachTagsToResourceEvent = (u) =>
  logEvent(u, 'Attach Tags To Resource', 'Tags attached');

export const createDetachTagFromResourceEvent = (u) =>
  logEvent(u, 'Detach Tag From Resource', 'Tag detached');

// =====================
// ADMIN – Services
// =====================
export const createListServicesEvent = (u) =>
  logEvent(u, 'List Services', 'Success listing services');

export const createGetServiceEvent = (u) =>
  logEvent(u, 'Get Service', 'Success getting service');

export const createCreateServiceEvent = (u) =>
  logEvent(u, 'Create Service', 'Service created', 201);

export const createUpdateServiceEvent = (u) =>
  logEvent(u, 'Update Service', 'Service updated');

export const createDeleteServiceEvent = (u) =>
  logEvent(u, 'Delete Service', 'Service deleted');

// =====================
// ADMIN – Availability mgmt
// =====================
export const createListRulesEvent = (u) =>
  logEvent(u, 'List Rules', 'Success listing rules');

export const createCreateRuleEvent = (u) =>
  logEvent(u, 'Create Rule', 'Rule created', 201);

export const createUpdateRuleEvent = (u) =>
  logEvent(u, 'Update Rule', 'Rule updated');

export const createDeleteRuleEvent = (u) =>
  logEvent(u, 'Delete Rule', 'Rule deleted');

export const createListWindowsEvent = (u) =>
  logEvent(u, 'List Dated Windows', 'Success listing dated windows');

export const createCreateWindowEvent = (u) =>
  logEvent(u, 'Create Dated Window', 'Dated window created', 201);

export const createUpdateWindowEvent = (u) =>
  logEvent(u, 'Update Dated Window', 'Dated window updated');

export const createDeleteWindowEvent = (u) =>
  logEvent(u, 'Delete Dated Window', 'Dated window deleted');

export const createListExceptionsEvent = (u) =>
  logEvent(u, 'List Exceptions', 'Success listing exceptions');

export const createCreateExceptionEvent = (u) =>
  logEvent(u, 'Create Exception', 'Exception created', 201);

export const createUpdateExceptionEvent = (u) =>
  logEvent(u, 'Update Exception', 'Exception updated');

export const createDeleteExceptionEvent = (u) =>
  logEvent(u, 'Delete Exception', 'Exception deleted');

export const createDeleteExceptionByDateEvent = (u) =>
  logEvent(u, 'Delete Exception By Date', 'Exception deleted by date');

// =====================
// ADMIN – Bookings
// =====================
export const createListBookingsAdminEvent = (u) =>
  logEvent(u, 'List Bookings (Admin)', 'Success listing bookings');

export const createGetBookingHistoryEvent = (u) =>
  logEvent(u, 'Get Booking History', 'Success getting booking history');

export const createConfirmBookingAdminEvent = (u) =>
  logEvent(u, 'Confirm Booking (Admin)', 'Booking confirmed');

export const createDenyBookingAdminEvent = (u) =>
  logEvent(u, 'Deny Booking (Admin)', 'Booking denied');

export const createCancelBookingAdminEvent = (u) =>
  logEvent(u, 'Cancel Booking (Admin)', 'Booking cancelled');

export const createDeleteBookingAdminEvent = (u) =>
  logEvent(u, 'Delete Booking (Admin)', 'Booking deleted');

export const createDeleteAllBookingsAdminEvent = (u) =>
  logEvent(u, 'Delete All Bookings (Admin)', 'All bookings deleted');

// =====================
// ADMIN – Payments
// =====================
export const createCapturePaymentEvent = (u) =>
  logEvent(u, 'Capture Payment', 'Payment captured');

export const createRefundPaymentEvent = (u) =>
  logEvent(u, 'Refund Payment', 'Payment refunded');

export const createStripeWebhookEvent = (u) =>
  logEvent(u, 'Stripe Webhook', 'Stripe webhook received', 202);

// =====================
// ADMIN – Notifications
// =====================
export const createListNotificationsEvent = (u) =>
  logEvent(u, 'List Notifications', 'Success listing notifications');

export const createSendNotificationEvent = (u) =>
  logEvent(u, 'Send Notification', 'Notification sent', 201);

export const createScheduleReminderEvent = (u) =>
  logEvent(u, 'Schedule Reminder', 'Reminder scheduled', 201);

export const createResendNotificationEvent = (u) =>
  logEvent(u, 'Resend Notification', 'Notification resent');

// =====================
// ADMIN – Calendars
// =====================
export const createListCalendarsEvent = (u) =>
  logEvent(u, 'List Calendars', 'Success listing calendars');

export const createConnectCalendarEvent = (u) =>
  logEvent(u, 'Connect Calendar', 'Calendar connected', 201);

export const createDisconnectCalendarEvent = (u) =>
  logEvent(u, 'Disconnect Calendar', 'Calendar disconnected');

export const createTriggerCalendarSyncEvent = (u) =>
  logEvent(u, 'Trigger Calendar Sync', 'Calendar sync triggered');

export const createGoogleCalendarWebhookEvent = (u) =>
  logEvent(u, 'Google Calendar Webhook', 'Google calendar webhook received', 202);

// =====================
// ADMIN – Reports
// =====================
export const createBookingSummaryReportEvent = (u) =>
  logEvent(u, 'Booking Summary Report', 'Report generated');

export const createAvailabilityHealthReportEvent = (u) =>
  logEvent(u, 'Availability Health Report', 'Report generated');
