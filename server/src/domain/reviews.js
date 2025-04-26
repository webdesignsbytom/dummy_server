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
  phoneNumber,
  email,
  rating,
  message
) => {
  return dbClient.review.create({
    data: {
      firstName,
      lastName,
      phoneNumber,
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

export const findReviewsByDate = async (date) => {
  return dbClient.review.findMany({
    where: {
      date: {
        equals: new Date(date),
      },
    },
    orderBy: { time: 'asc' },
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
