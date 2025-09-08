import { Router } from 'express';
import {
  validateAdminRole,
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  createBlogPostHandler,
  getAllBlogPostsHandler,
  getAllBlogPostsPagedHandler,
  getBlogPostByIdHandler,
  getBlogPostBySlugHandler,
  getBlogPostsByTagHandler,
  getBlogPostSummariesHandler,
  updateBlogPostHandler,
} from '../controllers/blog.js';

const router = Router();

// match your events router style: auth + dev gate on reads
router.get('/get-all-blog-posts', getAllBlogPostsHandler);
router.get(
  '/get-paged-blog-posts',
  validateAuthentication,
  validateDeveloperRole,
  getAllBlogPostsPagedHandler
);
router.get('/get-blog-summaries', getBlogPostSummariesHandler);
router.get('/get-blog-posts-by-tag/:tag', getBlogPostsByTagHandler);
router.get('/get-blog-post-by-slug/:slug', getBlogPostBySlugHandler);
router.get('/get-blog-posts-by-id/:id', getBlogPostByIdHandler);
router.post('/create-blog-post', validateAuthentication, validateAdminRole, createBlogPostHandler);
router.patch(
  '/update-blog-post/:id',
  validateAuthentication,
  validateAdminRole,
  updateBlogPostHandler
);

export default router;
