import { Router } from 'express';
import {
  validateAuthentication,
  validateAdminRole,
} from '../middleware/auth.js';
// Availability (read + manage)
import {
  // READ
  getAvailableDaysHandler, // GET /availability/days
  getAvailableSlotsHandler, // GET /availability/slots
  // MANAGE
  listRulesHandler,
  createRuleHandler,
  updateRuleHandler,
  deleteRuleHandler,
  listDatedWindowsHandler,
  createDatedWindowHandler,
  updateDatedWindowHandler,
  deleteDatedWindowHandler,
  listExceptionsHandler,
  createExceptionHandler,
  updateExceptionHandler,
  deleteExceptionHandler,
  deleteExceptionByDateHandler,
} from '../controllers/booking/availability.js';
// Resources
import {
  listResourcesHandler,
  getResourceHandler,
  createResourceHandler,
  updateResourceHandler,
  deleteResourceHandler,
  attachTagsToResourceHandler,
  detachTagFromResourceHandler,
} from '../controllers/booking/resource.js';
// Services
import {
  listServicesHandler,
  getServiceHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from '../controllers/booking/service.js';

// Bookings
import {
  // Public & token flows
  createBookingHoldHandler,
  getBookingByTokenHandler,
  confirmBookingByTokenHandler,
  cancelBookingByTokenHandler,
  // Auth’d user
  getBookingHandler,
  listBookingsHandler,
  rescheduleBookingHandler,
  cancelBookingHandler,
  // Admin/operator
  listBookingsAdminHandler,
  confirmBookingHandler,
  denyBookingHandler,
  cancelBookingAdminHandler,
  getBookingHistoryHandler,
  deleteBookingHandler,
  deleteAllBookingsHandler,
} from '../controllers/booking/booking.js';

// Payments
import {
  createPaymentHandler,
  listPaymentsForBookingHandler,
  capturePaymentHandler,
  refundPaymentHandler,
  stripeWebhookHandler,
} from '../controllers/booking/payment.js';

// Notifications
import {
  listNotificationsForBookingHandler,
  sendNotificationHandler,
  scheduleReminderHandler,
  resendNotificationHandler,
} from '../controllers/booking/notification.js';

// Screening
import {
  upsertScreeningHandler,
  getScreeningHandler,
} from '../controllers/booking/screening.js';

// Waitlist
import {
  joinWaitlistHandler,
  listWaitlistHandler,
  deleteWaitlistEntryHandler,
  adminDeleteWaitlistEntryHandler,
} from '../controllers/booking/waitlist.js';

// External Calendars
import {
  listCalendarsHandler,
  connectCalendarHandler,
  disconnectCalendarHandler,
  triggerCalendarSyncHandler,
  googleCalendarWebhookHandler,
} from '../controllers/booking/calendar.js';

// Reports
import {
  bookingSummaryReportHandler,
  availabilityHealthReportHandler,
} from '../controllers/booking/reports.js';

const router = Router();

/* =========================
   PUBLIC (no auth required)
   ========================= */

// [PUBLIC] Calendar grid: returns which dates have availability
router.get('/availability/get-days', getAvailableDaysHandler);

// [PUBLIC] Time picker: returns start times for a specific date
router.get('/availability/get-slots', getAvailableSlotsHandler);

// [PUBLIC] Create a booking HOLD (PENDING) and return bookingId + token
router.post('/create-new-booking-request', createBookingHoldHandler);

// [PUBLIC-TOKEN] View booking via emailed UUID token (no account)
router.get('/view-booking-by-token/:token', getBookingByTokenHandler);

// [PUBLIC-TOKEN] Confirm booking via tokenized link
router.patch(
  '/:bookingId/confirm-by-token/:token',
  confirmBookingByTokenHandler
);

// [PUBLIC-TOKEN] Cancel booking via tokenized link
router.patch('/:bookingId/cancel-by-token/:token', cancelBookingByTokenHandler);

// [PUBLIC] Join waitlist for a date (no account required)
router.post('/join-waitlist', joinWaitlistHandler);

router.get('/waitlist/list-waitlist', listWaitlistHandler);

router.delete(
  '/waitlist/delete-waitlist-entry/:token',
  deleteWaitlistEntryHandler
);

router.delete(
  '/admin/waitlist/delete-waitlist-entry',
  adminDeleteWaitlistEntryHandler
);

/* ==================================
   AUTHENTICATED USER (customer ops)
   ================================== */

// [AUTH] List my bookings (server scopes by auth/email)
router.get('/user/get-my-bookings', validateAuthentication, listBookingsHandler);

// [AUTH] View a single booking I own
router.get('/user/get-booking-by-id/:bookingId', validateAuthentication, getBookingHandler);

// [AUTH] Reschedule my booking (ownership enforced in controller)
router.patch(
  '/user/:bookingId/reschedule',
  validateAuthentication,
  rescheduleBookingHandler
);

// [AUTH] Cancel my booking (client self-cancel)
router.patch(
  '/user/:bookingId/cancel',
  validateAuthentication,
  cancelBookingHandler
);

// [AUTH] Attach/update screening responses for my booking
router.put(
  '/user/:bookingId/screening',
  validateAuthentication,
  upsertScreeningHandler
);

// [AUTH] Get my screening responses
router.get(
  '/user/:bookingId/screening',
  validateAuthentication,
  getScreeningHandler
);

// [AUTH] Create a payment intent / attach payment to my booking
router.post(
  '/user/:bookingId/payments',
  validateAuthentication,
  createPaymentHandler
);

// [AUTH] List payments for my booking
router.get(
  '/user/:bookingId/payments',
  validateAuthentication,
  listPaymentsForBookingHandler
);

/* ==================
   ADMIN / OPERATOR
   ================== */

/* ---- Resources ---- */

// [ADMIN] List resources (providers/rooms/etc.)
router.get(
  '/admin/list-resources',
  validateAuthentication,
  validateAdminRole,
  listResourcesHandler
);

// [ADMIN] Get a single resource
router.get(
  '/admin/get-resource-by-id/:resourceId',
  validateAuthentication,
  validateAdminRole,
  getResourceHandler
);

// [ADMIN] Create a resource
router.post(
  '/admin/create-resource',
  validateAuthentication,
  validateAdminRole,
  createResourceHandler
);

// [ADMIN] Update a resource
router.patch(
  '/admin/update-resource/:resourceId',
  validateAuthentication,
  validateAdminRole,
  updateResourceHandler
);

// [ADMIN] Delete a resource
router.delete(
  '/admin/delete-resource/:resourceId',
  validateAuthentication,
  validateAdminRole,
  deleteResourceHandler
);

// [ADMIN] Attach tag(s) to a resource
router.post(
  '/admin/add-resource-tag/:resourceId/tags',
  validateAuthentication,
  validateAdminRole,
  attachTagsToResourceHandler
);

// [ADMIN] Detach a tag from a resource
router.delete(
  '/admin/detach-resource-tag/:resourceId/tags/:tagId',
  validateAuthentication,
  validateAdminRole,
  detachTagFromResourceHandler
);

/* ---- Services ---- */

// [ADMIN] List services
router.get(
  '/admin/list-services',
  validateAuthentication,
  validateAdminRole,
  listServicesHandler
);

// [ADMIN] Get a service
router.get(
  '/admin/get-service-by-id/:serviceId',
  validateAuthentication,
  validateAdminRole,
  getServiceHandler
);

// [ADMIN] Create a service
router.post(
  '/admin/create-service',
  validateAuthentication,
  validateAdminRole,
  createServiceHandler
);

// [ADMIN] Update a service
router.patch(
  '/admin/update-service/:serviceId',
  validateAuthentication,
  validateAdminRole,
  updateServiceHandler
);

// [ADMIN] Delete a service
router.delete(
  '/admin/delete-service/:serviceId',
  validateAuthentication,
  validateAdminRole,
  deleteServiceHandler
);

/* ---- Availability Management (replaces old DayClosed/OpeningTimes) ---- */

// [ADMIN] List weekly rules for a resource
router.get(
  '/admin/list-resource-rules/:resourceId',
  validateAuthentication,
  validateAdminRole,
  listRulesHandler
);

// [ADMIN] Create a weekly rule (e.g., Mon 09:00–17:00)
router.post(
  '/admin/create-resource-rule/:resourceId',
  validateAuthentication,
  validateAdminRole,
  createRuleHandler
);

// [ADMIN] Update a weekly rule
router.patch(
  '/admin/update-resource-rule/:resourceId/:ruleId',
  validateAuthentication,
  validateAdminRole,
  updateRuleHandler
);

// [ADMIN] Delete a weekly rule
router.delete(
  '/admin/delete-resource-weekly-rule/:ruleId',
  validateAuthentication,
  validateAdminRole,
  deleteRuleHandler
);

// [ADMIN] List dated windows (one-off open hours)
router.get(
  '/admin/list-dated-windows/:resourceId',
  validateAuthentication,
  validateAdminRole,
  listDatedWindowsHandler
);

// [ADMIN] Create a dated window (custom open hours for a date)
router.post(
  '/admin/create-dated-window/:resourceId',
  validateAuthentication,
  validateAdminRole,
  createDatedWindowHandler
);

// [ADMIN] Update a dated window
router.patch(
  '/admin/update-dated-window/:resourceId/:windowId',
  validateAuthentication,
  validateAdminRole,
  updateDatedWindowHandler
);

// [ADMIN] Delete a dated window
router.delete(
  '/admin/delete-dated-window/:resourceId/:windowId',
  validateAuthentication,
  validateAdminRole,
  deleteDatedWindowHandler
);

// [ADMIN] List exceptions (full/partial blackouts)
router.get(
  '/admin/exceptions/resources/list-resource-exceptions/:resourceId',
  validateAuthentication,
  validateAdminRole,
  listExceptionsHandler
);

// [ADMIN] Create an exception (e.g., 2025-09-30 12:00–14:00)
router.post(
  '/admin/exceptions/resources/create-resource-exception/:resourceId',
  validateAuthentication,
  validateAdminRole,
  createExceptionHandler
);

// [ADMIN] Update an exception
router.patch(
  '/admin/exceptions/update-resource-exception/:resourceId/:exceptionId',
  validateAuthentication,
  validateAdminRole,
  updateExceptionHandler
);

// [ADMIN] Delete an exception
router.delete(
  '/admin/exceptions/delete-resources-exception/:resourceId/:exceptionId',
  validateAuthentication,
  validateAdminRole,
  deleteExceptionHandler
);

// [ADMIN] Delete a full-day exception by local date (compat with your old route)
router.delete(
  '/admin/exceptions/delete-full-day-exception/:resourceId/:date',
  validateAuthentication,
  validateAdminRole,
  deleteExceptionByDateHandler
);

/* ---- Admin Bookings ---- */

// [ADMIN] List all bookings (filters: resourceId, date range, status, email)
router.get(
  '/admin/list-all-bookings',
  validateAuthentication,
  validateAdminRole,
  listBookingsAdminHandler
);

// [ADMIN] View booking history/audit
router.get(
  '/admin/view-booking-history/:bookingId',
  validateAuthentication,
  validateAdminRole,
  getBookingHistoryHandler
);

// [ADMIN] Confirm a booking (operator action)
router.patch(
  '/admin/confirm-booking/:bookingId',
  validateAuthentication,
  validateAdminRole,
  confirmBookingHandler
);

// [ADMIN] Deny a booking (operator action)
router.patch(
  '/admin/deny-booking/:bookingId',
  validateAuthentication,
  validateAdminRole,
  denyBookingHandler
);

// [ADMIN] Cancel a booking (operator action; can set cancelledReason)
router.patch(
  '/admin/cancel-booking/:bookingId',
  validateAuthentication,
  validateAdminRole,
  cancelBookingAdminHandler
);

// [ADMIN] Delete a booking row (hard delete)
router.delete(
  '/admin/delete-booking/:bookingId',
  validateAuthentication,
  validateAdminRole,
  deleteBookingHandler
);

// [ADMIN] Delete ALL bookings (danger!)
router.delete(
  '/admin/delete-all-bookings',
  validateAuthentication,
  validateAdminRole,
  deleteAllBookingsHandler
);

/* ---- Payments (operator actions) ---- */

// [ADMIN] Capture a payment
router.patch(
  '/admin/payments/:paymentId/capture',
  validateAuthentication,
  validateAdminRole,
  capturePaymentHandler
);

// [ADMIN] Refund a payment
router.patch(
  '/admin/payments/:paymentId/refund',
  validateAuthentication,
  validateAdminRole,
  refundPaymentHandler
);

// [PUBLIC] Payment provider webhook (secure via signature in controller)
router.post('/webhooks/stripe', stripeWebhookHandler);

/* ---- Notifications ---- */

// [ADMIN] List notifications for a booking
router.get(
  '/admin/list-booking-notifications/:bookingId',
  validateAuthentication,
  validateAdminRole,
  listNotificationsForBookingHandler
);

// [ADMIN] Send an immediate notification (confirm/cancel/etc.)
router.post(
  '/admin/send-notification/:bookingId',
  validateAuthentication,
  validateAdminRole,
  sendNotificationHandler
);

// [ADMIN] Schedule a reminder (sets sendAt)
router.post(
  '/admin/bookings/:bookingId/notifications/reminder',
  validateAuthentication,
  validateAdminRole,
  scheduleReminderHandler
);

// [ADMIN] Re-send a notification
router.post(
  '/admin/notifications/:notificationId/resend',
  validateAuthentication,
  validateAdminRole,
  resendNotificationHandler
);

/* ---- External Calendars ---- */

// [ADMIN] List connected calendars for a resource
router.get(
  '/admin/list-connected-calendars/:resourceId',
  validateAuthentication,
  validateAdminRole,
  listCalendarsHandler
);

// [ADMIN] Connect a calendar (store provider/externalId)
router.post(
  '/admin/connect-to-calendar/:resourceId',
  validateAuthentication,
  validateAdminRole,
  connectCalendarHandler
);

// [ADMIN] Disconnect a calendar
router.delete(
  '/admin/disconnect-calendar/:resourceId/calendar/:calendarId',
  validateAuthentication,
  validateAdminRole,
  disconnectCalendarHandler
);

// [ADMIN] Trigger a manual calendar sync
router.post(
  '/admin/trigger-calendar-sync/:resourceId/calendars/:calendarId',
  validateAuthentication,
  validateAdminRole,
  triggerCalendarSyncHandler
);

// [PUBLIC] Google push/webhook endpoint (secure validation done inside)
router.post('/webhooks/calendar/google', googleCalendarWebhookHandler);

/* ---- Reports ---- */

// [ADMIN] KPIs: totals, utilization, revenue
router.get(
  '/admin/get-reports/booking-summary',
  validateAuthentication,
  validateAdminRole,
  bookingSummaryReportHandler
);

// [ADMIN] Availability health: gaps, overbook risk, rule coverage
router.get(
  '/admin/get-reports/availability-health',
  validateAuthentication,
  validateAdminRole,
  availabilityHealthReportHandler
);

export default router;
