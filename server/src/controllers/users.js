import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbClient from '../utils/dbClient.js';
// Email handlers
import { sendUserVerificationEmail } from '../services/email/emailHandler.js';
import {
  createVerificationEmailHandler,
  createPasswordResetEmailHandler,
} from './email.js';
// Emitters
import { myEmitterUsers } from '../event/userEvents.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  findAllUsers,
  findUserByEmail,
  createNewUser,
  findResetRequest,
  findUserById,
  resetUserPassword,
  deleteUserById,
  updateUserById,
  findUsersByRole,
  findEmailVerificationById,
  updateEmailVerificationById,
  findEmailVerificationByEmail,
} from '../domain/users.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  NotFoundEvent,
  ServerErrorEvent,
  MissingFieldEvent,
  RegistrationServerErrorEvent,
  ServerConflictError,
  BadRequestEvent,
} from '../event/utils/errorUtils.js';
// Randon
import { v4 as uuid } from 'uuid';
import { BusinessName, BusinessUrl } from '../utils/constants.js';

export const getAllUsersHandler = async (req, res) => {
  try {
    const foundUsers = await findAllUsers();
    if (!foundUsers) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterUsers.emit('get-all-users', req.user);
    return sendDataResponse(res, 200, { users: foundUsers });
    //
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all users failed: ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getUserByIdHandler = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return sendDataResponse(res, 400, {
      message: 'Missing user ID.',
    });
  }

  try {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    delete foundUser.password;

    myEmitterUsers.emit('get-user-by-id', req.user);
    return sendDataResponse(res, 200, { user: foundUser });
    //
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      req.user,
      `Get user by ID failed ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const registerNewUserHandler = async (req, res) => {
  const { email, password, agreedToTerms } = req.body;

  try {
    if (!email || !password || !agreedToTerms) {
      const missingField = new MissingFieldEvent(
        null,
        'Registration: Missing Field/s event.'
      );
      return sendMessageResponse(res, missingField.code, missingField.message);
    }

    const lowerCaseEmail = email.toLowerCase();

    const foundUser = await findUserByEmail(lowerCaseEmail);
    if (foundUser) {
      return sendDataResponse(res, 400, { message: EVENT_MESSAGES.emailInUse });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await createNewUser(lowerCaseEmail, hashedPassword);

    if (!createdUser) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createUserFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    delete createdUser.password;
    delete createdUser.updatedAt;

    const uniqueString = uuid() + createdUser.id;
    const hashedString = await bcrypt.hash(uniqueString, 10);

    // Create database verification item
    const newVerification = await createVerificationEmailHandler(
      createdUser.id,
      hashedString
    );
    console.log('newVerification', newVerification);
    // Year for email copyright
    const year = new Date().getFullYear();

    // Send email
    const verificationEmailSent = await sendUserVerificationEmail(
      createdUser.email,
      `${BusinessName}: Verify email address`,
      'userVerifcationEmail',
      {
        title: `${BusinessName}: Verify email address`,
        email: createdUser.email,
        uniqueString: uniqueString,
        expiryTime: newVerification.expiresAt,
        confirmationUrl: `${process.env.USER_VERIFICATION_URL}/verify-email?email=${createdUser.email}$uniqueString=${uniqueString}`,
        businessUrl: BusinessUrl,
        businessName: BusinessName,
        year: year,
      }
    );

    if (!verificationEmailSent) {
      const badRequest = new BadRequestEvent(
        'New User',
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.verificationEmailFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterUsers.emit('register', createdUser);
    return sendDataResponse(res, 201, { user: createdUser });
  } catch (err) {
    // Error
    const serverError = new RegistrationServerErrorEvent(
      `Register Server error ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const verifyUserEmailAddressHandler = async (req, res) => {
  const { email, uniqueString } = req.query; // Or req.params if you're routing that way

  if (!email || !uniqueString) {
    return sendDataResponse(res, 400, {
      message: 'Missing email or verification string.',
    });
  }

  try {
    const foundVerification = await findEmailVerificationByEmail(email)

    if (!foundVerification) {
      return sendMessageResponse(res, 404, EVENT_MESSAGES.verificationNotFoundReturn);
    }

    if (new Date(foundVerification.expiresAt).getTime() < Date.now()) {
      await dbClient.userVerificationEmail.delete({
        where: { id: foundVerification.id },
      });
      return sendMessageResponse(res, 401, EVENT_MESSAGES.expiredLinkMessage);
    }

    const isValidString = await bcrypt.compare(
      uniqueString,
      foundVerification.uniqueString
    );

    if (!isValidString) {
      return sendMessageResponse(res, 401, EVENT_MESSAGES.invalidVerification);
    }

    const updatedUser = await dbClient.user.update({
      where: { id: foundVerification.userId },
      data: { isVerified: true },
    });

    delete updatedUser.password;
    delete updatedUser.updatedAt;
    delete updatedUser.createdAt;

    const token = createAccessToken(updatedUser.id);

    await dbClient.userVerificationEmail.delete({
      where: { id: foundVerification.id },
    });

    myEmitterUsers.emit('verified-email', updatedUser);

    return sendDataResponse(res, 200, { token, user: updatedUser });
  } catch (err) {
    const serverError = new RegistrationServerErrorEvent('Verify New User Server error');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


export const resendVerificationEmailHandler = async (req, res) => {
  const { email } = req.body;
  const { userId } = req.params;

  if (!email || !userId) {
    const badRequest = new BadRequestEvent(
      'user',
      EVENT_MESSAGES.missingUserIdentifier
    );
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundVerification = await findEmailVerificationById(userId);

    if (!foundVerification) {
      // No verification found, create a new one
      const uniqueString = uuid() + userId;
      const hashedString = await bcrypt.hash(
        uniqueString,
        process.env.SALT_ROUNDS
      );

      await createVerificationEmailHandler(userId, hashedString);

      try {
        await sendUserVerificationEmail(userId, email, hashedString);
        myEmitterUsers.emit('verification-email-created', user);
        return sendMessageResponse(
          res,
          200,
          'Verification email sent successfully.'
        );
      } catch (err) {
        const serverError = new ServerConflictError(
          email,
          EVENT_MESSAGES.verificationEmailFailed
        );
        myEmitterErrors.emit('error', serverError);
        return sendMessageResponse(res, serverError.code, serverError.message);
      }
      //
    } else {
      // Verification found, update the unique string and resend the email
      const newUniqueString = uuid() + userId;
      const newHashedString = await bcrypt.hash(newUniqueString, hashRate);

      // Update the existing verification entry
      const updatedVerification = await updateEmailVerificationById(
        userId,
        newHashedString
      );

      if (!updatedVerification) {
        const badRequest = new BadRequestEvent(
          req.user,
          EVENT_MESSAGES.badRequest,
          EVENT_MESSAGES.verificationUpdateFailed
        );
        myEmitterErrors.emit('error', badRequest);
        return sendMessageResponse(res, badRequest.code, badRequest.message);
      }

      try {
        await sendVerificationEmail(userId, email, newUniqueString);
        myEmitterUsers.emit('resend-verification', req.user);
        return sendMessageResponse(
          res,
          200,
          'Verification email resent successfully.'
        );
      } catch (err) {
        const serverError = new ServerConflictError(
          email,
          EVENT_MESSAGES.verificationEmailFailed
        );
        myEmitterErrors.emit('error', serverError);
        return sendMessageResponse(res, serverError.code, serverError.message);
      }
    }
    //
  } catch (err) {
    // Create error instance
    const serverError = new RegistrationServerErrorEvent(
      `Verify new user email server error ${err.message}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const sendPasswordResetEmailHandler = async (req, res) => {
  const { resetEmail } = req.body;

  if (!resetEmail) {
    const badRequest = new BadRequestEvent(
      null,
      'Reset Password - Missing email'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  const lowerCaseEmail = resetEmail.toLowerCase();

  try {
    const foundUser = await findUserByEmail(lowerCaseEmail);
    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // Create unique string for verify URL
    const uniqueString = uuid() + foundUser.id;
    const hashedString = await bcrypt.hash(uniqueString, hashRate);

    await createPasswordResetEmailHandler(foundUser.id, hashedString); //password-reset-request
    try {
      await sendResetPasswordEmail(foundUser.id, foundUser.email, uniqueString);

      myEmitterUsers.emit('resend-verification', req.user);
      return sendMessageResponse(
        res,
        201,
        EVENT_MESSAGES.resetPasswordRequestSuccessful
      );
      //
    } catch (err) {
      //
      const serverError = new ServerConflictError(
        email,
        EVENT_MESSAGES.passwordResetEmailError
      );

      myEmitterErrors.emit('error', serverError);
      return sendMessageResponse(res, serverError.code, serverError.message);
    }
    //
  } catch (err) {
    // Create error instance
    const serverError = new ServerErrorEvent(
      `Request password reset Server error`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// export const resetLostUserPasswordHandler = async (req, res) => {
//   const { userId, uniqueString } = req.params;
//   const { password, confirmPassword } = req.body;

//   if (password !== confirmPassword) {
//     const badRequest = new BadRequestEvent(
//       userId,
//       EVENT_MESSAGES.passwordMatchError
//     );
//     myEmitterErrors.emit('error', badRequest);
//     return sendMessageResponse(res, badRequest.code, badRequest.message);
//   }

//   try {
//     const foundResetRequest = await findResetRequest(userId);

//     if (!foundResetRequest) {
//       const missingRequest = new NotFoundEvent(
//         userId,
//         EVENT_MESSAGES.verificationNotFound
//       );
//       myEmitterErrors.emit('error', missingRequest);
//       return sendMessageResponse(res, 404, EVENT_MESSAGES.passwordResetError);
//     }

//     const { expiresAt } = foundResetRequest;
//     if (expiresAt < Date.now()) {
//       await dbClient.passwordReset.delete({ where: { userId } });
//       await dbClient.user.delete({ where: { userId } });
//       return sendMessageResponse(res, 401, EVENT_MESSAGES.expiredLinkMessage);
//     }

//     const isValidString = await bcrypt.compare(
//       uniqueString,
//       foundResetRequest.uniqueString
//     );

//     if (!isValidString) {
//       return sendMessageResponse(
//         res,
//         401,
//         EVENT_MESSAGES.invalidVerification
//       );
//     }

//     const foundUser = await findUserById(userId);

//     const hashedPassword = await bcrypt.hash(password, hashRate);

//     const updatedUser = await resetUserPassword(foundUser.id, hashedPassword);

//     delete updatedUser.password;

//     await dbClient.passwordReset.delete({ where: { userId } });

//     sendDataResponse(res, 200, { user: updatedUser });
//     myEmitterUsers.emit('password-reset', updatedUser);
//   } catch (err) {
//     // Error
//     const serverError = new ServerErrorEvent(`Verify New User Server error`);
//     myEmitterErrors.emit('error', serverError);
//     sendMessageResponse(res, serverError.code, serverError.message);
//     throw err;
//   }
// };

export const changeUserRoleHandler = async (req, res) => {
  const { newRole, userId } = req.body;

  if (!newRole) {
    const missingFields = new MissingFieldEvent(
      req.user,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', missingFields);
    return sendMessageResponse(res, missingFields.code, missingFields.message);
  }

  try {
    const updatedUser = await updateUserById(userId, { role: newRole });

    myEmitterUsers.emit('change-role', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Change user role failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const updateUserDataHandler = async (req, res) => {
  const userId = req.user?.id;
  const { email } = req.body;

  if (!userId || !email) {
    return sendDataResponse(res, 400, {
      message: 'Missing user data in request.',
    });
  }

  try {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedUser = await updateUserById(userId, email);
    if (!updatedUser) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updateUserError
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    delete updatedUser.password;
    delete updatedUser.createdAt;
    delete updatedUser.updatedAt;

    myEmitterUsers.emit('update-user-data', req.user);
    return sendDataResponse(res, 201, { user: updatedUser });
    //
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      `Update user data failed ${err.meesage}`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteUserAccountHandler = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendDataResponse(res, 204, {
      message: 'Missing user ID',
    });
  }

  try {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    if (userId !== foundUser.userId) {
      return sendDataResponse(res, 400, {
        message: 'User ID does not match.',
      });
    }

    const deletedUser = await deleteUserById(userId);
    if (!deletedUser) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteUserError
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `User ${foundUser.email} deleted successfully.`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete user account failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const adminDeleteUserHandler = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendDataResponse(res, 204, {
      message: 'Missing user ID',
    });
  }

  try {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedUser = await deleteUserById(userId);
    if (!deletedUser) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteUserError
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `User ${foundUser.email} deleted successfully.`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete user account failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deactivateUserHandler = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendDataResponse(res, 204, {
      message: 'Missing user ID',
    });
  }

  try {
    const updatedUser = await updateUserById(userId, { isActive: false });

    myEmitterUsers.emit('deactivate-user', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Deactivate user');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const reactivateUserHandler = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendDataResponse(res, 204, {
      message: 'Missing user ID',
    });
  }

  try {
    const updatedUser = await updateUserById(userId, { isActive: true });

    myEmitterUsers.emit('reactivate-user', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Reactivate user');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
