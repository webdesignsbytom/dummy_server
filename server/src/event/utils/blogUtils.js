import { createEvent } from './events.js';

// --- SAFE HELPERS ---
const normalizeUser = (user) => {
  if (user && typeof user === 'object') {
    return {
      id: user.id ?? null,
      email: user.email ?? 'anonymous',
      role: user.role ?? 'USER',
    };
  }
  // fallback for unauthenticated / missing user
  return { id: null, email: 'anonymous', role: 'USER' };
};

// --- BLOG EVENT CREATORS (safe if user is missing) ---
export const createGetAllBlogsEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get All Blogs', `Success getting all blogs for ${u.email}`, 200);
};

export const createGetBlogSummariesEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get Blog Summaries', `Success getting blog summaries for ${u.email}`, 200);
};

export const createGetBlogByIdEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get Blog By Id', `Success getting blog by ID for ${u.email}`, 200);
};

export const createGetBlogBySlugEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get Blog By Slug', `Success getting blog by slug for ${u.email}`, 200);
};

export const createGetBlogsByTagEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Get Blogs By Tag', `Success getting blogs by tag for ${u.email}`, 200);
};

export const createCreateBlogEvent = async (user) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Create Blog', `Blog created successfully by ${u.email}`, 201);
};

export const createUpdateBlogEvent = async (user = {}) => {
  const u = normalizeUser(user);
  await createEvent(u, u.role, 'Update Blog', `Blog updated by ${email}`, 200);
};