import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllBlogsEvent,
  createGetBlogSummariesEvent,
  createGetBlogByIdEvent,
  createGetBlogBySlugEvent,
  createGetBlogsByTagEvent,
  createCreateBlogEvent,
  createUpdateBlogEvent,
  deleteBlogEvent,
} from './utils/blogUtils.js';

export const myEmitterBlogs = myEmitter;

const safe = (fn) => async (user) => {
  try {
    await fn(user);
  } catch (e) {
    console.error('[myEmitterBlogs] listener error:', e);
  }
};

myEmitterBlogs.on('get-all-blogs', safe(createGetAllBlogsEvent));
myEmitterBlogs.on('get-blog-summaries', safe(createGetBlogSummariesEvent));
myEmitterBlogs.on('get-blog-by-id', safe(createGetBlogByIdEvent));
myEmitterBlogs.on('get-blog-by-slug', safe(createGetBlogBySlugEvent));
myEmitterBlogs.on('get-blogs-by-tag', safe(createGetBlogsByTagEvent));
myEmitterBlogs.on('create-blog', safe(createCreateBlogEvent));
myEmitterBlogs.on('update-blog', safe(createUpdateBlogEvent));
myEmitterBlogs.on('delete-blog', safe(deleteBlogEvent));
