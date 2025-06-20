import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

import {
  // Subscriber handlers
  subscribeToNewsletterHandler,
  confirmEmailAddressHandler,
  unsubscribeNewsletterLinkHandler,
  getAllNewsletterSubscribersHandler,
  deleteNewsletterSubscriberByIdHandler,
  deleteNewsletterSubscriberByEmailHandler,
  deleteAllNewsletterSubscribersHandler,
  setAllUsersUnverifiedHandler,

  // Newsletter (admin) handlers
  createNewsletterDraftHandler,
  saveNewsletterDraftHandler,
  publishNewsletterHandler,
  getNewsletterByIdHandler,
  getNewsletterByDateHandler,
  deleteNewsletterHandler,

  // Verification token admin
  getAllNewsletterVerificationTokensHandler,
  sendBulkNewsletterEmailHandler,
  resendNewsletterVerificationEmailHandler,
  manuallyVerifySubscriberHandler,
} from '../controllers/newsletter.js';

const router = Router();

/* ------------------------------ Public Routes ------------------------------ */

// Subscribe and Confirm
router.post('/subscribe-to-newsletter', subscribeToNewsletterHandler);
router.patch(
  '/confirm-email/:userId/:verificationId/:uniqueString',
  confirmEmailAddressHandler
);
router.delete(
  '/unsubscribe/:userId/:uniqueString',
  unsubscribeNewsletterLinkHandler
);
router.post('/resend-verification-email/:userId', resendNewsletterVerificationEmailHandler);


/* ------------------------------ Admin Routes ------------------------------ */

// Subscribers
router.get('/get-subscriber-list', getAllNewsletterSubscribersHandler);
router.patch('/force-verify-subscriber/:userId', manuallyVerifySubscriberHandler);
router.delete(
  '/delete-subscriber-by-id/:id',
  deleteNewsletterSubscriberByIdHandler
);
router.delete(
  '/delete-subscriber-by-email/:email',
  deleteNewsletterSubscriberByEmailHandler
);
router.delete('/delete-all-subscribers', deleteAllNewsletterSubscribersHandler);
router.patch('/set-all-users-to-unverified', setAllUsersUnverifiedHandler);

// Verification Tokens
router.get(
  '/get-verification-token-list',
  getAllNewsletterVerificationTokensHandler
);

/* --------------------------- Newsletter Management -------------------------- */

// Drafts & Publishing
router.post('/send-bulk-newsletter', sendBulkNewsletterEmailHandler);
router.post('/create-new', createNewsletterDraftHandler);
router.patch('/save-draft', saveNewsletterDraftHandler);
router.patch('/publish/:newsletterId', publishNewsletterHandler);

// Newsletter Data
router.get('/get-newsletter-by-id/:newsletterId', getNewsletterByIdHandler);
router.get(
  '/get-newsletter-by-date/:publicationDate',
  getNewsletterByDateHandler
);
router.delete('/delete-newsletter/:newsletterId', deleteNewsletterHandler);

export default router;
