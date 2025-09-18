import {
  findPaymentsForUserBooking,
  findPaymentById,
  capturePaymentById,
  refundPaymentById,
  createPaymentForUserBooking,
} from '../../domain/booking/payment.js';
import { findUserBookingById } from '../../domain/booking/booking.js';
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

// [AUTH] List my payments for a booking I own
// GET /user/:bookingId/payments
export const listPaymentsForBookingHandler = async (req, res) => {
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

    const foundPayments = await findPaymentsForUserBooking(bookingId);

    // Empty is a valid state – return 200 with an empty array
    myEmitterBookings.emit('list-my-payments', req.user);

    sendDataResponse(res, 200, { payments: foundPayments ?? [] });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'List payments failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   ADMIN – Payments
   ========================= */

// [ADMIN] Capture a payment
export const capturePaymentHandler = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const foundPayment = await findPaymentById(paymentId);

    if (!foundPayment) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        `Failed to find payment.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (foundPayment.status === 'CAPTURED') {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Payment is already captured.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    const updatedPayment = await capturePaymentById(paymentId);
    if (!updatedPayment) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Failed to capture payment.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('payments:capture', req.user);
    sendDataResponse(res, 200, { payment: updatedPayment });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Capture payment failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Refund a payment
export const refundPaymentHandler = async (req, res) => {
  const { paymentId } = req.params;
  const { amount = null, reason = null } = req.body || {};

  try {
    const foundPayment = await findPaymentById(paymentId);

    if (!foundPayment) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        `Failed to find payment.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (foundPayment.status === 'REFUNDED') {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Payment is already refunded.`
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    const updatedPayment = await refundPaymentById(paymentId, {
      amount,
      reason,
    });
    if (!updatedPayment) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        `Failed to refund payment.`
      );
      myEmitterErrors.emit('error', badRequest);
      sendMessageResponse(res, badRequest.code, badRequest.message);
      return;
    }

    myEmitterBookings.emit('payments:refund', req.user);
    sendDataResponse(res, 200, { payment: updatedPayment });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Refund payment failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   PUBLIC – Webhooks (Stripe)
   ========================= */

// Note: Signature verification belongs here (controller). You can pass the raw
// body into your Stripe SDK constructEvent if you’ve wired bodyParser.raw.
export const stripeWebhookHandler = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      `Missing Stripe signature.`
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    // If using Stripe SDK:
    // const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // Handle event.type accordingly and update your DB if needed.

    // Emit for your internal audit/event pipeline
    myEmitterBookings.emit('webhooks:stripe', req.user);

    // Deliberately not exposing internals; just ack
    sendDataResponse(res, 200, { received: true });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Stripe webhook failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, 400, `Webhook Error`);
    throw err;
  }
};

/* ==============================================================
   [AUTH] Create a payment intent / attach payment to my booking
   POST /user/:bookingId/payments
   Body: { amount: number, currency: string, provider?: string, meta?: object }
   ============================================================== */
export const createPaymentHandler = async (req, res) => {
  const { bookingId } = req.params;
  const { amount, currency, provider, meta } = req.body || {};

  if (!bookingId || !amount || !currency) {
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

    const createdPayment = await createPaymentForUserBooking(
      bookingId,
      amount,
      currency,
      provider,
      meta
    );

    if (!createdPayment) {
      const badCreate = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.malformedData
      );
      myEmitterErrors.emit('error', badCreate);
      return sendMessageResponse(res, badCreate.code, badCreate.message);
    }

    myEmitterBookings.emit('create-my-payment', req.user);

    sendDataResponse(res, 201, { payment: createdPayment });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Create payment failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
