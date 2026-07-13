import express from "express";
import { getComments, createComment } from "./comment.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", ensureAuthenticated, createComment);

export default router;
