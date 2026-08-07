import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Campaigns table verified via Prisma");
};

export const create = async (
  userId,
  title,
  description,
  goalAmount,
  deadline,
  mediaUrl,
) => {
  return await prisma.campaign.create({
    data: {
      user_id: parseInt(userId, 10),
      title,
      description,
      goal_amount: goalAmount,
      deadline: new Date(deadline),
      media_url: mediaUrl,
    },
  });
};

export const findAllActive = async (limit, offset, status = "active") => {
  const whereCondition =
    status && status !== "all"
      ? { status }
      : { status: { not: "deleted" } };

  const [campaignsList, totalCount] = await Promise.all([
    prisma.campaign.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true, username: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.campaign.count({ where: whereCondition }),
  ]);

  // Transform campaigns to include comments_count, likes_count, owner_name, owner_username
  const formattedCampaigns = await Promise.all(
    campaignsList.map(async (c) => {
      const [commentsCount, likesCount] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        prisma.like.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
      ]);

      return {
        ...c,
        owner_name: c.user?.name,
        owner_username: c.user?.username,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    campaigns: formattedCampaigns,
    total: totalCount,
  };
};

export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const whereCondition = {
    user_id: parseInt(userId, 10),
    status: { not: "deleted" },
  };

  const [campaignsList, totalCount] = await Promise.all([
    prisma.campaign.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true, username: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.campaign.count({ where: whereCondition }),
  ]);

  const formattedCampaigns = await Promise.all(
    campaignsList.map(async (c) => {
      const [commentsCount, likesCount] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        prisma.like.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
      ]);

      return {
        ...c,
        owner_name: c.user?.name,
        owner_username: c.user?.username,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    campaigns: formattedCampaigns,
    total: totalCount,
  };
};

export const findById = async (id) => {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: parseInt(id, 10),
      status: { not: "deleted" },
    },
    include: {
      user: {
        select: { name: true, username: true, email: true },
      },
    },
  });

  if (!campaign) return null;

  const [commentsCount, likesCount] = await Promise.all([
    prisma.comment.count({
      where: { target_type: "campaign", target_id: campaign.id },
    }),
    prisma.like.count({
      where: { target_type: "campaign", target_id: campaign.id },
    }),
  ]);

  return {
    ...campaign,
    owner_name: campaign.user?.name,
    owner_username: campaign.user?.username,
    owner_email: campaign.user?.email,
    comments_count: commentsCount,
    likes_count: likesCount,
  };
};

export const update = async (
  id,
  title,
  description,
  goalAmount,
  deadline,
  mediaUrl,
) => {
  const updateData = {
    status: "updated",
  };
  if (title !== undefined && title !== null) updateData.title = title;
  if (description !== undefined && description !== null) updateData.description = description;
  if (goalAmount !== undefined && goalAmount !== null) updateData.goal_amount = goalAmount;
  if (deadline !== undefined && deadline !== null) updateData.deadline = new Date(deadline);
  if (mediaUrl !== undefined && mediaUrl !== null) updateData.media_url = mediaUrl;

  return await prisma.campaign.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
  });
};

export const updateExpiredCampaigns = async () => {
  const expiredCampaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
      deadline: { lt: new Date() },
    },
  });

  await prisma.campaign.updateMany({
    where: {
      status: "active",
      deadline: { lt: new Date() },
    },
    data: {
      status: "ended",
    },
  });

  return expiredCampaigns;
};

export const deleteCampaign = async (id) => {
  return await prisma.campaign.update({
    where: { id: parseInt(id, 10) },
    data: {
      status: "deleted",
      current_amount: 0,
    },
  });
};
