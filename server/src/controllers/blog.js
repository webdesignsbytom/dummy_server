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
  findBlogPostsPaged,
  updateBlogPost,
} from '../domain/blog.js';
// Response helpers/messages
import { EVENT_MESSAGES } from '../utils/responses.js';
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';

// Error utils
import {
  ConflictEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { myEmitterBlogs } from '../event/blogEvents.js';
import dbClient from '../utils/dbClient.js';
import { keyHasPrefix } from '../services/s3/mediaService.js';

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

export const getAllBlogPostsPagedHandler = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit);
    const rawPage = Number(req.query.page);

    // clamp limit to a sane range
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 50)) : 10;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const result = await findBlogPostsPaged(limit, page);

    if (!result.items || result.items.length === 0) {
      const notFound = new NotFoundEvent(req.user, EVENT_MESSAGES.blogNotFound, EVENT_MESSAGES.blogTag);
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterEvents.emit('get-all-blogs', req.user);

    return sendDataResponse(res, 200, {
      posts: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.page > 1,
      },
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get paged blog posts failed');
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

export const createBlogPostHandler = async (req, res, next) => {
  console.log('[createBlogPostHandler] called');
  try {
    const {
      title,
      slug,
      content,
      authorId,
      authorName,
      tags,
      featuredImageKey,
      thumbnailImageKey,
      galleryKeys = [],
      embedKeys = [],
    } = req.body || {};

    if (!title || !slug || !content) {
      return sendMessageResponse(res, 400, EVENT_MESSAGES.missingFields);
    }

    if (featuredImageKey && !keyHasPrefix(featuredImageKey, 'blog')) {
      return sendMessageResponse(
        res,
        400,
        'featuredImageKey must be under blog/ prefix'
      );
    }
    if (thumbnailImageKey && !keyHasPrefix(thumbnailImageKey, 'blog')) {
      return sendMessageResponse(
        res,
        400,
        'thumbnailImageKey must be under blog/ prefix'
      );
    }
    // Optional: fast 409 if slug exists
    const existing = await dbClient.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      const conflict = new ConflictEvent(
        req.user,
        'Blog slug already in use.',
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', conflict);
      return sendMessageResponse(res, conflict.code, conflict.message); // 409
    }

    // Validate media keys (only if provided)
    if (featuredImageKey && !keyHasPrefix(featuredImageKey, 'blog')) {
      return sendMessageResponse(
        res,
        400,
        'featuredImageKey must be under blog/ prefix'
      );
    }
    if (thumbnailImageKey && !keyHasPrefix(thumbnailImageKey, 'blog')) {
      return sendMessageResponse(
        res,
        400,
        'thumbnailImageKey must be under blog/ prefix'
      );
    }

    const tagNames = Array.isArray(tags)
      ? tags.map(String).filter(Boolean)
      : [];
    const post = await createBlogPost(
      title,
      slug,
      content,
      authorId,
      authorName,
      tagNames,
      {
        featuredImageKey: featuredImageKey || null,
        thumbnailImageKey: thumbnailImageKey || null,
        galleryKeys: Array.isArray(galleryKeys) ? galleryKeys : [],
        embedKeys: Array.isArray(embedKeys) ? embedKeys : [],
      }
    );

    if (!post) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.blogNotFound,
        EVENT_MESSAGES.blogTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBlogs.emit('create-blog', req.user);
    return sendDataResponse(res, 201, { post });
  } catch (err) {
    // Let your global error handler map Prisma codes (e.g., P2002 → 409)
    return next(err);
  }
};

export const updateBlogPostHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Does the post exist?
    const existing = await dbClient.blogPost.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      const notFound = new NotFoundEvent(req.user, EVENT_MESSAGES.blogNotFound, EVENT_MESSAGES.blogTag);
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const {
      // Scalars (all optional)
      title,
      subTitle,
      subject,
      location,
      slug,
      content,
      authorId,
      authorName,
      isPublished,
      publishedAt,

      // Tags: replace entire set if provided
      tags, // array of names

      // Media controls
      featuredImageKey,    // string to set, null to clear, undefined no-change
      thumbnailImageKey,   // same
      galleryKeys,         // array => replace; [] => clear; undefined => no-change
      embedKeys,           // same
    } = req.body || {};

    // Optional fast 409 if slug is changing and already taken
    if (typeof slug === 'string' && slug !== existing.slug) {
      const clash = await dbClient.blogPost.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (clash) {
        const conflict = new ConflictEvent(req.user, 'Blog slug already in use.', EVENT_MESSAGES.blogTag);
        myEmitterErrors.emit('error', conflict);
        return sendMessageResponse(res, conflict.code, conflict.message); // 409
      }
    }

    // Validate media key prefixes if provided
    const checkKey = (k, which) => {
      if (k && !keyHasPrefix(k, 'blog')) {
        throw new Error(`${which} must be under blog/ prefix`);
      }
    };
    try {
      if (featuredImageKey !== undefined) checkKey(featuredImageKey, 'featuredImageKey');
      if (thumbnailImageKey !== undefined) checkKey(thumbnailImageKey, 'thumbnailImageKey');
      if (Array.isArray(galleryKeys)) for (const k of galleryKeys) checkKey(k, 'galleryKeys[]');
      if (Array.isArray(embedKeys)) for (const k of embedKeys) checkKey(k, 'embedKeys[]');
    } catch (e) {
      return sendMessageResponse(res, 400, e.message);
    }

    const tagNames =
      Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : undefined;

    const updated = await updateBlogPost(
      id,
      {
        title,
        subTitle,
        subject,
        location,
        slug,
        content,
        authorId,
        authorName,
        isPublished,
        publishedAt,
      },
      {
        replaceTagsWith: tagNames,      // undefined = no change
        featuredImageKey,               // string | null | undefined
        thumbnailImageKey,              // string | null | undefined
        galleryKeys,                    // string[] | [] | undefined
        embedKeys,                      // string[] | [] | undefined
      }
    );

    myEmitterBlogs.emit('update-blog', req.user);

    return sendDataResponse(res, 200, { post: updated });
  } catch (err) {
    // Prisma P2002 / P2025 etc handled by global error middleware
    const serverError = new ServerErrorEvent(req.user, 'Update blog post failed');
    myEmitterErrors.emit('error', serverError);
    return next(err);
  }
};