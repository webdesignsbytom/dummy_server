import dbClient from '../utils/dbClient.js';

export const findAllNewsletterSubscribers = () =>
  dbClient.newsletterSubscriber.findMany({});

export const findNewletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const createNewsletterSubscriber = (email, name) =>
  dbClient.newsletterSubscriber.create({ data: { email, name } });

export const findNewsletterSubscriberById = (id) =>
  dbClient.newsletterSubscriber.findUnique({ where: { id } });

export const findNewsletterTokenById = (id) =>
  dbClient.newsletterVerificationToken.findUnique({ where: { id } });

export const deleteNewsletterSubscriberById = (id) =>
  dbClient.newsletterSubscriber.delete({ where: { id } });

export const verifyNewsletterSubscriber = (id, uniqueStringUnsubscribe) =>
  dbClient.newsletterSubscriber.update({
    where: { id },
    data: {
      isVerified: true,
      uniqueStringUnsubscribe: uniqueStringUnsubscribe,
    },
  });

export const setAllSubscribersToUnverified = async () =>
  dbClient.newsletterSubscriber.updateMany({
    data: { isVerified: false },
  });

export const findNewsletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.findUnique({ where: { email } });

export const deleteNewsletterSubscriberByEmail = (email) =>
  dbClient.newsletterSubscriber.delete({ where: { email } });

export const deleteAllSubscribers = () =>
  dbClient.newsletterSubscriber.deleteMany({});

export const deleteNewsletterVerifcationToken = (id) =>
  dbClient.newsletterVerificationToken.delete({
    where: { id },
  });

export const findAllVerificationTokens = () =>
  dbClient.newsletterVerificationToken.findMany({});

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
  dbClient.newsletterPublication.create({ data: { title: '', content: '' } });

export const findNewsletterPublicationById = (id) =>
  dbClient.newsletterPublication.findUnique({ where: { id } });

export const findNewsletterPublicationByDate = (date) =>
  dbClient.newsletterPublication.findUnique({ where: { sentAt: date } });

export const deleteNewsletterById = (id) =>
  dbClient.newsletterPublication.delete({ where: { id } });

export const findAllNewsletterDrafts = () =>
  dbClient.newsletterPublication.findMany({
    where: { isPublished: false },
    orderBy: { createdAt: 'desc' },
  });

export const findVerifiedNewsletterSubscribers = () =>
  dbClient.newsletterSubscriber.findMany({
    where: {
      isVerified: true,
    },
  });

export const findNewsletterDraftById = (id) =>
  dbClient.newsletterPublication.findUnique({
    where: { id },
  });

export const updateNewsletterDraft = (id, title, content) =>
  dbClient.newsletterPublication.update({
    where: { id },
    data: { title, content },
  });

export const findAllPublishedNewsletters = () =>
  dbClient.newsletterPublication.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });
