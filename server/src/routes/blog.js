import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-all-blog-posts', getAllBlogPosts);
router.get('/get-all-blog-posts', getAllBlogPosts);

export default router;
