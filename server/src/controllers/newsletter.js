import {
  createNewNewsletter,
  createNewsletterSubscriber,
  deleteAllSubscribers,
  deleteNewsletterById,
  deleteNewsletterSubscriberByEmail,
  deleteNewsletterSubscriberById,
  deleteNewsletterVerifcationToken,
  findAllNewsletterSubscribers,
  findNewletterSubscriberByEmail,
  findNewsletterPublicationByDate,
  findNewsletterPublicationById,
  findNewsletterSubscriberByEmail,
  findNewsletterSubscriberById,
  saveNewsletterVerificationToken,
} from '../domain/newsletter.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { sendNewsletterEmail } from '../services/email/emailHandler.js';
import { BusinessName, BusinessUrl } from '../utils/constants.js';
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';

export const getAllNewsletterSubscribersHandler = async (req, res) => {
  try {
    const foundSubscribers = await findAllNewsletterSubscribers();
    console.log('found subscribers:', foundSubscribers);

    if (!foundSubscribers) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { subscribers: foundSubscribers });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get all subscribers failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const subscribeToNewsletterHandler = async (req, res) => {
  const { email, name } = req.body;

  try {
    if (!email) {
      return sendMessageResponse(res, 400, 'Email is required');
    }
    if (!name) {
      return sendMessageResponse(res, 400, 'Name is required');
    }

    const existing = await findNewletterSubscriberByEmail(email);

    if (existing) {
      return sendMessageResponse(res, 409, 'Email already subscribed');
    }

    const newSubscriber = await createNewsletterSubscriber(email, name);
    console.log('newSubscriber', newSubscriber);
    if (!newSubscriber) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.subscribeToNewsletterFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    // Optional: Add verification step logic (UUID, token, etc.)
    const uniqueString = crypto.randomUUID(); // or another token generator
    const expiryTime = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours from now

    // If you're saving verification tokens to DB, you'd do that here:
    const verificationToken = await saveNewsletterVerificationToken(
      newSubscriber.id,
      uniqueString,
      expiryTime
    );

    if (!verificationToken) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.failedToCreateVerificationToken
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }
    // Send email
    const verificationEmailSent = await sendNewsletterEmail(
      newSubscriber.email,
      'Newsletter: Verify email address',
      'newsletterVerificationEmail',
      {
        email: newSubscriber.email,
        name: newSubscriber.name,
        uniqueString: uniqueString,
        expiryTime: verificationToken.expiresAt,
        verificationUrl: `${process.env.NEWSLETTER_CONFIRM_EMAIL_URL}/subscribe?id=${newSubscriber.id}$uniqueString=${verificationToken.uniqueString}`,
        businessUrl: `${BusinessUrl}`,
        businessName: `${BusinessName}`,
      }
    );

    console.log('verificationEmailSent');

    if (!verificationEmailSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.verificationEmailFailed
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }
    console.log('XXXX');
    return sendDataResponse(res, 201, { subscriber: newSubscriber });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Subscription failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteNewsletterSubscriberByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return sendMessageResponse(res, 400, 'Subscriber ID is required');
    }

    const existing = await findNewsletterSubscriberById(id);

    if (!existing) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedSub = await deleteNewsletterSubscriberById(id);
    if (!deletedSub) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteSubscriberFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendMessageResponse(res, 200, 'Subscriber deleted successfully');
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete newsletter subscriber failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteNewsletterSubscriberByEmailHandler = async (req, res) => {
  const { email } = req.params;

  try {
    if (!email) {
      return sendMessageResponse(res, 400, 'Subscriber email is required');
    }

    const existing = await findNewsletterSubscriberByEmail(email);

    if (!existing) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedSub = await deleteNewsletterSubscriberByEmail(email);
    if (!deletedSub) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteSubscriberFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendMessageResponse(res, 200, 'Subscriber deleted successfully');
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete newsletter subscriber by email failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteAllNewsletterSubscribersHandler = async (req, res) => {
  try {
    const deletedSubs = await deleteAllSubscribers();
    if (!deletedSubs) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteSubscriberFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendMessageResponse(res, 200, 'Subscriber deleted successfully');
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete newsletter subscriber by email failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

///// Publication admin //////
export const getNewsletterByIdHandler = async (req, res) => {
  const { newsletterId } = req.params;

  if (!newsletterId) {
    return sendDataResponse(res, 409, {
      message: `Newsletter publication ID is missing.`,
    });
  }

  try {
    const foundNewsletterPublication = await findNewsletterPublicationById(
      newsletterId
    );
    console.log('found pub:', foundNewsletterPublication);

    if (!foundNewsletterPublication) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterPublicatonNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, {
      newsletter: foundNewsletterPublication,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get newsletter by ID failed.'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getNewsletterByDateHandler = async (req, res) => {
  const { publicationDate } = req.params;

  if (!publicationDate) {
    return sendDataResponse(res, 409, {
      message: `Newsletter publication ID is missing.`,
    });
  }

  try {
    const foundNewsletterPublication = await findNewsletterPublicationByDate(
      publicationDate
    );
    console.log(
      'found foundNewsletterPublication:',
      foundNewsletterPublication
    );

    if (!foundNewsletterPublication) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterPublicatonNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, {
      newsletter: foundNewsletterPublication,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get all subscribers failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const createNewsletterDraftHandler = async (req, res) => {
  try {
    const createdNewsletter = await createNewNewsletter();
    console.log('createdNewsletter:', createdNewsletter);

    if (!createdNewsletter) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createNewsletterFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, { newsletter: createdNewsletter });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Create new newsletter failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const publishNewsletterHandler = async (req, res) => {
  const { newsletterId } = req.params;

  if (!newsletterId) {
    return sendDataResponse(res, 409, {
      message: `Newsletter publication ID is missing.`,
    });
  }

  try {
    const foundNewsletterPublication = await findNewsletterPublicationById(
      newsletterId
    );
    console.log('found pub:', foundNewsletterPublication);

    if (!foundNewsletterPublication) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterPublicatonNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // List of subs and name
    // Send each an email with name on the top
    // Try to disconnect and send to not have to keep connection alive

    return sendDataResponse(res, 200, {
      status: 'Success - Newsletter was published',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get all subscribers failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const saveNewsletterDraftHandler = async (req, res) => {
  try {
    const foundSubscribers = await findAllNewsletterSubscribers();
    console.log('found subscribers:', foundSubscribers);

    if (!foundSubscribers) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { subscribers: foundSubscribers });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get all subscribers failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteNewsletterHandler = async (req, res) => {
  const { newsletterId } = req.params;

  if (!newsletterId) {
    return sendDataResponse(res, 409, {
      message: `Newsletter publication ID is missing.`,
    });
  }

  try {
    const foundNewsletterPublication = await findNewsletterPublicationById(
      newsletterId
    );
    console.log('found pub:', foundNewsletterPublication);

    if (!foundNewsletterPublication) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterPublicatonNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedNewsletter = await deleteNewsletterById(newsletterId);
    console.log('deletedNewsletter:', deletedNewsletter);

    if (!deletedNewsletter) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteNewsletterFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Newsletter deleted',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete newsletter failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const sendBulkNewsletterEmail = async (req, res) => {
  const { newsletterId } = req.body;

  try {
    if (!newsletterId) {
      return sendDataResponse(res, 409, {
        message: `Newsletter publication ID is missing.`,
      });
    }

    const foundNewsletterPublication = await findNewsletterPublicationById(
      newsletterId
    );
    console.log('found pub:', foundNewsletterPublication);

    if (!foundNewsletterPublication) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterPublicatonNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundSubscribers = await findAllNewsletterSubscribers();
    console.log('found subscribers:', foundSubscribers);

    if (!foundSubscribers) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    console.log('Sending newsletter to all subscribers...');
    const results = await Promise.allSettled(
      foundSubscribers.map(async (subscriber) => {
        const unsubscribeLink = `${process.env.URL}/subscriber/unsubscribe?id=${subscriber.id}`;

        // ✅ Send to each subscriber using your single-email function
        return await sendNewsletterEmail(
          subscriber.email,
          `Newsletter: ${foundNewsletterPublication.title}`,
          'newsletterConfirmationEmail',
          {
            name: subscriber.name || '',
            email: subscriber.email,
            title: foundNewsletterPublication.title,
            content: foundNewsletterPublication.content,
            unsubscribeLink: unsubscribeLink,
            businessUrl: `${BusinessUrl}`,
            businessName: `${BusinessName}`,
          }
        );
      })
    );

    console.log('✅ All newsletter emails processed');

    return sendDataResponse(res, 200, {
      message: 'Success',
      results: results,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Send mass email to newsletter subscribers failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


export const unsubscribeNewsletterLinkHandler = async (req, res) => {
  const { userId, uniqueString } = req.params;

  if (!userId || !uniqueString) {
    return sendMessageResponse(res, 400, 'Missing userId or uniqueString.');
  }

  try {
    // Find the subscriber by ID
    const subscriber = await findNewsletterSubscriberById(userId);
    if (!subscriber) {
      return sendMessageResponse(res, 404, 'Subscriber not found.');
    }

    // Find their verification token by subscriberId
    const tokenRecord = await prisma.newsletterVerificationToken.findUnique({
      where: { subscriberId: userId },
    });

    // Delete the subscriber
    await deleteNewsletterSubscriberById(userId);

    // Optionally delete the token too
    await deleteNewsletterVerifcationToken(userId)

    return sendMessageResponse(res, 200, 'You have been unsubscribed successfully.');
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Unsubscribe failed: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};