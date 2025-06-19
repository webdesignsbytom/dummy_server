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
  unsubscribeNewsletterLinkHandler,
  confirmEmailAddressHandler,
  getAllNewsletterVerificationTokensHandler,
} from '../controllers/newsletter.js';

const router = Router();

// Subscribers
router.post('/subscribe-to-newsletter', subscribeToNewsletterHandler);
router.patch(
  '/confirm-email/:userId/:verificationId/:uniqueString',
  confirmEmailAddressHandler
);
router.delete(
  '/unsubscribe/:userId/:uniqueString',
  unsubscribeNewsletterLinkHandler
);

// Admin
router.get('/get-subscriber-list', getAllNewsletterSubscribersHandler);
router.get('/get-verification-token-list', getAllNewsletterVerificationTokensHandler);
router.get('/get-newsletter-by-id/:newsletterId', getNewsletterByIdHandler);
router.get(
  '/get-newsletter-by-date/:publicationDate',
  getNewsletterByDateHandler
);
router.post('/create-new', createNewsletterDraftHandler);
router.patch('/save-draft', saveNewsletterDraftHandler);
router.patch('/publish/:newsletterId', publishNewsletterHandler);
router.delete(
  '/delete-subscriber-by-id/:id',
  deleteNewsletterSubscriberByIdHandler
);
router.delete(
  '/delete-subscriber-by-email/:email',
  deleteNewsletterSubscriberByEmailHandler
);
router.delete('/delete-all-subscribers', deleteAllNewsletterSubscribersHandler);
router.delete('/delete-newsletter/:newsletterId', deleteNewsletterHandler);

export default router;
