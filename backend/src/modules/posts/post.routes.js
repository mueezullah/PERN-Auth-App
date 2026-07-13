import express from "express";
import { createPost, getAllPosts, getUserPosts, deletePost, updatePost, getPostById } from "./post.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

// Routes for Posts
// GET main feed (either public or logged in? usually authenticated users or public. Let's make it public to fetch, but require auth for some)
router.get("/", getAllPosts);

// GET specific post by ID
router.get("/:id", getPostById);

// GET specific user's posts
router.get("/user/:userId", getUserPosts);

// Protected routes (require user to be logged in)
router.post("/", ensureAuthenticated, createPost);
router.put("/:id", ensureAuthenticated, updatePost);
router.delete("/:id", ensureAuthenticated, deletePost);

export default router;
