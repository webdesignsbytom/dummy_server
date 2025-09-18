import { myEmitter } from '../utils/eventEmitter.js';
import {
  // Public
  createGetAvailableDaysEvent,
  createGetAvailableSlotsEvent,
  createCreateBookingHoldEvent,
  createGetBookingByTokenEvent,
  createConfirmBookingByTokenEvent,
  createCancelBookingByTokenEvent,
  createJoinWaitlistEvent,
  createListWaitlistEvent,
  createDeleteWaitlistEntryEvent,

  // Auth (customer)
  createListMyBookingsEvent,
  createGetMyBookingEvent,
  createRescheduleMyBookingEvent,
  createCancelMyBookingEvent,
  createUpsertScreeningEvent,
  createGetScreeningEvent,
  createCreatePaymentForBookingEvent,
  createListPaymentsForBookingEvent,

  // Admin – Resources
  createListResourcesEvent,
  createGetResourceEvent,
  createCreateResourceEvent,
  createUpdateResourceEvent,
  createDeleteResourceEvent,
  createAttachTagsToResourceEvent,
  createDetachTagFromResourceEvent,

  // Admin – Services
  createListServicesEvent,
  createGetServiceEvent,
  createCreateServiceEvent,
  createUpdateServiceEvent,
  createDeleteServiceEvent,

  // Admin – Availability mgmt
  createListRulesEvent,
  createCreateRuleEvent,
  createUpdateRuleEvent,
  createDeleteRuleEvent,
  createListWindowsEvent,
  createCreateWindowEvent,
  createUpdateWindowEvent,
  createDeleteWindowEvent,
  createListExceptionsEvent,
  createCreateExceptionEvent,
  createUpdateExceptionEvent,
  createDeleteExceptionEvent,
  createDeleteExceptionByDateEvent,

  // Admin – Bookings
  createListBookingsAdminEvent,
  createGetBookingHistoryEvent,
  createConfirmBookingAdminEvent,
  createDenyBookingAdminEvent,
  createCancelBookingAdminEvent,
  createDeleteBookingAdminEvent,
  createDeleteAllBookingsAdminEvent,

  // Admin – Payments
  createCapturePaymentEvent,
  createRefundPaymentEvent,
  createStripeWebhookEvent,

  // Admin – Notifications
  createListNotificationsEvent,
  createSendNotificationEvent,
  createScheduleReminderEvent,
  createResendNotificationEvent,

  // Admin – Calendars
  createListCalendarsEvent,
  createConnectCalendarEvent,
  createDisconnectCalendarEvent,
  createTriggerCalendarSyncEvent,
  createGoogleCalendarWebhookEvent,

  // Admin – Reports
  createBookingSummaryReportEvent,
  createAvailabilityHealthReportEvent,
} from './utils/bookingUtils.js';

export const myEmitterBookings = myEmitter;

const safe = (fn) => async (user) => {
  try {
    await fn(user);
  } catch (e) {
    console.error('[myEmitterBookings] listener error:', e);
  }
};

/* =========================
   PUBLIC
   ========================= */
myEmitterBookings.on('availability:get-days', safe(createGetAvailableDaysEvent));
myEmitterBookings.on('availability:get-slots', safe(createGetAvailableSlotsEvent));

myEmitterBookings.on('bookings:create-hold', safe(createCreateBookingHoldEvent));
myEmitterBookings.on('bookings:get-by-token', safe(createGetBookingByTokenEvent));
myEmitterBookings.on('bookings:confirm-by-token', safe(createConfirmBookingByTokenEvent));
myEmitterBookings.on('bookings:cancel-by-token', safe(createCancelBookingByTokenEvent));

myEmitterBookings.on('waitlist:join', safe(createJoinWaitlistEvent));
myEmitterBookings.on('waitlist:list', safe(createListWaitlistEvent));
myEmitterBookings.on('waitlist:delete-entry', safe(createDeleteWaitlistEntryEvent));

/* =========================
   AUTH (customer)
   ========================= */
myEmitterBookings.on('me:bookings:list', safe(createListMyBookingsEvent));
myEmitterBookings.on('me:bookings:get', safe(createGetMyBookingEvent));
myEmitterBookings.on('me:bookings:reschedule', safe(createRescheduleMyBookingEvent));
myEmitterBookings.on('me:bookings:cancel', safe(createCancelMyBookingEvent));

myEmitterBookings.on('me:screening:upsert', safe(createUpsertScreeningEvent));
myEmitterBookings.on('me:screening:get', safe(createGetScreeningEvent));

