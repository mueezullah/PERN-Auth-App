import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhook } from "./modules/payments/payments.controller.js";

const app = express();

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  STRIPE WEBHOOK — MUST be mounted BEFORE express.json()!                ║
// ║                                                                          ║
// ║  WHY: Stripe signs webhook requests using the raw request body bytes.    ║
// ║  If express.json() parses the body first, the raw bytes are lost and     ║
// ║  signature verification ALWAYS fails with "No signatures found matching  ║
// ║  the expected signature".                                                ║
// ║                                                                          ║
// ║  HOW: We use express.raw() which gives us the body as a Buffer.         ║
// ║  This raw Buffer is exactly what stripe.webhooks.constructEvent() needs. ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
app.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),  // raw body as Buffer, NOT parsed JSON
    stripeWebhook
);

// Global request pipeline parsing and security middlewares
// (Everything AFTER this line receives parsed JSON bodies as usual)
app.use(express.json());
app.use(cors());

// mount all routes
app.use(routes);

// Global error handler (must be after routes)
app.use(errorHandler);

export default app;
