const express = require("express");
const postController = require("./post.controller");
const { ensureAuthenticated } = require("../auth/auth.middleware");

const router = express.Router();

// Routes for Posts
// GET main feed (either public or logged in? usually authenticated users or public. Let's make it public to fetch, but require auth for some)
router.get("/", postController.getAllPosts);

// GET specific user's posts
router.get("/user/:userId", postController.getUserPosts);

// Protected routes (require user to be logged in)
router.post("/", ensureAuthenticated, postController.createPost);
router.put("/:id", ensureAuthenticated, postController.updatePost);
router.delete("/:id", ensureAuthenticated, postController.deletePost);

module.exports = router;
