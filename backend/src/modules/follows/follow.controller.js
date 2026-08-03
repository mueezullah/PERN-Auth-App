import * as FollowModel from "./follow.model.js";

export const handleToggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id; // from auth middleware
    const followingId = parseInt(req.params.targetUserId, 10);

    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const result = await FollowModel.toggleFollow(followerId, followingId);
    const counts = await FollowModel.getFollowCounts(followingId);

    return res.status(200).json({
      success: true,
      isFollowing: result.isFollowing,
      ...counts,
    });
  } catch (error) {
    console.error("Error in handleToggleFollow:", error);
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user?.id;
    const targetUserId = parseInt(req.params.targetUserId, 10);

    const counts = await FollowModel.getFollowCounts(targetUserId);
    const isFollowing = followerId
      ? await FollowModel.checkIsFollowing(followerId, targetUserId)
      : false;

    return res.status(200).json({
      success: true,
      isFollowing,
      ...counts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getFollowersList = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const followers = await FollowModel.getFollowers(userId);
    return res.status(200).json({ success: true, followers });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getFollowingList = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const following = await FollowModel.getFollowing(userId);
    return res.status(200).json({ success: true, following });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
