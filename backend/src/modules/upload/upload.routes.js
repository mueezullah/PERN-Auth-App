import { Router } from "express";
import { uploadImage } from "./upload.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = Router();

router.post("/image", ensureAuthenticated, upload.single("image"), uploadImage);

export default router;
