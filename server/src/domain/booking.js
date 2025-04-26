import dbClient from '../utils/dbClient.js';

export const findAllBookings = () =>
  dbClient.bookingItem.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findActiveBookings = () =>
  dbClient.bookingItem.findMany({
    where: {
      cancelled: false,
      denied: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

export const createClosedDay = (date, reason) =>
  dbClient.dayClosed.create({
    data: {
      date,
      reason,
    },
  });

export const deleteClosedDayByDate = (date) =>
  dbClient.dayClosed.delete({
    where: {
      date,
    },
  });

export const updateOpeningTimes = (day, open, start, end) =>
  dbClient.openingTime.update({
    where: {
      day: day, // Assuming 'day' is a unique field in your table
    },
    data: {
      open,
      start,
      end,
    },
  });

export const deleteClosedDayById = (id) =>
  dbClient.dayClosed.delete({
    where: {
      id,
    },
  });

export const findDaysClosed = () =>
  dbClient.dayClosed.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findOpeningTimesAsObject = async () => {
  const times = await dbClient.openingTime.findMany({
    orderBy: {
      dayOfWeek: 'asc',
    },
  });

  return times.reduce((acc, time) => {
    acc[time.dayOfWeek] = {
      open: time.open,
      start: time.start,
      end: time.end,
    };
    return acc;
  }, {}); // no "as" typing needed
};

export const checkBookingSlot = async (time, bookingDate) => {
  return dbClient.bookingItem.findFirst({
    where: {
      time: time,
      date: bookingDate,
    },
  });
};

export const findBookingsForDay = async (date) => {
  return dbClient.bookingItem.findMany({
    where: {
      date: date,
    },
  });
};

export const createNewBooking = async (
  time,
  date,
  fullName,
  phoneNumber,
  email
) => {
  return dbClient.bookingItem.create({
    data: {
      time: time,
      date: date,
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
    },
  });
};

export const confirmBooking = async (id) => {
  return dbClient.bookingItem.update({
    where: {
      id: id,
    },
    data: {
      bookingApproved: true,
    },
  });
};

export const denyBooking = async (id) => {
  return dbClient.bookingItem.update({
    where: {
      id: id,
    },
    data: {
      denied: true,
    },
  });
};

export const cancelBooking = async (id) => {
  return dbClient.bookingItem.update({
    where: {
      id: id,
    },
    data: {
      cancelled: true,
      bookingApproved: false,
    },
  });
};

export const updateBooking = async (id, data) => {
  return dbClient.bookingItem.update({
    where: {
      id: id,
    },
    data: data,
  });
};

export const findBookingsByEmail = async (email) => {
  return dbClient.bookingItem.findMany({
    where: { email: email },
    orderBy: { date: 'asc' },
  });
};

export const findBookingById = async (bookingId) => {
  return dbClient.bookingItem.findUnique({
    where: { id: bookingId },
  });
};

export const findBookingsByDate = async (date) => {
  return dbClient.bookingItem.findMany({
    where: {
      date: {
        equals: new Date(date),
      },
    },
    orderBy: { time: 'asc' },
  });
};

export const deleteBookingById = async (id) => {
  return dbClient.bookingItem.delete({
    where: {
      id: id,
    },
  });
};

export const deleteAllBookings = async () => {
  return dbClient.bookingItem.deleteMany({});
};
