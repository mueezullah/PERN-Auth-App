import express from "express";
import { ensureAuthenticated, optionalAuth } from "../auth/auth.middleware.js";
import {
    handleToggleFollow,
    getFollowStatus,
    getFollowersList,
    getFollowingList,
} from "./follow.controller.js";

const router = express.Router();

router.post("/:targetUserId/toggle", ensureAuthenticated, handleToggleFollow);
router.get("/:targetUserId/status", optionalAuth, getFollowStatus);
router.get("/:userId/followers", getFollowersList);
router.get("/:userId/following", getFollowingList);

export default router;
