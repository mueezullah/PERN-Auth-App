import { Router } from "express";
import {
  create,
  listActive,
  getOne,
  getUserCampaigns,
  update,
} from "./campaign.controller.js";
import { validateCreate, validateUpdate } from "./campaign.validation.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";
import { deleteCampaign } from "./campaign.controller.js";

const router = Router();

router.post("/", ensureAuthenticated, validateCreate, create);
router.get("/", listActive);
router.get("/user/:userId", getUserCampaigns);
router.get("/:id", getOne);
router.put("/:id", ensureAuthenticated, validateUpdate, update);
router.delete("/:id", ensureAuthenticated, deleteCampaign);

export default router;
