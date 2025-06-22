// Status responses
const STATUS_MESSAGES = {
  200: `success`,
  201: `success`,
  400: `fail`,
  401: `fail`,
  403: `fail`,
  404: `fail`,
  500: `error`,
};

export const EVENT_MESSAGES = {
  badRequest: `Bad Request`,
  notFound: `Not Found`,
  missingUserIdentifier: `Missing User identifier`,
  missingFields: `Missing fields in request`,
  malformedData: `Data incorrectly formatted or malformed request`,
  // Contacts
  contactTag: `Contact database.`,
  contactFormsNotFound: `Failed to find contact form(s).`,
  createContactFormFail: `Failed to create contact form.`,
  createCallbackFormFail: `Failed to create callback form.`,
  // Events
  eventTag: `Event database.`,
  eventNotFound: `Failed to find event.`,
  createEventFail: `Failed to create event.`,
  // Bookings
  bookingTag: `Booking database.`,
  bookingNotFound: `Failed to find booking/s.`,
  openingTimesNotFound: `Failed to find opening Time/s.`,
  closedDaysNotFound: `Failed to find closed day/s.`,
  createBookingFail: `Failed to create booking.`,
  updateBookingString: `Failed to update booking string.`,
  closedDayFail: `Failed to create closed day in calender.`,
  closedDayNotdeleted: `Failed do delete closed day.`,
  notificationSendingFail: `Failed to create booking.`,
  recievedBookingSendingFail: `Failed to create booking.`,
  deleteBookingFail: `Failed to delete booking.`,
  confirmBookingFail: `Failed to confirm booking.`,
  updateBookingFail: `Failed to update booking.`,
  denyBookingFail: `Failed to deny booking.`,
  // Reviews
  reviewTag: `Review database.`,
  reviewNotFound: `Failed to find review/s.`,
  createReviewFail: `Failed to create review.`,
  deleteReviewFail: `Failed to delete review.`,
  // Newsletter
  newsletterTag: `Newsletter database.`,
  newsletterNotFound: `Failed to find newsletter/s.`,
  newsletterSubscribersNotFound: `Failed to find newsletter subscriber.`,
  subscribeToNewsletterFail: `Failed to subscribe to newsletter.`,
  noVerificationTokensFound: `No newsletter verification tokens found.`,
  createNewsletterFail: `Failed to create newsletter.`,
  publishNewsletterFail: `Failed to publish newsletter.`,
  newsletterPublicatonNotFound: `Failed to find newsletter publication.`,
  failedToFindNewsletterDrafts: `Failed to find newsletter draft(s).`,
  failedToSetNewsletterPublished: `Failed to set newsletter draftas published.`,
  failedToUpdateNewsletterDraft: `Failed to update newsletter draft.`,
  failedToCreateVerificationToken: `Failed to create verification token.`,
  failedToSendNewsletterVerificationEmail: `Failed to send verification email.`,
  deleteSubscriberFailed: `Failed to delete newsletter subscriber from list.`,
  deleteNewsletterTokenFailed: `Failed to delete newsletter verification token.`,
  deleteNewsletterFail: `Failed to delete newsletter.`,
  // Users
  userTag: `User database.`,
  userNotFound: `Failed to find user(s).`,
  emailInUse: `Email already in use.`,
  emailNotFound: `Email not found in database.`,
  idNotFound: `User ID not found in database.`,
  createUserFail: `Failed to create new user.`,
  passwordMatchError: `Password match error for reset. New passwords do not match.`,
  resetPasswordRequestSuccessful: `Password reset email has been sent successfully.`,
  passwordResetError: `Account record doesn't exist or has been reset already.`,
  passwordResetEmailError: `Failed to send password reset email.`,
  updateUserError: `Failed to update user.`,
  deleteUserError: `Failed to delete user.`,
  // Verification
  verificationTag: `Verification database.`,
  verificationNotFound: `Failed to find verification.`,
  verificationUpdateFailed: `Failed to update verification.`,
  verificationEmailFailed: `Failed to send verification email.`,
  verificationNotFoundReturn: `Account record doesn't exist or has been verified already. Please sign up or log in.`,
  expiredLinkMessage: `Link has expired. Please sign up or log in and check your account.`,
  invalidVerification: `Invalid verification details passed. Check your inbox, or contact support.`,
};

// Error responses for eventEmitter/errors
export const RESPONSE_MESSAGES = {
  ConflictEvent: `Request conflicts with data on server.`,
  DeactivatedUserEvent: `The target user account has been deactivated.`,
  ServerErrorEvent: `Internal Server Error.`,
  CreateEventError: `Failed to create an event log.`,
  NotFoundEvent: `Was not found.`,
  NoPermissionEvent: `You are not authorized to perform this action.`,
  NoValidationEvent: `Unable to verify user.`,
  BadRequestEvent: `Incorrect request syntax or malformed request.`,
  MissingFieldEvent: `Missing fields in body.`,
};

// Data responses
export function sendDataResponse(res, statusCode, payload) {
  return res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    data: payload,
  });
}

// Error responses
export function sendMessageResponse(res, statusCode, message) {
  return res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    message,
  });
}
 