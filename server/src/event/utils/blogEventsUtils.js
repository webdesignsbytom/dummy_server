import { createEvent } from './events.js';

// Exported event creation functions
export const createGetAllBlogsEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Get All Blogs',
    `Success getting all blogs for ${user.email}`,
    200
  );
};

export const createGetBlogSummariesEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Get Blog Summaries',
    `Success getting blog summaries for ${user.email}`,
    200
  );
};

export const createGetBlogByIdEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Get Blog By Id',
    `Success getting blog by ID for ${user.email}`,
    200
  );
};

export const createGetBlogBySlugEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Get Blog By Slug',
    `Success getting blog by slug for ${user.email}`,
    200
  );
};

export const createGetBlogsByTagEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Get Blogs By Tag',
    `Success getting blogs by tag for ${user.email}`,
    200
  );
};

export const createCreateBlogEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(
    user,
    type,
    'Create Blog',
    `Blog created successfully by ${user.email}`,
    201
  );
};