myEmitterBookings.on('me:payments:create', safe(createCreatePaymentForBookingEvent));
myEmitterBookings.on('me:payments:list', safe(createListPaymentsForBookingEvent));

/* =========================
   ADMIN – Resources
   ========================= */
myEmitterBookings.on('resources:list', safe(createListResourcesEvent));
myEmitterBookings.on('resources:get', safe(createGetResourceEvent));
myEmitterBookings.on('resources:create', safe(createCreateResourceEvent));
myEmitterBookings.on('resources:update', safe(createUpdateResourceEvent));
myEmitterBookings.on('resources:delete', safe(createDeleteResourceEvent));
myEmitterBookings.on('resources:attach-tags', safe(createAttachTagsToResourceEvent));
myEmitterBookings.on('resources:detach-tag', safe(createDetachTagFromResourceEvent));

/* =========================
   ADMIN – Services
   ========================= */
myEmitterBookings.on('services:list', safe(createListServicesEvent));
myEmitterBookings.on('services:get', safe(createGetServiceEvent));
myEmitterBookings.on('services:create', safe(createCreateServiceEvent));
myEmitterBookings.on('services:update', safe(createUpdateServiceEvent));
myEmitterBookings.on('services:delete', safe(createDeleteServiceEvent));

/* =========================
   ADMIN – Availability mgmt
   ========================= */
myEmitterBookings.on('rules:list', safe(createListRulesEvent));
myEmitterBookings.on('rules:create', safe(createCreateRuleEvent));
myEmitterBookings.on('rules:update', safe(createUpdateRuleEvent));
myEmitterBookings.on('rules:delete', safe(createDeleteRuleEvent));

myEmitterBookings.on('windows:list', safe(createListWindowsEvent));
myEmitterBookings.on('windows:create', safe(createCreateWindowEvent));
myEmitterBookings.on('windows:update', safe(createUpdateWindowEvent));
myEmitterBookings.on('windows:delete', safe(createDeleteWindowEvent));

myEmitterBookings.on('exceptions:list', safe(createListExceptionsEvent));
myEmitterBookings.on('exceptions:create', safe(createCreateExceptionEvent));
myEmitterBookings.on('exceptions:update', safe(createUpdateExceptionEvent));
myEmitterBookings.on('exceptions:delete', safe(createDeleteExceptionEvent));
myEmitterBookings.on('exceptions:delete-by-date', safe(createDeleteExceptionByDateEvent));

/* =========================
   ADMIN – Bookings
   ========================= */
myEmitterBookings.on('admin:bookings:list', safe(createListBookingsAdminEvent));
myEmitterBookings.on('admin:bookings:history', safe(createGetBookingHistoryEvent));
myEmitterBookings.on('admin:bookings:confirm', safe(createConfirmBookingAdminEvent));
myEmitterBookings.on('admin:bookings:deny', safe(createDenyBookingAdminEvent));
myEmitterBookings.on('admin:bookings:cancel', safe(createCancelBookingAdminEvent));
myEmitterBookings.on('admin:bookings:delete', safe(createDeleteBookingAdminEvent));
myEmitterBookings.on('admin:bookings:delete-all', safe(createDeleteAllBookingsAdminEvent));

/* =========================
   ADMIN – Payments
   ========================= */
myEmitterBookings.on('payments:capture', safe(createCapturePaymentEvent));
myEmitterBookings.on('payments:refund', safe(createRefundPaymentEvent));
myEmitterBookings.on('webhooks:stripe', safe(createStripeWebhookEvent));

/* =========================
   ADMIN – Notifications
   ========================= */
myEmitterBookings.on('notifications:list', safe(createListNotificationsEvent));
myEmitterBookings.on('notifications:send', safe(createSendNotificationEvent));
myEmitterBookings.on('notifications:schedule-reminder', safe(createScheduleReminderEvent));
myEmitterBookings.on('notifications:resend', safe(createResendNotificationEvent));

/* =========================
   ADMIN – Calendars
   ========================= */
myEmitterBookings.on('calendars:list', safe(createListCalendarsEvent));
myEmitterBookings.on('calendars:connect', safe(createConnectCalendarEvent));
myEmitterBookings.on('calendars:disconnect', safe(createDisconnectCalendarEvent));
myEmitterBookings.on('calendars:sync', safe(createTriggerCalendarSyncEvent));
myEmitterBookings.on('webhooks:google-calendar', safe(createGoogleCalendarWebhookEvent));

/* =========================
   ADMIN – Reports
   ========================= */
myEmitterBookings.on('reports:booking-summary', safe(createBookingSummaryReportEvent));
myEmitterBookings.on('reports:availability-health', safe(createAvailabilityHealthReportEvent));
