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

export const createNewBooking = async (time, date, fullName, phoneNumber, email) => {
  return dbClient.bookingItem.create({
    data: {
      time: time,
      date: date,
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email
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

export const deleteAllEventsFromDB = async () => {
  return dbClient.event.deleteMany({});
};
