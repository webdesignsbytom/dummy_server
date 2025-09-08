import dbClient from '../utils/dbClient.js';

export const findAllBlogPosts = () =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      mediaLinks: {
        where: { role: { in: ['THUMBNAIL', 'GALLERY'] } }, // <— was FEATURED,THUMBNAIL
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
  { thumbnailImageKey = null, galleryKeys = [], embedKeys = [] } = {},
  isPublished = false,
) {
  // create post (keep legacy thumbnailImage column in case you still read it on FE)
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
      ...(thumbnailImageKey ? { thumbnailImage: thumbnailImageKey } : {}),
    },
    select: { id: true, slug: true },
  });

  const ensureMedia = async (key) =>
    dbClient.media.upsert({
      where: { key },
      update: {},
      create: { key },
      select: { id: true },
    });

  const links = [];

  // THUMBNAIL
  if (thumbnailImageKey) {
    const m = await ensureMedia(thumbnailImageKey);
    links.push({ blogPostId: post.id, mediaId: m.id, role: 'THUMBNAIL', position: 0 });
  }

  // GALLERY
  let pos = 0;
  for (const key of galleryKeys) {
    const m = await ensureMedia(key);
    links.push({ blogPostId: post.id, mediaId: m.id, role: 'GALLERY', position: pos++ });
  }

  // EMBED
  pos = 0;
  for (const key of embedKeys) {
    const m = await ensureMedia(key);
    links.push({ blogPostId: post.id, mediaId: m.id, role: 'EMBED', position: pos++ });
  }

  if (links.length) {
    await dbClient.blogMedia.createMany({ data: links, skipDuplicates: true });
  }

  return dbClient.blogPost.findUnique({
    where: { id: post.id },
    include: {
      tags: true,
      mediaLinks: { include: { media: true }, orderBy: [{ role: 'asc' }, { position: 'asc' }] },
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
        mediaLinks: {
          where: { role: { in: ['THUMBNAIL', 'GALLERY'] } }, // <— was FEATURED,THUMBNAIL
          include: { media: true },
          orderBy: [{ role: 'asc' }, { position: 'asc' }],
        },
      },
    }),
    dbClient.blogPost.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));
  const hasNextPage = skip + items.length < total;

  return { items, total, limit: take, page: currentPage, totalPages, hasNextPage };
};

export async function updateBlogPost(
  id,
  scalarFields = {},
  {
    replaceTagsWith,        // string[] | undefined (undefined = no change, [] = clear all)
    thumbnailImageKey,      // string | null | undefined
    galleryKeys,            // string[] | [] | undefined (replace set)
    embedKeys,              // string[] | [] | undefined (replace set)
  } = {},
) {
  // ---- 1) SCALARS -----------------------------------------------------
  const data = {};
  for (const [k, v] of Object.entries(scalarFields)) {
    if (v !== undefined) data[k] = v;
  }
  // allow clearing legacy columns via null
  if (thumbnailImageKey !== undefined) data.thumbnailImage = thumbnailImageKey;

  await dbClient.blogPost.update({
    where: { id },
    data,
    select: { id: true },
  });

  // ---- 2) TAGS (replace only if requested) ----------------------------
  if (replaceTagsWith !== undefined) {
    // clear all existing tags
    await dbClient.blogPost.update({
      where: { id },
      data: { tags: { set: [] } },
    });

    if (Array.isArray(replaceTagsWith) && replaceTagsWith.length) {
      await dbClient.blogPost.update({
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

  // ---- 3) MEDIA (skip gracefully if models don't exist) ---------------
  const canLinkMedia =
    !!dbClient?.media?.createMany &&
    !!dbClient?.media?.findMany &&
    !!dbClient?.blogMedia?.createMany &&
    !!dbClient?.blogMedia?.deleteMany &&
    !!dbClient?.blogMedia?.create;

  if (canLinkMedia) {
    // Collect keys we might need to ensure
    const keysToEnsure = [
      ...(featuredImageKey ? [featuredImageKey] : []),
      ...(thumbnailImageKey ? [thumbnailImageKey] : []),
      ...(Array.isArray(galleryKeys) ? galleryKeys : []),
      ...(Array.isArray(embedKeys) ? embedKeys : []),
    ];

    // Ensure Media rows exist (bulk then read back -> map key -> id)
    let idByKey = new Map();
    if (keysToEnsure.length) {
      await dbClient.media.createMany({
        data: keysToEnsure.map((key) => ({ key })),
        skipDuplicates: true,
      });
      const mediaRows = await dbClient.media.findMany({
        where: { key: { in: keysToEnsure } },
        select: { id: true, key: true },
      });
      idByKey = new Map(mediaRows.map((m) => [m.key, m.id]));
    }

    // THUMBNAIL
    if (thumbnailImageKey !== undefined) {
      await dbClient.blogMedia.deleteMany({ where: { blogPostId: id, role: 'THUMBNAIL' } });
      if (thumbnailImageKey) {
        await dbClient.blogMedia.create({
          data: {
            blogPostId: id,
            mediaId: idByKey.get(thumbnailImageKey),
            role: 'THUMBNAIL',
            position: 0,
          },
        });
      }
    }

    // GALLERY (replace if provided)
    if (galleryKeys !== undefined) {
      await dbClient.blogMedia.deleteMany({ where: { blogPostId: id, role: 'GALLERY' } });
      if (Array.isArray(galleryKeys) && galleryKeys.length) {
        await dbClient.blogMedia.createMany({
          data: galleryKeys.map((key, i) => ({
            blogPostId: id,
            mediaId: idByKey.get(key),
            role: 'GALLERY',
            position: i,
          })),
          skipDuplicates: true,
        });
      }
    }

    // EMBED (replace if provided)
    if (embedKeys !== undefined) {
      await dbClient.blogMedia.deleteMany({ where: { blogPostId: id, role: 'EMBED' } });
      if (Array.isArray(embedKeys) && embedKeys.length) {
        await dbClient.blogMedia.createMany({
          data: embedKeys.map((key, i) => ({
            blogPostId: id,
            mediaId: idByKey.get(key),
            role: 'EMBED',
            position: i,
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  // ---- 4) RETURN hydrated post ---------------------------------------
  const include = {
    tags: true,
  };
  if (canLinkMedia) {
    include.mediaLinks = {
      include: { media: true },
      orderBy: [{ role: 'asc' }, { position: 'asc' }],
    };
  }

  return dbClient.blogPost.findUnique({
    where: { id },
    include,
  });
}
