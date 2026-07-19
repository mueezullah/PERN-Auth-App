import express from "express";
import { getComments, createComment, deleteComment } from "./comment.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", ensureAuthenticated, createComment);
router.delete("/:id", ensureAuthenticated, deleteComment);

export default router;
