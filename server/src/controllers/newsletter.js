import {
  createNewsletterSubscriber,
  deleteAllSubscribers,
  deleteNewsletterSubscriberByEmail,
  deleteNewsletterSubscriberById,
  findAllNewsletterSubscribers,
  findNewletterSubscriberByEmail,
  findNewsletterSubscriberByEmail,
  findNewsletterSubscriberById,
} from '../domain/newsletter.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
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
  const { email } = req.body;

  try {
    if (!email) {
      return sendMessageResponse(res, 400, 'Email is required');
    }

    const existing = await findNewletterSubscriberByEmail(email);

    if (existing) {
      return sendMessageResponse(res, 409, 'Email already subscribed');
    }

    const newSubscriber = await createNewsletterSubscriber(email);

    if (!newSubscriber) {
      const notFound = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.subscribeToNewsletterFail
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

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
