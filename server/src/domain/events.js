import dbClient from '../utils/dbClient.js';

export const findAllEvents = () =>
  dbClient.event.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findEventById = async (eventId) => {
  return dbClient.event.findUnique({
    where: { id: eventId },
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
