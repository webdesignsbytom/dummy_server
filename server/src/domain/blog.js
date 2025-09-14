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
        include: { media: true }, // pulls the Media row (has the S3 key)
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
  title,
  slug,
  content,
  authorId,
  authorName,
  tagNames = [],
  {
    thumbnailImageKey = null,
    galleryKeys = [],
    embedKeys = [],
    subTitle = null,
    subject = null,
    location = null,
  } = {},
  isPublished = true
) {
  const post = await dbClient.blogPost.create({
    data: {
      title,
      slug,
      content,
      authorId,
      authorName,
      isPublished,
      subTitle,
      subject,
      location,
      ...(thumbnailImageKey ? { thumbnailImage: thumbnailImageKey } : {}),
    },
    select: { id: true, title: true, slug: true },
  });

  const uniqueTagNames = Array.from(new Set((tagNames || []).map((s) => String(s).trim()).filter(Boolean)));
  const allMediaKeys   = Array.from(new Set([thumbnailImageKey, ...galleryKeys, ...embedKeys].filter(Boolean)));

  // Tags (BlogTag) — run independently, no transaction
  const tagTask = (async () => {
    if (!uniqueTagNames.length) return;

    await dbClient.blogTag.createMany({
      data: uniqueTagNames.map((name) => ({ name })),
      skipDuplicates: true,
    });

    const tags = await dbClient.blogTag.findMany({
      where: { name: { in: uniqueTagNames } },
      select: { id: true },
    });

    if (tags.length) {
      // If your relation field on BlogPost is named differently, change `tags` below.
      await dbClient.blogPost.update({
        where: { id: post.id },
        data: { tags: { connect: tags.map((t) => ({ id: t.id })) } },
        select: { id: true },
      });
    }
  })();

  // Media + links — run independently, no transaction
  const mediaTask = (async () => {
    if (!allMediaKeys.length) return;

    await dbClient.media.createMany({
      data: allMediaKeys.map((key) => ({ key })),
      skipDuplicates: true,
    });

    const medias = await dbClient.media.findMany({
      where: { key: { in: allMediaKeys } },
      select: { id: true, key: true },
    });
    const idByKey = Object.fromEntries(medias.map((m) => [m.key, m.id]));

    const links = [];

    if (thumbnailImageKey && idByKey[thumbnailImageKey]) {
      links.push({
        blogPostId: post.id,
        mediaId: idByKey[thumbnailImageKey],
        role: 'THUMBNAIL',
        position: 0,
      });
    }

    galleryKeys.forEach((k, i) => {
      if (idByKey[k]) {
        links.push({
          blogPostId: post.id,
          mediaId: idByKey[k],
          role: 'GALLERY',
          position: i,
        });
      }
    });

    embedKeys.forEach((k, i) => {
      if (idByKey[k]) {
        links.push({
          blogPostId: post.id,
          mediaId: idByKey[k],
          role: 'EMBED',
          position: i,
        });
      }
    });

    if (links.length) {
      await dbClient.blogMedia.createMany({
        data: links,
        skipDuplicates: true,
      });
    }
  })();

  await Promise.all([tagTask, mediaTask]);

  return post; // minimal shape already (id/title/slug)
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
  // scalars: only fields you provide (not undefined) will be updated
  scalarFields = {},
  {
    replaceTagsWith, // string[] | undefined (undefined = no change, [] = clear all)
    featuredImageKey, // string | null | undefined (undefined = no change, null = clear)
    thumbnailImageKey, // string | null | undefined
    galleryKeys, // string[] | [] | undefined (replace set if provided)
    embedKeys, // string[] | [] | undefined (replace set if provided)
  } = {}
) {
  // ---- 1) SCALARS -----------------------------------------------------
  const data = {};
  for (const [k, v] of Object.entries(scalarFields)) {
    if (v !== undefined) data[k] = v; // only set provided fields
  }
  // keep legacy thumbnail column in sync if you still read it on FE
  if (thumbnailImageKey !== undefined) data.thumbnailImage = thumbnailImageKey;
  // (No legacy 'featuredImage' column in your model, so nothing to mirror there)

  await dbClient.blogPost.update({
    where: { id },
    data,
    select: { id: true },
  });

  // ---- 2) TAGS (replace only if requested) ----------------------------
  if (replaceTagsWith !== undefined) {
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

  const canLinkMedia =
  !!dbClient?.media?.createMany &&
  !!dbClient?.media?.findMany &&
  !!dbClient?.blogMedia?.createMany &&
  !!dbClient?.blogMedia?.deleteMany &&
  !!dbClient?.blogMedia?.create;

if (canLinkMedia) {
  // helpers
  const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

  // sanitize inputs (undefined = no change; [] = replace with empty)
  const sanitized = {
    featuredImageKey,                      // string | null | undefined
    thumbnailImageKey,                    // string | null | undefined
    gallery:  (galleryKeys === undefined) ? undefined : uniq(galleryKeys),
    embed:    (embedKeys   === undefined) ? undefined : uniq(embedKeys),
  };

  // Keys we must ensure exist in Media rows
  const keysToEnsure = uniq([
    ...(sanitized.featuredImageKey ? [sanitized.featuredImageKey] : []),
    ...(sanitized.thumbnailImageKey ? [sanitized.thumbnailImageKey] : []),
    ...(sanitized.gallery || []),
    ...(sanitized.embed   || []),
  ]);

  // Ensure Media rows exist, then build idByKey map
  let idByKey = new Map();
  if (keysToEnsure.length) {
    await dbClient.media.createMany({ data: keysToEnsure.map((key) => ({ key })), skipDuplicates: true });
    const mediaRows = await dbClient.media.findMany({
      where: { key: { in: keysToEnsure } },
      select: { id: true, key: true },
    });
    idByKey = new Map(mediaRows.map((m) => [m.key, m.id]));
  }

  // helper to replace all links for a given role atomically (delete then create)
  const replaceRole = async (role, items /* [{key, pos}] */) => {
    await dbClient.blogMedia.deleteMany({ where: { blogPostId: id, role } });
    if (items && items.length) {
      await dbClient.blogMedia.createMany({
        data: items.map(({ key, pos }) => ({
          blogPostId: id,
          mediaId: idByKey.get(key),
          role,
          position: pos,
        })),
        skipDuplicates: true,
      });
    }
  };

  // build tasks; only run for fields explicitly provided
  const tasks = [];

  if (sanitized.featuredImageKey !== undefined) {
    const items = sanitized.featuredImageKey ? [{ key: sanitized.featuredImageKey, pos: 0 }] : [];
    tasks.push(replaceRole('FEATURED', items));
  }

  if (sanitized.thumbnailImageKey !== undefined) {
    const items = sanitized.thumbnailImageKey ? [{ key: sanitized.thumbnailImageKey, pos: 0 }] : [];
    tasks.push(replaceRole('THUMBNAIL', items));
  }

  if (sanitized.gallery !== undefined) {
    const items = (sanitized.gallery || []).map((key, i) => ({ key, pos: i }));
    tasks.push(replaceRole('GALLERY', items));
  }

  if (sanitized.embed !== undefined) {
    const items = (sanitized.embed || []).map((key, i) => ({ key, pos: i }));
    tasks.push(replaceRole('EMBED', items));
  }

  // run role updates in parallel
  if (tasks.length) await Promise.all(tasks);
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

export async function deleteBlogPostById(id) {
  const existing = await dbClient.blogPost.findUnique({
    where: { id },
    include: {
      tags: true,
      mediaLinks: { include: { media: true } },
    },
  });
  if (!existing) return null;

  await dbClient.blogPost.delete({ where: { id } });

  return existing;
}
