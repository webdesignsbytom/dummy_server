import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllBlogsEvent,
  createGetBlogSummariesEvent,
  createGetBlogByIdEvent,
  createGetBlogBySlugEvent,
  createGetBlogsByTagEvent,
} from './utils/blogUtils.js';

export const myEmitterBlogs = myEmitter;

// Event listeners for blog events
myEmitterBlogs.on('get-all-blogs', async (user) => createGetAllBlogsEvent(user));
myEmitterBlogs.on('get-blog-summaries', async (user) => createGetBlogSummariesEvent(user));
myEmitterBlogs.on('get-blog-by-id', async (user) => createGetBlogByIdEvent(user));
myEmitterBlogs.on('get-blog-by-slug', async (user) => createGetBlogBySlugEvent(user));
myEmitterBlogs.on('get-blogs-by-tag', async (user) => createGetBlogsByTagEvent(user));
myEmitterBlogs.on('create-blog', async (user) => createCreateBlogEvent(user));
