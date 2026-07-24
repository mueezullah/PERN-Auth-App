import * as Like from "./like.model.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const toggleLike = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  const userId = req.user.id;

  if (!targetType || !targetId) {
    return res.status(400).json({
      success: false,
      message: "targetType and targetId are required"
    });
  }

  if (targetType !== "campaign" && targetType !== "post") {
    return res.status(400).json({
      success: false,
      message: "targetType must be either 'campaign' or 'post'"
    });
  }

  const numericTargetId = parseInt(targetId, 10);
  if (isNaN(numericTargetId)) {
    return res.status(400).json({
      success: false,
      message: "targetId must be an integer"
    });
  }

  const result = await Like.toggle(userId, targetType, numericTargetId);
  const likesCount = await Like.countByTarget(targetType, numericTargetId);

  res.status(200).json({
    success: true,
    data: {
      liked: result.liked,
      likesCount
    }
  });
});

export const getLikeStatus = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  const userId = req.user?.id;

  if (!targetType || !targetId) {
    return res.status(400).json({
      success: false,
      message: "targetType and targetId query parameters are required"
    });
  }

  const numericTargetId = parseInt(targetId, 10);
  if (isNaN(numericTargetId)) {
    return res.status(400).json({
      success: false,
      message: "targetId must be an integer"
    });
  }

  const likesCount = await Like.countByTarget(targetType, numericTargetId);
  const liked = userId ? await Like.hasUserLiked(userId, targetType, numericTargetId) : false;

  res.status(200).json({
    success: true,
    data: {
      liked,
      likesCount
    }
  });
});
