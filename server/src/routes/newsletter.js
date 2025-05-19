import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  deleteAllNewsletterSubscribersHandler,
  deleteNewsletterSubscriberByEmailHandler,
  deleteNewsletterSubscriberByIdHandler,
  getAllNewsletterSubscribersHandler,
  subscribeToNewsletterHandler,
} from '../controllers/newsletter.js';

const router = Router();

router.get('/get-subscriber-list', getAllNewsletterSubscribersHandler);
router.post('/subscribe-to-newsletter', subscribeToNewsletterHandler);
router.delete('/delete-subscriber-by-id/:id', deleteNewsletterSubscriberByIdHandler);
router.delete('/delete-subscriber-by-email/:email', deleteNewsletterSubscriberByEmailHandler);
router.delete('/delete-all-subscribers', deleteAllNewsletterSubscribersHandler);

export default router;
