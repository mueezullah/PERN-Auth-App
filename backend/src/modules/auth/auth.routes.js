import express from "express";
import { signup, login, getAllUsers } from "./auth.controller.js";
import { signupValidation, loginValidation } from "./auth.validation.js";
import { ensureAuthenticated, ensureAdmin } from "./auth.middleware.js";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/users", ensureAuthenticated, ensureAdmin, getAllUsers);

export default router;
