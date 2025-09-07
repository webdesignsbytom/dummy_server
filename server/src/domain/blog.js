import dbClient from '../utils/dbClient.js';

// Get all blog posts (ordered newest first)
export const findAllBlogPosts = () =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

// Get blog post summaries (titles + dates only)
export const findBlogPostSummaries = () =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      createdAt: true,
    },
  });

// Get posts by tag (via tag slug)
export const findBlogPostBySlug = (slug) =>
  dbClient.blogPost.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
    },
  });

// Get single post by ID
export const findBlogPostById = (id) =>
  dbClient.blogPost.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

export const findBlogPostsByTag = (tagSlug) =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      tags: {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  
export const createBlogPost = async (
  title,
  slug,
  content,
  authorId,
  authorName,
  tagIds = []
) => {
  return dbClient.blogPost.create({
    data: {
      title,
      slug,
      content,
      authorId,
      authorName,
      isPublished: false,
      tags: Array.isArray(tagIds) && tagIds.length
        ? {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
    include: { tags: { include: { tag: true } } },
  });
};