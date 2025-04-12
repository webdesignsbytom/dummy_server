import dbClient from '../utils/dbClient.js';

export const findAllBookings = () =>
  dbClient.bookingItem.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

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
