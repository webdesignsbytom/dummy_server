import dbClient from '../../utils/dbClient.js';

/* ------------ Shared selects to avoid leaking internals ------------ */
const screeningSelect = {
  id: true,
  bookingId: true,
  answers: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

const paymentSelect = {
  id: true,
  bookingId: true,
  amount: true,
  currency: true,
  provider: true,
  status: true,
  clientSecret: true, // if you store one
  meta: true,
  createdAt: true,
  updatedAt: true,
};

/* ------------------------- Screening domain ------------------------ */
export const upsertUserScreening = async (bookingId, answers, notes) =>
  dbClient.screening.upsert({
    where: { bookingId }, // assumes unique on bookingId
    create: {
      bookingId,
      answers,
      notes: notes ?? null,
    },
    update: {
      answers,
      notes: notes ?? null,
    },
    select: screeningSelect,
  });

export const findUserScreeningByBookingId = async (bookingId) =>
  dbClient.screening.findFirst({
    where: { bookingId },
    select: screeningSelect,
  });
