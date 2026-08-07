import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Follows table verified via Prisma");
};

export const toggleFollow = async (followerId, followingId) => {
  const fId = parseInt(followerId, 10);
  const targetId = parseInt(followingId, 10);

  if (fId === targetId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: fId,
        following_id: targetId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { id: existing.id },
    });
    return { isFollowing: false };
  } else {
    await prisma.follow.create({
      data: {
        follower_id: fId,
        following_id: targetId,
      },
    });
    return { isFollowing: true };
  }
};

export const checkIsFollowing = async (followerId, followingId) => {
  const count = await prisma.follow.count({
    where: {
      follower_id: parseInt(followerId, 10),
      following_id: parseInt(followingId, 10),
    },
  });
  return count > 0;
};

export const getFollowCounts = async (userId) => {
  const uId = parseInt(userId, 10);
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { following_id: uId } }),
    prisma.follow.count({ where: { follower_id: uId } }),
  ]);

  return {
    followersCount,
    followingCount,
  };
};

export const getFollowers = async (userId) => {
  const follows = await prisma.follow.findMany({
    where: { following_id: parseInt(userId, 10) },
    include: {
      follower: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return follows.map((f) => ({
    id: f.follower.id,
    name: f.follower.name,
    email: f.follower.email,
    created_at: f.created_at,
  }));
};

export const getFollowing = async (userId) => {
  const follows = await prisma.follow.findMany({
    where: { follower_id: parseInt(userId, 10) },
    include: {
      following: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return follows.map((f) => ({
    id: f.following.id,
    name: f.following.name,
    email: f.following.email,
    created_at: f.created_at,
  }));
};
