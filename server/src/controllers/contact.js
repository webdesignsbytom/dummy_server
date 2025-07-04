import {
  createNewCallbackForm,
  createNewContactForm,
  deleteAllCallbackForms,
  deleteAllContactForms,
  deleteCallbackForm,
  deleteContactForm,
  findAllCallbackForms,
  findAllContactForms,
  findCallbackFormById,
  findContactFormById,
} from '../domain/contact.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { sendContactEmail } from '../services/email/emailHandler.js';
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';

export const getAllContactFormsHandler = async (req, res) => {
  try {
    const foundContactForms = await findAllContactForms();

    if (!foundContactForms) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.contactFormsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { contactForms: foundContactForms });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all contact forms failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getAllCallbackFormsHandler = async (req, res) => {
  try {
    const foundCallbackForms = await findAllCallbackForms();

    if (!foundCallbackForms) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.callbackFormsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { callbackForms: foundCallbackForms });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all callback forms failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const createNewContactFormHandler = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    message,
    phoneNumber,
    location,
    businessName,
    projectType,
  } = req.body;

  console.log('firstName', firstName, 'lastName', lastName);
  console.log('email', email, 'phoneNumber', phoneNumber);
  console.log('message', message);
  console.log('location', location, 'businessName', businessName);

  if (!email || !phoneNumber) {
    return sendDataResponse(res, 400, {
      message: 'Missing email or phone number.',
    });
  }

  try {
    const createdContactForm = await createNewContactForm(
      firstName,
      lastName,
      email,
      message,
      phoneNumber,
      location,
      businessName,
      projectType
    );
    console.log('found createdContactForm:', createdContactForm);

    if (!createdContactForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createContactFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    const notificationSent = await sendContactEmail(
      process.env.CONTACT_ADMIN_RECIEVER_EMAIL,
      'New Contact Form Recieved',
      'contactFormNotification',
      {
        title: 'New Contact Form Submission',
        heading: 'You’ve received a new message from your website!',
        firstName,
        lastName,
        email,
        phoneNumber,
        location,
        businessName,
        projectType,
        message,
      }
    );

    if (!notificationSent) {
      const notCreated = new BadRequestEvent(
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.notificationSendingFail
      );
      myEmitterErrors.emit('error', notCreated);
      return sendMessageResponse(res, notCreated.code, notCreated.message);
    }

    return sendDataResponse(res, 201, { contactForm: createdContactForm });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Create new contact form failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const createNewCallbackFormHandler = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  console.log('fullName', fullName, 'phoneNumber', phoneNumber);

  if (!phoneNumber) {
    return sendDataResponse(res, 400, {
      message: 'Missing phone number.',
    });
  }

  try {
    const createdCallbackForm = await createNewCallbackForm(
      fullName,
      phoneNumber
    );

    console.log('createdCallbackForm:', createdCallbackForm);

    if (!createdCallbackForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createCallbackFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 201, { callbackForm: createdCallbackForm });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Create new callback form failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteContactFormHandler = async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return sendDataResponse(res, 400, {
      message: 'Missing form ID.',
    });
  }

  try {
    const foundContactForm = await findContactFormById();
    console.log('found foundContactForm:', foundContactForm);

    if (!foundContactForm) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.contactFormsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedForm = await deleteContactForm(formId);
    if (!deletedForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteContactFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `Successfully deleted contact form`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete contact form failed.`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteCallbackFormHandler = async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return sendDataResponse(res, 400, {
      message: 'Missing form ID.',
    });
  }

  try {
    const foundCallbackForm = await findCallbackFormById();
    console.log('found foundCallbackForm:', foundCallbackForm);

    if (!foundCallbackForm) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.callbackFormsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedForm = await deleteCallbackForm(formId);
    if (!deletedForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteCallbackFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `Successfully deleted callback form`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete callback form failed.`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteAllContactFormsHandler = async (req, res) => {
  try {
    const deletedForm = await deleteAllContactForms();
    if (!deletedForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteContactFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `Successfully deleted all contact forms`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete all contact forms failed.`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteAllCallbackFormsHandler = async (req, res) => {
  try {
    const deletedForm = await deleteAllCallbackForms();

    if (!deletedForm) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteCallbackFormFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, {
      message: `Successfully deleted all callback forms`,
    });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete all callback forms failed.`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
