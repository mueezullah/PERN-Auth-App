const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const campaignRoutes = require("./modules/campaigns/campaign.routes");
const postRoutes = require("./modules/posts/post.routes");
const paymentRoutes = require("./modules/payments/payments.route");

const router = express.Router();

// Mount module routes
router.get("/health", (req, res) => res.send("Working Perfectly Well!!!"));
router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/posts", postRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
