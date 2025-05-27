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
  createNewsletterDraftHandler,
  publishNewsletterHandler,
  saveNewsletterDraftHandler,
  getNewsletterByDateHandler,
  getNewsletterByIdHandler,
  deleteNewsletterHandler,
} from '../controllers/newsletter.js';

const router = Router();

// Subscribers
router.get('/get-subscriber-list', getAllNewsletterSubscribersHandler);
router.post('/subscribe-to-newsletter', subscribeToNewsletterHandler);
router.delete(
  '/delete-subscriber-by-id/:id',
  deleteNewsletterSubscriberByIdHandler
);
router.delete(
  '/delete-subscriber-by-email/:email',
  deleteNewsletterSubscriberByEmailHandler
);
router.delete('/delete-all-subscribers', deleteAllNewsletterSubscribersHandler);

// Publication Admin
router.get('/get-newsletter-by-id/:newsletterId', getNewsletterByIdHandler);
router.get(
  '/get-newsletter-by-date/:publicationDate',
  getNewsletterByDateHandler
);
router.post('/create-new', createNewsletterDraftHandler);
router.patch('/save-draft', saveNewsletterDraftHandler);
router.patch('/publish', publishNewsletterHandler);
router.delete('/delete-newsletter', deleteNewsletterHandler);

export default router;
