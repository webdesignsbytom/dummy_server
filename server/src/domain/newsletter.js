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

export const deleteNewsletterVerifcationToken = (id) =>
  dbClient.newsletterVerificationToken.delete({
      where: { subscriberId: id },
    });

export const saveNewsletterVerificationToken = async (
  subscriberId,
  uniqueString,
  expiresAt
) => {
  try {
    // Delete any existing token for this subscriber
    await dbClient.newsletterVerificationToken.deleteMany({
      where: { subscriberId },
    });

    // Create a new token
    const token = await dbClient.newsletterVerificationToken.create({
      data: {
        subscriberId,
        uniqueString,
        expiresAt,
      },
    });

    return token;
  } catch (err) {
    console.error('Error saving newsletter verification token:', err);
    return null;
  }
};

// Admin
export const createNewNewsletter = () =>
  dbClient.newsletterPublication.create({ data: {} });

export const findNewsletterPublicationById = (id) =>
  dbClient.newsletterPublication.findUnique({ where: { id } });

export const findNewsletterPublicationByDate = (date) =>
  dbClient.newsletterPublication.findUnique({ where: { sentAt: date } });

export const deleteNewsletterById = (id) =>
  dbClient.newsletterPublication.delete({ where: { id } });
