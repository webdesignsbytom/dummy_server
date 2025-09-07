import dbClient from '../utils/dbClient.js';

export const findAllBlogPosts = () =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      // keep payload small: only featured + thumbnail
      mediaLinks: {
        where: { role: { in: ['FEATURED', 'THUMBNAIL'] } },
        include: { media: true },
        orderBy: [{ role: 'asc' }, { position: 'asc' }],
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

// Get single post by slug
export const findBlogPostBySlug = (slug) =>
  dbClient.blogPost.findUnique({
    where: { slug },
    include: {
      tags: true,
      mediaLinks: {
        include: { media: true },
        orderBy: [{ role: 'asc' }, { position: 'asc' }],
      },
    },
  });

// Get single post by ID
export const findBlogPostById = (id) =>
  dbClient.blogPost.findUnique({
    where: { id },
    include: {
      tags: true, // BlogTag[]
      mediaLinks: {
        include: { media: true },        // pulls the Media row (has the S3 key)
        orderBy: [{ role: 'asc' }, { position: 'asc' }], // FEATURED/THUMBNAIL/GALLERY/EMBED; gallery in order
      },
    },
  });

// Get posts by tag (via tag slug)
export const findBlogPostsByTag = (tag) =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      tags: {
        some: { name: tag },
      },
    },
    include: {
      tags: true,
      mediaLinks: {
        where: { role: { in: ['FEATURED', 'THUMBNAIL'] } },
        include: { media: true },
        orderBy: [{ role: 'asc' }, { position: 'asc' }],
      },
    },
  });

  export async function createBlogPost(
  title, slug, content, authorId, authorName,
  tagNames = [],
  { featuredImageKey = null, thumbnailImageKey = null, galleryKeys = [], embedKeys = [] } = {},
  isPublished = false,
) {
  // 1) create post
  const post = await dbClient.blogPost.create({
    data: {
      title, slug, content, authorId, authorName,
      isPublished,
      ...(Array.isArray(tagNames) && tagNames.length
        ? {
            tags: {
              connectOrCreate: tagNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {}),
      // keep legacy columns if you want
      ...(featuredImageKey ? { featuredImage: featuredImageKey } : {}),
      ...(thumbnailImageKey ? { thumbnailImage: thumbnailImageKey } : {}),
    },
    select: { id: true, slug: true }, // we just need id now
  });

  // helper to ensure Media rows exist (by unique key)
  const ensureMedia = async (key) =>
    dbClient.media.upsert({
      where: { key },
      update: {},
      create: { key },
      select: { id: true },
    });

  const links = [];

  if (featuredImageKey) {
    const m = await ensureMedia(featuredImageKey);
    links.push({
      blogPostId: post.id, mediaId: m.id, role: 'FEATURED', position: 0,
    });
  }

  if (thumbnailImageKey) {
    const m = await ensureMedia(thumbnailImageKey);
    links.push({
      blogPostId: post.id, mediaId: m.id, role: 'THUMBNAIL', position: 0,
    });
  }

  let pos = 0;
  for (const key of galleryKeys) {
    const m = await ensureMedia(key);
    links.push({
      blogPostId: post.id, mediaId: m.id, role: 'GALLERY', position: pos++,
    });
  }

  pos = 0;
  for (const key of embedKeys) {
    const m = await ensureMedia(key);
    links.push({
      blogPostId: post.id, mediaId: m.id, role: 'EMBED', position: pos++,
    });
  }

  if (links.length) {
    await dbClient.blogMedia.createMany({ data: links, skipDuplicates: true });
  }

  // return the hydrated post with tags + media
  return dbClient.blogPost.findUnique({
    where: { id: post.id },
    include: {
      tags: true,
      mediaLinks: {
        include: { media: true },
        orderBy: [{ role: 'asc' }, { position: 'asc' }],
      },
    },
  });
}

export const findBlogPostsPaged = async (limit = 10, page = 1) => {
  const take = Math.max(1, Math.min(Number(limit) || 10, 50));
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * take;

  const [items, total] = await Promise.all([
    dbClient.blogPost.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        // keep list payload small
        mediaLinks: {
          where: { role: { in: ['FEATURED', 'THUMBNAIL'] } },
          include: { media: true },
          orderBy: [{ role: 'asc' }, { position: 'asc' }],
        },
      },
    }),
    dbClient.blogPost.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));
  const hasNextPage = skip + items.length < total;

  return {
    items,
    total,
    limit: take,
    page: currentPage,
    totalPages,
    hasNextPage,
  };
};