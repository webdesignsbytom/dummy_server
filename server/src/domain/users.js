import dbClient from '../utils/dbClient.js';

export const findAllUsers = () =>
  dbClient.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findUserByEmail = (email) =>
  dbClient.user.findUnique({
    where: { email },
  });

export const findUsersByRole = (role) =>
  dbClient.user.findMany({
    where: {
      role,
    },
  });

export const createNewUser = (email, password) =>
  dbClient.user.create({
    data: {
      email,
      password,
    },
  });

// Find user email verification in db
export const findEmailVerificationById = (userId) =>
  dbClient.emailVerification.findUnique({ where: { userId } });

// Update verifcation string
export const updateEmailVerificationById = (userId, newHashedString) =>
  dbClient.emailVerification.findUnique({
    where: { userId },
    data: {
      uniqueString: newHashedString,
    },
  });

export const findResetRequest = (userId) =>
  dbClient.passwordReset.findUnique({
    where: { userId },
  });

export const findUserById = (userId) =>
  dbClient.user.findUnique({
    where: {
      id: userId,
    },
  });

export const resetUserPassword = (userId, password) =>
  dbClient.user.update({
    where: {
      id: userId,
    },
    data: {
      password,
    },
  });

export const deleteUserById = (userId) =>
  dbClient.user.delete({
    where: {
      id: userId,
    },
  });

export const updateUserById = (userId, email) =>
  dbClient.user.update({
    where: {
      id: userId,
    },
    data: {
      email,
    },
  });
