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

export const deleteEventId = async (id) => {
  return dbClient.event.delete({
    where: {
      id: id,
    },
  });
};

export const deleteAllEventsFromDB = async () => {
  return dbClient.event.deleteMany({});
};
