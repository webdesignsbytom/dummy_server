import dbClient from '../../utils/dbClient.js';

const paymentSelect = {
  id: true,
  bookingId: true,
  amount: true,
  currency: true,
  provider: true,
  status: true,
  clientSecret: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
};

export const findPaymentsForUserBooking = async (bookingId) =>
  dbClient.payment.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
    select: paymentSelect,
  });

// [SHARED] Find payment by id
export const findPaymentById = (paymentId) =>
  dbClient.payment.findFirst({
    where: { id: paymentId },
  });

// [ADMIN] Capture a payment
export const capturePaymentById = (paymentId) =>
  dbClient.payment.update({
    where: { id: paymentId },
    data: {
      status: 'CAPTURED',
      capturedAt: new Date(),
    },
  });

// [ADMIN] Refund a payment
export const refundPaymentById = (paymentId, { amount = null, reason = null } = {}) =>
  dbClient.payment.update({
    where: { id: paymentId },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
      ...(amount !== null && { refundAmount: amount }),
      ...(reason !== null && { refundReason: reason }),
    },
  });


/* -------------------------- Payments domain ------------------------ */
export const createPaymentForUserBooking = async (
  bookingId,
  amount,
  currency,
  provider,
  meta
) =>
  dbClient.payment.create({
    data: {
      bookingId,
      amount,
      currency,
      provider: provider ?? 'stripe', // default if you wish
      status: 'REQUIRES_CONFIRMATION', // initial status pattern
      clientSecret: null, // set if your provider returns one
      meta: meta ?? {},
    },
    select: paymentSelect,
  });