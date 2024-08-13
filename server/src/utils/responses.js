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
  contactNotFound: `Failed to find contact(s).`,
  createContactFail: `Failed to create contact.`,
  // Events
  eventTag: `Event database.`,
  eventNotFound: `Failed to find event.`,
  createEventFail: `Failed to create event.`,
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
 