import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Posts table verified via Prisma");
};

export const createPost = async (userId, content, mediaUrl) => {
  return await prisma.post.create({
    data: {
      user_id: parseInt(userId, 10),
      content,
      media_url: mediaUrl,
    },
  });
};

export const findAllPosts = async (limit = 10, offset = 0) => {
  const whereCondition = { status: { not: "deleted" } };

  const [postsList, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true, username: true, email: true, role: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.post.count({ where: whereCondition }),
  ]);

  const formattedPosts = await Promise.all(
    postsList.map(async (p) => {
      const [commentsCount, likesCount] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "post", target_id: p.id },
        }),
        prisma.like.count({
          where: { target_type: "post", target_id: p.id },
        }),
      ]);

      return {
        ...p,
        author_name: p.user?.name,
        author_username: p.user?.username,
        author_email: p.user?.email,
        author_role: p.user?.role,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    posts: formattedPosts,
    total: totalCount,
  };
};

export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const whereCondition = {
    user_id: parseInt(userId, 10),
    status: { not: "deleted" },
  };

  const [postsList, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true, username: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.post.count({ where: whereCondition }),
  ]);

  const formattedPosts = await Promise.all(
    postsList.map(async (p) => {
      const [commentsCount, likesCount] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "post", target_id: p.id },
        }),
        prisma.like.count({
          where: { target_type: "post", target_id: p.id },
        }),
      ]);

      return {
        ...p,
        author_name: p.user?.name,
        author_username: p.user?.username,
        author_email: p.user?.email,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    posts: formattedPosts,
    total: totalCount,
  };
};

export const findById = async (id) => {
  return await prisma.post.findUnique({
    where: { id: parseInt(id, 10) },
  });
};

export const deletePost = async (id) => {
  return await prisma.post.update({
    where: { id: parseInt(id, 10) },
    data: { status: "deleted" },
  });
};

export const updatePost = async (id, userId, content, mediaUrl) => {
  const updateData = { status: "updated" };
  if (content !== undefined && content !== null) updateData.content = content;
  if (mediaUrl !== undefined && mediaUrl !== null) updateData.media_url = mediaUrl;

  const updated = await prisma.post.updateMany({
    where: {
      id: parseInt(id, 10),
      user_id: parseInt(userId, 10),
    },
    data: updateData,
  });

  if (updated.count === 0) return null;

  return await findById(id);
};

export const findPostWithAuthor = async (id) => {
  const post = await prisma.post.findFirst({
    where: {
      id: parseInt(id, 10),
      status: { not: "deleted" },
    },
    include: {
      user: {
        select: { name: true, username: true, email: true, role: true },
      },
    },
  });

  if (!post) return null;

  const [commentsCount, likesCount] = await Promise.all([
    prisma.comment.count({
      where: { target_type: "post", target_id: post.id },
    }),
    prisma.like.count({
      where: { target_type: "post", target_id: post.id },
    }),
  ]);

  return {
    ...post,
    author_name: post.user?.name,
    author_username: post.user?.username,
    author_email: post.user?.email,
    author_role: post.user?.role,
    comments_count: commentsCount,
    likes_count: likesCount,
  };
};
