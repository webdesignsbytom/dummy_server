import dbClient from '../utils/dbClient.js';

export const findAllReviews = () =>
  dbClient.review.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findReviewsForDay = async (date) => {
  return dbClient.review.findMany({
    where: {
      date: date,
    },
  });
};

export const createNewReview = async (
  firstName,
  lastName,
  email,
  rating,
  message
) => {
  return dbClient.review.create({
    data: {
      firstName,
      lastName,
      email,
      rating,
      message,
    },
  });
};

export const findReviewsByEmail = async (email) => {
  return dbClient.review.findFirst({
    where: { email: email },
  });
};

export const findReviewById = async (reviewId) => {
  return dbClient.review.findUnique({
    where: { id: reviewId },
  });
};

export const findReviewsByDate = async (dateString) => {
  const date = new Date(dateString);

  const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

  return dbClient.review.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
};

export const deleteReviewById = async (id) => {
  return dbClient.review.delete({
    where: {
      id: id,
    },
  });
};

export const deleteAllReviews = async () => {
  return dbClient.review.deleteMany({});
};
