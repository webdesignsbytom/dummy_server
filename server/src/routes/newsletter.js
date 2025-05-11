import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  deleteNewsletterSubscriberByEmailHandler,
  deleteNewsletterSubscriberByIdHandler,
  getAllNewsletterSubscribersHandler,
  subscribeToNewsletterHandler,
} from '../controllers/newsletter.js';

const router = Router();

router.get('/get-subscriber-list', getAllNewsletterSubscribersHandler);
router.post('/subscribe-to-newsletter', subscribeToNewsletterHandler);
router.delete('/delete-subscriber-by-id/', deleteNewsletterSubscriberByIdHandler);
router.delete('/delete-subscriber-by-email/', deleteNewsletterSubscriberByEmailHandler);

export default router;
