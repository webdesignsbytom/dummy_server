import dbClient from '../utils/dbClient.js';

export const findAllContactForms = () =>
  dbClient.contactForm.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findContactFormById = (formId) =>
  dbClient.contactForm.findFirst({
    where: { id: formId },
  });

export const findCallbackFormById = (formId) =>
  dbClient.callbackForm.findFirst({
    where: { id: formId },
  });

export const findAllCallbackForms = () =>
  dbClient.callbackForm.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const createNewContactForm = (
  firstName,
  lastName,
  email,
  message,
  phoneNumber,
  location,
  businessName,
  projectType
) =>
  dbClient.contactForm.create({
    data: {
      firstName,
      lastName,
      email,
      message,
      phoneNumber,
      location,
      businessName,
      projectType,
    },
  });

export const createNewCallbackForm = (fullName, phoneNumber) =>
  dbClient.callbackForm.create({
    data: {
      fullName,
      phoneNumber,
    },
  });

export const deleteContactForm = (formId) =>
  dbClient.contactForm.delete({
    where: { id: formId },
  });

export const deleteCallbackForm = (formId) =>
  dbClient.callbackForm.delete({
    where: { id: formId },
  });
