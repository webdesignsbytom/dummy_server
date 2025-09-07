// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
import {
  findAllBlogPosts,
  findBlogPostSummaries,
  findBlogPostById,
  findBlogPostBySlug,
  findBlogPostsByTag,
  createBlogPost,
} from '../domain/blog.js';
// Response helpers/messages
import { EVENT_MESSAGES } from '../utils/responses.js';
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';

// Error utils
import { NotFoundEvent, ServerErrorEvent } from '../event/utils/errorUtils.js';

// GET /blogs
export const getAllBlogPostsHandler = async (req, res) => {
  try {
    const posts = await findAllBlogPosts();

    if (!posts || posts.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-all-blogs', req.user);
    return sendDataResponse(res, 200, { posts });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get all blog posts failed'
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};

// GET /blogs/summaries  (titles + dates only)
export const getBlogPostSummariesHandler = async (req, res) => {
  try {
    const summaries = await findBlogPostSummaries();

    if (!summaries || summaries.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-blog-summaries', req.user);
    return sendDataResponse(res, 200, { posts: summaries });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get blog post summaries failed'
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};

// GET /blogs/by-slug/:slug
export const getBlogPostBySlugHandler = async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await findBlogPostBySlug(slug);

    if (!post) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-blog-by-slug', req.user);
    return sendDataResponse(res, 200, { post });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get blog post by slug failed'
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};

// GET /blogs/:id
export const getBlogPostByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await findBlogPostById(id);

    if (!post) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-blog-by-id', req.user);
    return sendDataResponse(res, 200, { post });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get blog post by id failed'
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};

// GET /get-blog-posts-by-tag/:tag
export const getBlogPostsByTagHandler = async (req, res) => {
  const { tag } = req.params; // supports slug OR name
  try {
    const posts = await findBlogPostsByTag(tag);

    if (!posts || posts.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-blogs-by-tag', req.user);
    return sendDataResponse(res, 200, { posts });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Get blog posts by tag failed'
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};

export const createBlogPostHandler = async (req, res) => {
  console.log('[createBlogPostHandler] called');

  try {
    const { title, slug, content, authorId, authorName, tags } = req.body;
    console.log('[createBlogPostHandler] body:', {
      title,
      slug,
      contentType: typeof content,
      authorId,
      authorName,
      tags,
    });

    // Required fields
    if (!title || !slug || !content) {
      console.log('[createBlogPostHandler] missing required fields');
      return sendMessageResponse(res, 400, EVENT_MESSAGES.missingFields);
    }

    console.log('[createBlogPostHandler] calling domain createBlogPost');
    const post = await createBlogPost(
      title,
      slug,
      content,
      authorId,
      authorName,
      Array.isArray(tags) ? tags : []
    );
    console.log('[createBlogPostHandler] domain returned:', post);

    // Explicit "not created" guard
    if (!post) {
      console.log('[createBlogPostHandler] post not created');
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    console.log('[createBlogPostHandler] emitting create-blog event');
    myEmitterBlogs.emit('create-blog', req.user);

    console.log('[createBlogPostHandler] success → sending 201');
    return sendDataResponse(res, 201, { post });
  } catch (err) {
    console.error('[createBlogPostHandler] error:', err);
    const serverError = new ServerErrorEvent(
      req.user,
      EVENT_MESSAGES.createBlogFail
    );
    myEmitterErrors.emit('error', serverError);
    return sendMessageResponse(res, serverError.code, serverError.message);
  }
};
