import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  createNewReviewHandler,
  deleteAllReviewHandler,
  deleteReviewHandler,
  getAllReviewsHandler,
  getReviewByIdHandler,
  getReviewsByDateHandler,
  getReviewsByEmailHandler,
} from '../controllers/reviews.js';

const router = Router();

router.get('/get-all-reviews', getAllReviewsHandler);
router.get('/get-review-by-id/:reviewId', getReviewByIdHandler);
router.get('/get-reviews-by-email/:email', getReviewsByEmailHandler);
router.get('/get-reviews-by-date/:date', getReviewsByDateHandler);
router.post('/create-new-review', createNewReviewHandler);
router.delete('/delete-review/:reviewId', deleteReviewHandler);
router.delete('/delete-all-reviews', deleteAllReviewHandler);

export default router;
