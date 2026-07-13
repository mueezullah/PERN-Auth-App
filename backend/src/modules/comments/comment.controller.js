import * as Comment from "./comment.model.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getComments = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, since } = req.query;

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

  const comments = await Comment.findByTarget(targetType, numericTargetId, since);

  res.status(200).json({
    success: true,
    data: comments
  });
});

export const createComment = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, content } = req.body;
  const userId = req.user.id;

  if (!targetType || !targetId || !content) {
    return res.status(400).json({
      success: false,
      message: "targetType, targetId, and content are required fields"
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

  if (!content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content cannot be empty"
    });
  }

  const newComment = await Comment.create(userId, targetType, numericTargetId, content.trim());
  
  // Fetch new comment with author details to return immediately
  const commentsList = await Comment.findByTarget(targetType, numericTargetId);
  const commentWithDetails = commentsList.find(c => c.id === newComment.id);

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: commentWithDetails || newComment
  });
});
