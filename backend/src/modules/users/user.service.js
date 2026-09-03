import * as UserModel from "./user.model.js";

export const getUserProfileStats = async (username) => {
  const user = await UserModel.findByUsername(username);
  if (!user) {
    return null;
  }

  const [posts, campaigns, backedProjects, totalContributed] =
    await Promise.all([
      UserModel.getPostCountByUserId(user.id),
      UserModel.getCampaignCountByUserId(user.id),
      UserModel.getBackedProjectsCountByUserId(user.id),
      UserModel.getTotalContributedByUserId(user.id),
    ]);

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    posts,
    campaigns,
    backedProjects,
    totalContributed,
  };
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  const updatedUser = await UserModel.update(userId, { avatar_url: avatarUrl });
  return updatedUser;
};

