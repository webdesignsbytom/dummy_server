import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  createBlogPostHandler,
  getAllBlogPostsHandler,
  getBlogPostByIdHandler,
  getBlogPostBySlugHandler,
  getBlogPostsByTagHandler,
  getBlogPostSummariesHandler,
} from '../controllers/blog.js';

const router = Router();

// match your events router style: auth + dev gate on reads
router.get('/get-all-blog-posts', getAllBlogPostsHandler);
router.get('/get-blog-summaries', getBlogPostSummariesHandler);
router.get('/get-blog-posts-by-tag/:tag', getBlogPostsByTagHandler);
router.get('/get-blog-post-by-tag/:slug', getBlogPostBySlugHandler);
router.get('/get-blog-posts-by-id/:id', getBlogPostByIdHandler);
router.post('/create-blog-post', createBlogPostHandler);

export default router;
