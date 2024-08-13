import dbClient from '../utils/dbClient.js';

export const findAllUsers = () =>
  dbClient.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findUserByEmail = (email) =>
  dbClient.user.findUnique({
    where: { email: email },
  });

export const findUsersByRole = (role) =>
  dbClient.user.findMany({
    where: {
      role: role,
    },
  });

export const createNewUser = (email, password) =>
  dbClient.user.create({
    data: {
      email: email,
      password: password,
    },
  });

export const findVerification = (userId) =>
  dbClient.userVerification.findUnique({
    where: {
      userId: userId,
    },
  });

export const findResetRequest = (userId) =>
  dbClient.passwordReset.findUnique({
    where: {
      userId: userId,
    },
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
      password: password,
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
