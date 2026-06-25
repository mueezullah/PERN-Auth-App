import { Router } from "express";
import { getUserProfile } from "./user.controller.js";

const router = Router();

router.get("/:username", getUserProfile);

export default router;
