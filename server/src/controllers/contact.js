import {
  createNewCallbackForm,
  createNewContactForm,
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
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';

export const getAllContactFormsHandler = async (req, res) => {
  try {
    const foundContactForms = await findAllContactForms();
    console.log('found foundContactForms:', foundContactForms);

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
    console.log('found foundCallbackForms:', foundCallbackForms);

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
