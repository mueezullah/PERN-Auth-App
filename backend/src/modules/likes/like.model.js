import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Likes table verified via Prisma");
};

export const toggle = async (userId, targetType, targetId) => {
  const uId = parseInt(userId, 10);
  const tId = parseInt(targetId, 10);

  const existing = await prisma.like.findUnique({
    where: {
      user_id_target_type_target_id: {
        user_id: uId,
        target_type: targetType,
        target_id: tId,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        user_id: uId,
        target_type: targetType,
        target_id: tId,
      },
    });
    return { liked: true };
  }
};

export const countByTarget = async (targetType, targetId) => {
  return await prisma.like.count({
    where: {
      target_type: targetType,
      target_id: parseInt(targetId, 10),
    },
  });
};

export const hasUserLiked = async (userId, targetType, targetId) => {
  const count = await prisma.like.count({
    where: {
      user_id: parseInt(userId, 10),
      target_type: targetType,
      target_id: parseInt(targetId, 10),
    },
  });
  return count > 0;
};
