import dbClient from '../../utils/dbClient.js';
import { randomUUID } from 'crypto';

// minimal field projection to avoid leaking internals
const bookingSelect = {
  id: true,
  token: true,
  status: true,
  date: true,
  time: true,
  notes: true,
  createdAt: true,
  confirmedAt: true,
  cancelledAt: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  resourceId: true,
  serviceId: true,
};

// PENDING hold + token
export const createBookingHold = async (
  fullName,
  email,
  phoneNumber,
  resourceId,
  serviceId,
  date,
  time,
  notes
) => {
  const holdToken = randomUUID();

  const createdBooking = await dbClient.booking.create({
    data: {
      status: 'PENDING',
      token: holdToken,
      date,
      time,
      notes: notes ?? null,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phoneNumber,
      resourceId,
      serviceId,
    },
    select: bookingSelect,
  });

  // enrich shape a little (keeps your style)
  createdBooking.token = holdToken;
  return createdBooking;
};

export const findBookingByToken = async (token) =>
  dbClient.booking.findFirst({
    where: { token },
    select: bookingSelect,
  });

export const findBookingByIdAndToken = async (bookingId, token) =>
  dbClient.booking.findFirst({
    where: { id: bookingId, token },
    select: bookingSelect,
  });

export const confirmBookingByIdAndToken = async (bookingId, token) =>
  dbClient.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
    select: bookingSelect,
  });

export const cancelBookingByIdAndToken = async (bookingId, token) =>
  dbClient.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
    select: bookingSelect,
  });

  // Build a Prisma where clause from admin filters
const buildAdminBookingWhere = ({ resourceId, status, email, fromDate, toDate }) => {
  const where = {};

  if (resourceId) {
    where.resourceId = resourceId;
  }

  if (status) {
    where.status = status;
  }

  if (email) {
    where.email = email;
  }

  if (fromDate || toDate) {
    where.date = {};
    if (fromDate) where.date.gte = new Date(fromDate);
    if (toDate) where.date.lte = new Date(toDate);
  }

  return where;
};

// [ADMIN] List all bookings (with optional filters)
export const findAllBookingsAdmin = (filters = {}) =>
  dbClient.booking.findMany({
    where: buildAdminBookingWhere(filters),
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

// [SHARED] Find booking by id
export const findBookingById = (bookingId) =>
  dbClient.booking.findFirst({
    where: { id: bookingId },
  });

// [ADMIN] Booking history/audit
export const findBookingHistoryByBookingId = (bookingId) =>
  dbClient.bookingHistory.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'asc' },
  });

// [ADMIN] Update booking status/reasons
export const updateBookingStatusAdmin = (bookingId, data) =>
  dbClient.booking.update({
    where: { id: bookingId },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.confirmedAt !== undefined && { confirmedAt: data.confirmedAt }),
      ...(data.cancelledReason !== undefined && { cancelledReason: data.cancelledReason }),
      ...(data.deniedReason !== undefined && { deniedReason: data.deniedReason }),
    },
  });

// [ADMIN] Delete a single booking
export const deleteBookingByIdAdmin = (bookingId) =>
  dbClient.booking.delete({
    where: { id: bookingId },
  });

// [ADMIN] Delete ALL bookings
export const deleteAllBookingsAdmin = () =>
  dbClient.booking.deleteMany({});


const ownerWhere = (user) => {
  // scope by either userId (if present) or email as you’ve done elsewhere
  const clauses = [];
  if (user?.id) clauses.push({ userId: user.id });
  if (user?.email) clauses.push({ customerEmail: user.email });

  // Fallback to impossible filter if neither exist (shouldn’t happen thanks to auth)
  if (clauses.length === 0) clauses.push({ id: '__NOPE__' });

  return { OR: clauses };
};

export const listUserBookings = async (user) =>
  dbClient.booking.findMany({
    where: ownerWhere(user),
    orderBy: { createdAt: 'desc' },
    select: bookingSelect,
  });

export const findUserBookingById = async (bookingId, user) =>
  dbClient.booking.findFirst({
    where: { id: bookingId, ...ownerWhere(user) },
    select: bookingSelect,
  });

export const rescheduleUserBooking = async (bookingId, startAt, notes) =>
  dbClient.booking.update({
    where: { id: bookingId },
    data: {
      startAt,
      // optional: you can also recalc endAt server-side if you have duration
      notes: notes ?? undefined,
      status: 'PENDING', // common pattern after reschedule
    },
    select: bookingSelect,
  });

export const cancelUserBooking = async (bookingId, cancelledReason) =>
  dbClient.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED_CLIENT',
      cancelledReason: cancelledReason ?? null,
    },
    select: bookingSelect,
  });