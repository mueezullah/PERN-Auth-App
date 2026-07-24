import express from "express";
import { toggleLike, getLikeStatus } from "./like.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/toggle", ensureAuthenticated, toggleLike);
router.get("/status", ensureAuthenticated, getLikeStatus);

export default router;
