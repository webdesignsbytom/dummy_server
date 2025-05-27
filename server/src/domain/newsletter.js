import dbClient from '../utils/dbClient.js';

export const findAllNewsletterSubscribers = () =>
  dbClient.newsletterSubscriber.findMany({});

export const findNewletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const createNewsletterSubscriber = (email, name) =>
  dbClient.newsletterSubscriber.create({ data: { email, name } });

export const findNewsletterSubscriberById = (id) =>
  dbClient.newsletterSubscriber.findUnique({ where: { id } });

export const deleteNewsletterSubscriberById = (id) =>
  dbClient.newsletterSubscriber.delete({ where: { id } });

export const findNewsletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const deleteNewsletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.delete({ where: { email } });

export const deleteAllSubscribers = () =>
  dbClient.newsletterSubscriber.deleteMany({});

// Admin
export const createNewNewsletter = () =>
  dbClient.newsletterPublication.create({ data: {} });
