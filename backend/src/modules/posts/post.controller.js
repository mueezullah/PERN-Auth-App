import * as Post from "./post.model.js";
import { getPaginationData, parsePaginationParams } from "../../utils/pagination.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const createPost = asyncHandler(async (req, res, next) => {

  const { content, mediaUrl } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ success: false, message: "Post content is required" });
  }

  const newPost = await Post.createPost(userId, content, mediaUrl);
  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: newPost
  });
});

export const getAllPosts = asyncHandler(async (req, res, next) => {

  const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
  const offset = (page - 1) * limit;

  const { posts, total } = await Post.findAllPosts(limit, offset);

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: getPaginationData(total, page, limit)
    }
  });
});

export const getUserPosts = asyncHandler(async (req, res, next) => {

  const userId = parseInt(req.params.userId, 10);
  const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
  const offset = (page - 1) * limit;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  const { posts, total } = await Post.findByUserId(userId, limit, offset);
  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: getPaginationData(total, page, limit)
    }
  });
});

export const deletePost = asyncHandler(async (req, res, next) => {

  const postId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  // 1. Fetch post by ID
  const post = await Post.findById(postId);

  // 2. Check if post exists
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found"
    });
  }

  // 3. Verify user ownership of the post
  if (post.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not own this post"
    });
  }

  // 4. Delete the post
  const deletedPost = await Post.deletePost(postId);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
    data: deletedPost
  });
});

export const updatePost = asyncHandler(async (req, res, next) => {

  const postId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { content, mediaUrl } = req.body;

  const updatedPost = await Post.updatePost(postId, userId, content, mediaUrl);

  if (!updatedPost) {
    return res.status(404).json({
      success: false,
      message: "Post not found or you are not authorized to edit it"
    });
  }

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: updatedPost
  });
});
