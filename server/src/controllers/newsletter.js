import {
  createAndSaveNewNewsletter,
  createNewNewsletter,
  createNewsletterSubscriber,
  deleteAllSubscribers,
  deleteNewsletterById,
  deleteNewsletterSubscriberByEmail,
  deleteNewsletterSubscriberById,
  deleteNewsletterVerifcationToken,
  findAllNewsletterDrafts,
  findAllNewsletterSubscribers,
  findAllPublishedNewsletters,
  findAllVerificationTokens,
  findNewletterSubscriberByEmail,
  findNewsletterDraftById,
  findNewsletterPublicationByDate,
  findNewsletterPublicationById,
  findNewsletterSubscriberByEmail,
  findNewsletterSubscriberById,
  findNewsletterTokenById,
  findVerifiedNewsletterSubscribers,
  saveAsPublished,
  saveNewsletterVerificationToken,
  setAllSubscribersToUnverified,
  updateNewsletterDraft,
  verifyNewsletterSubscriber,
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
import { Client } from '@upstash/qstash';
import chunkArray from '../utils/chunkArray.js'; // helper to split into batches

// Subscribers
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
  console.log('email', email);
  console.log('name', name);
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
    console.log('uniqueString', uniqueString);

    // If you're saving verification tokens to DB, you'd do that here:
    const verificationToken = await saveNewsletterVerificationToken(
      newSubscriber.id,
      uniqueString,
      expiryTime
    );
    console.log('verificationToken', verificationToken);

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
        verificationUrl: `${process.env.NEWSLETTER_CONFIRM_EMAIL_URL}/${newSubscriber.id}/${verificationToken.uniqueString}/${verificationToken.id}`,
        businessUrl: `${BusinessUrl}`,
        businessName: `${BusinessName}`,
      }
    );

    console.log('verificationEmailSent', verificationEmailSent);

    if (!verificationEmailSent) {
      const badRequest = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.verificationEmailFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
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
    const token = await findNewsletterTokenById(userId);

    // Delete the subscriber
    const deletedSubscriber = await deleteNewsletterSubscriberById(userId);
    if (!deletedSubscriber) {
      const badRequest = new BadRequestEvent(
        userId,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteSubscriberFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    // Optionally delete the token too
    if (token) {
      const deletedToken = await deleteNewsletterVerifcationToken(userId);

      if (!deletedToken) {
        const badRequest = new BadRequestEvent(
          userId,
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.deleteNewsletterTokenFailed
        );
        myEmitterErrors.emit('error', badRequest);
        return sendMessageResponse(res, badRequest.code, badRequest.message);
      }
    }

    return sendMessageResponse(
      res,
      200,
      'You have been unsubscribed successfully.'
    );
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

export const confirmEmailAddressHandler = async (req, res) => {
  const { userId, verificationId, uniqueString } = req.params;

  if (!userId || !verificationId || !uniqueString) {
    return sendMessageResponse(
      res,
      400,
      'Missing one or more required parameters.'
    );
  }

  try {
    // Get token record
    const token = await findNewsletterTokenById(verificationId);
    console.log('token', token);
    if (!token || token.subscriberId !== userId) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.verificationNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(
        res,
        404,
        'Invalid or expired verification link.'
      );
    }

    // Check if expired
    if (new Date(token.expiresAt).getTime() < Date.now()) {
      await deleteNewsletterVerifcationToken(verificationId);
      return sendMessageResponse(res, 410, 'Verification link has expired.');
    }

    // Check if token matches (use bcrypt if stored as hash)
    const isValid = token.uniqueString === uniqueString;

    if (!isValid) {
      return sendMessageResponse(res, 401, 'Verification string is invalid.');
    }

    console.log('AAAAA');
    // Optional: Add verification step logic (UUID, token, etc.)
    const uniqueStringUnsubscribe = crypto.randomUUID(); // or another token generator

    // Mark subscriber as verified
    await verifyNewsletterSubscriber(userId, uniqueStringUnsubscribe);
    console.log('BBB');

    // Delete verification token
    await deleteNewsletterVerifcationToken(verificationId);
    console.log('XXXX');

    return sendDataResponse(res, 200, {
      message: 'Your email has been verified successfully.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Email verification failed: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const resendNewsletterVerificationEmailHandler = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return sendMessageResponse(res, 400, 'User ID is required.');
  }

  try {
    const subscriber = await findNewsletterSubscriberById(userId);

    if (!subscriber) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Subscriber not found.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (subscriber.isVerified) {
      return sendMessageResponse(res, 400, 'User is already verified.');
    }

    const uniqueString = crypto.randomUUID();
    const expiryTime = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hrs

    const verificationToken = await saveNewsletterVerificationToken(
      subscriber.id,
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

    const emailSent = await sendNewsletterEmail(
      subscriber.email,
      'Newsletter: Verify email address', // Title
      'newsletterVerificationEmail', // Email template
      {
        email: subscriber.email,
        name: subscriber.name,
        uniqueString: uniqueString,
        expiryTime: verificationToken.expiresAt,
        verificationUrl: `${process.env.NEWSLETTER_CONFIRM_EMAIL_URL}/${subscriber.id}/${verificationToken.uniqueString}/${verificationToken.id}`,
        businessUrl: `${BusinessUrl}`,
        businessName: `${BusinessName}`,
      }
    );

    if (!emailSent) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.failedToSendNewsletterVerificationEmail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, emailFail.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Verification email resent successfully.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Resend verification email failed: ${err.message}`
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

export const createAndSaveNewsletterDraftHandler = async (req, res) => {
  const { title, content } = req.body;
  console.log('title', content);

  if (!title || !content) {
    const notFound = new NotFoundEvent(
      req.user,
      EVENT_MESSAGES.notFound,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', notFound);
    return sendMessageResponse(res, notFound.code, notFound.message);
  }

  try {
    const createdNewsletter = await createAndSaveNewNewsletter(title, content);
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

export const sendBulkNewsletterEmailHandler = async (req, res) => {
  const { newsletterId } = req.body;
  console.log('newsletterId', newsletterId);

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

    const foundSubscribers = await findVerifiedNewsletterSubscribers();
    console.log('found subscribers:', foundSubscribers);

    if (!foundSubscribers || foundSubscribers.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.newsletterSubscribersNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    console.log('Queueing newsletter in background...');

    const batches = chunkArray(foundSubscribers, 1); // 10 emails per batch
    console.log('');
    console.log('BATCHES', batches);
    const client = new Client({ token: process.env.QSTASH_TOKEN });

    const qstashResults = await Promise.allSettled(
      batches.map((batch, i) => {
        const payload = {
          newsletterId,
          batch: batch.map((s) => ({
            id: s.id,
            email: s.email,
            name: s.name,
            uniqueStringUnsubscribe: s.uniqueStringUnsubscribe,
          })),
        };
        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        console.log('`${process.env.SERVER_URL}', `${process.env.SERVER_URL}`);
        return client.publish({
          url: `${process.env.SERVER_URL}/newsletter/process-batch`,
          body: JSON.stringify(payload), // 🔥 JSON.stringify the payload
          headers: {
            'Content-Type': 'application/json',
          },
        });
      })
    );

    console.log('✅ All newsletter batches queued');

    return sendDataResponse(res, 200, {
      message: 'Newsletter send has been queued successfully.',
      qstashResults,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Queue mass newsletter emails failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const processNewsletterBatchHandler = async (req, res) => {
  console.log('🛠 Raw req.body:', req.body);

  const { newsletterId, batch } = req.body;

  console.log('🔁 Processing batch for newsletterId:', newsletterId);
  console.log('📦 Batch size:', batch?.length);

  try {
    if (!newsletterId || !Array.isArray(batch) || batch.length === 0) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Missing newsletterId or batch data in request body.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    const foundNewsletterPublication = await findNewsletterPublicationById(
      newsletterId
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

    console.log('foundNewsletterPublication', foundNewsletterPublication);

    for (const subscriber of batch) {
      const unsubscribeLink = `${process.env.NEWSLETTER_UNSUBSCRIBE_URL}/${subscriber.id}${subscriber.uniqueStringUnsubscribe}`;

      await sendNewsletterEmail(
        subscriber.email,
        `Newsletter: ${foundNewsletterPublication.title}`,
        'newsletterEmail',
        {
          name: subscriber.name || '',
          email: subscriber.email,
          title: foundNewsletterPublication.title,
          content: foundNewsletterPublication.content,
          unsubscribeLink: unsubscribeLink,
          businessUrl: BusinessUrl,
          businessName: BusinessName,
        }
      );
    }

    console.log(`✅ Finished processing batch of ${batch.length} emails.`);
    return sendDataResponse(res, 200, {
      message: 'Batch processed successfully.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Failed to process email batch for newsletter'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// export const sendBulkNewsletterEmailHandler = async (req, res) => {
//   const { newsletterId } = req.body;
//   console.log('newsletterId', newsletterId);

//   try {
//     if (!newsletterId) {
//       return sendDataResponse(res, 409, {
//         message: `Newsletter publication ID is missing.`,
//       });
//     }

//     const foundNewsletterPublication = await findNewsletterPublicationById(
//       newsletterId
//     );
//     console.log('found pub:', foundNewsletterPublication);

//     if (!foundNewsletterPublication) {
//       const notFound = new NotFoundEvent(
//         req.user,
//         EVENT_MESSAGES.notFound,
//         EVENT_MESSAGES.newsletterPublicatonNotFound
//       );
//       myEmitterErrors.emit('error', notFound);
//       return sendMessageResponse(res, notFound.code, notFound.message);
//     }

//     const foundSubscribers = await findVerifiedNewsletterSubscribers();
//     console.log('found subscribers:', foundSubscribers);

//     if (!foundSubscribers) {
//       const notFound = new NotFoundEvent(
//         req.user,
//         EVENT_MESSAGES.notFound,
//         EVENT_MESSAGES.newsletterSubscribersNotFound
//       );
//       myEmitterErrors.emit('error', notFound);
//       return sendMessageResponse(res, notFound.code, notFound.message);
//     }

//     console.log('Sending newsletter to all subscribers...');

//     const results = await Promise.allSettled(
//       foundSubscribers.map(async (subscriber) => {
//         const unsubscribeLink = `${process.env.URL}/unsubscribe?id=${subscriber.id}&uninqeString=${subscriber.uniqueStringUnsubscribe}`;

//         // ✅ Send to each subscriber using your single-email function
//         return await sendNewsletterEmail(
//           subscriber.email,
//           `Newsletter: ${foundNewsletterPublication.title}`,
//           'newsletterEmail',
//           {
//             name: subscriber.name || '',
//             email: subscriber.email,
//             title: foundNewsletterPublication.title,
//             content: foundNewsletterPublication.content,
//             unsubscribeLink: unsubscribeLink,
//             businessUrl: `${BusinessUrl}`,
//             businessName: `${BusinessName}`,
//           }
//         );
//       })
//     );

//     const publishedResult = await saveAsPublished(
//       foundNewsletterPublication.id
//     );

//     if (!publishedResult) {
//       const badRequest = new BadRequestEvent(
//         req.user,
//         EVENT_MESSAGES.badRequest,
//         EVENT_MESSAGES.failedToSetNewsletterPublished
//       );
//       myEmitterErrors.emit('error', badRequest);
//       return sendMessageResponse(res, badRequest.code, badRequest.message);
//     }
//     console.log('✅ All newsletter emails processed');

//     return sendDataResponse(res, 200, {
//       message: 'Success',
//       results: results,
//     });
//   } catch (err) {
//     const serverError = new ServerErrorEvent(
//       req.user,
//       'Send mass email to newsletter subscribers failed'
//     );
//     myEmitterErrors.emit('error', serverError);
//     sendMessageResponse(res, serverError.code, serverError.message);
//     throw err;
//   }
// };

// Verification admin
export const getAllNewsletterVerificationTokensHandler = async (req, res) => {
  try {
    const foundtokens = await findAllVerificationTokens();

    if (!foundtokens || foundtokens.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.noVerificationTokensFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, 404, 'No verification tokens found.');
    }

    return sendDataResponse(res, 200, { tokens: foundtokens });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch newsletter verification tokens: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const manuallyVerifySubscriberHandler = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return sendMessageResponse(res, 400, 'User ID is required.');
  }

  try {
    const subscriber = await findNewsletterSubscriberById(userId);

    if (!subscriber) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Subscriber not found.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (subscriber.isVerified) {
      return sendMessageResponse(res, 409, 'Subscriber is already verified.');
    }

    const uniqueStringUnsubscribe = crypto.randomUUID();

    const updated = await verifyNewsletterSubscriber(
      userId,
      uniqueStringUnsubscribe
    );

    if (!updated) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        'Failed to manually verify subscriber.'
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Subscriber has been manually verified.',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Manual subscriber verification failed: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const setAllUsersUnverifiedHandler = async (req, res) => {
  try {
    const updated = await setAllSubscribersToUnverified();

    if (!updated) {
      const serverError = new ServerErrorEvent(
        req.user,
        'No subscribers were updated.'
      );
      myEmitterErrors.emit('error', serverError);
      return sendMessageResponse(res, 500, 'Failed to update subscribers.');
    }

    return sendDataResponse(res, 200, {
      message: 'All subscribers set to unverified.',
      updated,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to reset subscriber verification: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// Subscriber admin
export const deleteNewsletterSubscriberByIdHandler = async (req, res) => {
  const { id } = req.params;
  console.log('XXXXXX id', id);

  try {
    if (!id) {
      return sendMessageResponse(res, 400, 'Subscriber ID is required');
    }

    const existingSubscriber = await findNewsletterSubscriberById(id);
    console.log('existingSubscriber', existingSubscriber);
    if (!existingSubscriber) {
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
    console.log('deletedSub', deletedSub);

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

    return sendMessageResponse(
      res,
      200,
      'Subscribers all deleted successfully'
    );
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

// Draft
export const getAllNewsletterDraftsHandler = async (req, res) => {
  try {
    const foundDrafts = await findAllNewsletterDrafts();
    console.log('foundDrafts', foundDrafts);
    if (!foundDrafts) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.failedToFindNewsletterDrafts
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { drafts: foundDrafts });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Find all newsletter drafts failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getNewsletterDraftByIdHandler = async (req, res) => {
  const { newsletterId } = req.params;
  console.log('newsletterId', newsletterId);

  try {
    const foundDraft = await findNewsletterDraftById(newsletterId);
    if (!foundDraft) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.failedToFindNewsletterDrafts
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { draft: foundDraft });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Fetch draft by ID failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const updateNewsletterDraftHandler = async (req, res) => {
  const { id, title, content } = req.body;

  console.log('id', id);
  console.log('title', title);
  console.log('content', content);
  try {
    const updatedDraft = await updateNewsletterDraft(id, title, content);
    console.log('updatedDraft', updatedDraft);
    if (!updatedDraft) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.failedToUpdateNewsletterDraft
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      updatedDraft: updatedDraft,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Draft update failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getAllPublishedNewslettersHandler = async (req, res) => {
  try {
    const publishedNewsletters = await findAllPublishedNewsletters();
    console.log('publishedNewsletters', publishedNewsletters);

    if (!publishedNewsletters) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'No published newsletters found.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { newsletters: publishedNewsletters });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Fetching published newsletters failed: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};
