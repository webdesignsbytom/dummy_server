import dbClient from '../utils/dbClient.js';

export const findAllNewsletterSubscribers = async () =>
  dbClient.newsletterSubscriber.findMany({});

export const findNewletterSubscriberByEmail = async (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const createNewsletterSubscriber = async (email) =>
  dbClient.newsletterSubscriber.create({ data: { email } });

export const findNewsletterSubscriberById = async (id) =>
  dbClient.newsletterSubscriber.findUnique({ where: { id } });

export const deleteNewsletterSubscriberById = async (id) =>
  dbClient.newsletterSubscriber.delete({ where: { id } });

export const findNewsletterSubscriberByEmail = async (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const deleteNewsletterSubscriberByEmail = async (email) =>
  dbClient.newsletterSubscriber.delete({ where: { email } });

export const deleteAllSubscribers = async () =>
  dbClient.newsletterSubscriber.deleteMany({});
