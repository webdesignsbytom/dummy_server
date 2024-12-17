import { Router } from 'express';
import {
  createNewCallbackFormHandler,
  createNewContactFormHandler,
  deleteCallbackFormHandler,
  deleteContactFormHandler,
  getAllCallbackFormsHandler,
  getAllContactFormsHandler,
} from '../controllers/contact.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-all-contact-forms', getAllContactFormsHandler);
router.get('/get-all-callback-forms', getAllCallbackFormsHandler);
router.post('/create-new-contact-form', createNewContactFormHandler);
router.post('/create-new-callback-form', createNewCallbackFormHandler);
router.delete('/delete-contact-form/:formId', deleteContactFormHandler);
router.delete('/delete-callback-form/:formId', deleteCallbackFormHandler);

export default router;
