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

export async function updateBlogPost(
  id,
  scalarFields = {},
  {
    replaceTagsWith,        // string[] | undefined (undefined = no change, [] = clear all)
    featuredImageKey,       // string | null | undefined
    thumbnailImageKey,      // string | null | undefined
    galleryKeys,            // string[] | [] | undefined
    embedKeys,              // string[] | [] | undefined
  } = {},
) {
  // Build scalar update
  const data = {};
  for (const [k, v] of Object.entries(scalarFields)) {
    if (v !== undefined) data[k] = v;
  }
  // Allow clearing legacy columns via null
  if (featuredImageKey !== undefined) data.featuredImage = featuredImageKey;
  if (thumbnailImageKey !== undefined) data.thumbnailImage = thumbnailImageKey;

  // Apply scalar + (optional) tags in a transaction-ish flow
  return await dbClient.$transaction(async (tx) => {
    // Update scalars first
    await tx.blogPost.update({
      where: { id },
      data,
      select: { id: true },
    });

    // Replace tags set if requested
    if (replaceTagsWith !== undefined) {
      // Clear all
      await tx.blogPost.update({
        where: { id },
        data: { tags: { set: [] } },
      });
      if (Array.isArray(replaceTagsWith) && replaceTagsWith.length) {
        await tx.blogPost.update({
          where: { id },
          data: {
            tags: {
              connectOrCreate: replaceTagsWith.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
        });
      }
    }

    // Media linking only if tables exist
    const canLinkMedia = !!tx?.media?.upsert && !!tx?.blogMedia?.createMany;

    if (canLinkMedia) {
      const ensureMedia = async (key) =>
        tx.media.upsert({
          where: { key },
          update: {},
          create: { key },
          select: { id: true },
        });

      // FEATURED
      if (featuredImageKey !== undefined) {
        // clear existing FEATURED
        await tx.blogMedia.deleteMany({ where: { blogPostId: id, role: 'FEATURED' } });
        if (featuredImageKey) {
          const m = await ensureMedia(featuredImageKey);
          await tx.blogMedia.create({
            data: { blogPostId: id, mediaId: m.id, role: 'FEATURED', position: 0 },
          });
        }
      }

      // THUMBNAIL
      if (thumbnailImageKey !== undefined) {
        await tx.blogMedia.deleteMany({ where: { blogPostId: id, role: 'THUMBNAIL' } });
        if (thumbnailImageKey) {
          const m = await ensureMedia(thumbnailImageKey);
          await tx.blogMedia.create({
            data: { blogPostId: id, mediaId: m.id, role: 'THUMBNAIL', position: 0 },
          });
        }
      }

      // GALLERY (replace if provided)
      if (galleryKeys !== undefined) {
        await tx.blogMedia.deleteMany({ where: { blogPostId: id, role: 'GALLERY' } });
        if (Array.isArray(galleryKeys) && galleryKeys.length) {
          let pos = 0;
          const ids = [];
          for (const key of galleryKeys) {
            const m = await ensureMedia(key);
            ids.push({ blogPostId: id, mediaId: m.id, role: 'GALLERY', position: pos++ });
          }
          await tx.blogMedia.createMany({ data: ids, skipDuplicates: true });
        }
      }

      // EMBED (replace if provided)
      if (embedKeys !== undefined) {
        await tx.blogMedia.deleteMany({ where: { blogPostId: id, role: 'EMBED' } });
        if (Array.isArray(embedKeys) && embedKeys.length) {
          let pos = 0;
          const ids = [];
          for (const key of embedKeys) {
            const m = await ensureMedia(key);
            ids.push({ blogPostId: id, mediaId: m.id, role: 'EMBED', position: pos++ });
          }
          await tx.blogMedia.createMany({ data: ids, skipDuplicates: true });
        }
      }
    }

    // Return hydrated post (full media set)
    return tx.blogPost.findUnique({
      where: { id },
      include: {
        tags: true,
        mediaLinks: {
          include: { media: true },
          orderBy: [{ role: 'asc' }, { position: 'asc' }],
        },
      },
    });
  });
}