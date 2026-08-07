import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import campaignRoutes from "./modules/campaigns/campaign.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import paymentRoutes from "./modules/payments/payments.route.js";
import userRoutes from "./modules/users/user.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import likeRoutes from "./modules/likes/like.routes.js";
import followRoutes from "./modules/follows/follow.routes.js";

const router = express.Router();

// Testing route
router.get("/health", (req, res) => res.send("Working Perfectly Well!!!"));

// Mount module routes
router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/posts", postRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/follows", followRoutes);

export default router;
