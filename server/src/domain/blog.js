export const findAllBlogPosts = () =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true, // implicit M2M: get BlogTag[] directly
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
      tags: true, // BlogTag[]
    },
  });

// Get single post by ID
export const findBlogPostById = (id) =>
  dbClient.blogPost.findUnique({
    where: { id },
    include: {
      tags: true, // BlogTag[]
    },
  });

// Get posts by tag (via tag slug)
export const findBlogPostsByTag = (tagSlug) =>
  dbClient.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      tags: {
        some: {
          slug: tagSlug, // direct check on BlogTag.slug
        },
      },
    },
    include: { tags: true }, // BlogTag[]
  });

// Create a new blog post (connect tags by ID)
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
      // implicit M2M connect
      ...(Array.isArray(tagIds) && tagIds.length
        ? { tags: { connect: tagIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { tags: true },
  });
};