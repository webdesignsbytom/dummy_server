// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  BadRequestEvent,
  MissingFieldEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { v4 as uuid } from 'uuid';
import { createNewReview, deleteAllReviews, deleteReviewById, findAllReviews, findReviewById, findReviewsByDate, findReviewsByEmail } from '../domain/reviews.js';

export const getAllReviewsHandler = async (req, res) => {
  try {
    const foundReviews = await findAllReviews();

    if (!foundReviews) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.reviewNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { reviews: foundReviews });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all reviews failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getReviewByIdHandler = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await findReviewById(reviewId);

    if (!review) {
      const notFound = new NotFoundEvent(
        req.user,
        `Review with ID ${reviewId} not found.`,
        `No review found for the given ID.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { review });
  } catch (err) {
    console.error('Error fetching review by ID:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch review by ID`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getReviewsByDateHandler = async (req, res) => {
  const { date } = req.params;

  try {
    const reviews = await findReviewsByDate(date);

    if (!reviews || reviews.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        `No reviews found for date: ${date}`,
        `No reviews exist for the selected date.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { reviews });
  } catch (err) {
    console.error('Error fetching reviews by date:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch reviews by date`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getReviewsByEmailHandler = async (req, res) => {
  const { email } = req.params;

  try {
    const reviews = await findReviewsByEmail(email);

    if (!reviews || reviews.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        `No reviews found for email: ${email}`,
        `No reviews exist for the provided email address.`
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { reviews });
  } catch (err) {
    console.error('Error fetching reviews by email:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      `Failed to fetch reviews by email`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const createNewReviewHandler = async (req, res) => {
  const { firstName, lastName, phoneNumber, email, rating, message } = req.body;

  if (
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !email ||
    rating == null ||
    !message
  ) {
    const missingField = new MissingFieldEvent(
      null,
      'Review: Missing field(s) in request.'
    );
    return sendMessageResponse(res, missingField.code, missingField.message);
  }

  try {
    const createdReview = await createNewReview(
      firstName,
      lastName,
      phoneNumber,
      email,
      rating,
      message
    );

    if (!createdReview) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createReviewFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 201, { review: createdReview });
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      `Review creation request Server error ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteReviewHandler = async (req, res) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    return sendDataResponse(res, 409, {
      message: `Review ID is missing.`,
    });
  }

  try {
    const foundReview = await findReviewById(reviewId);

    if (!foundReview) {
      const notFound = new BadRequestEvent(
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.reviewNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedReview = await deleteReviewById(reviewId);

    if (!deletedReview) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteReviewFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Review deleted',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete review failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteAllReviewHandler = async (req, res) => {
  try {
    const deletedReviews = await deleteAllReviews();

    if (!deletedReviews) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteReviewFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 200, {
      message: 'Success: Reviews deleted',
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Delete review failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
