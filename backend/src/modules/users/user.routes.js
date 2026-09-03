import { Router } from "express";
import { getUserProfile, updateAvatar } from "./user.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.put("/avatar", ensureAuthenticated, upload.single("avatar"), updateAvatar);
router.get("/:username", getUserProfile);

export default router;

