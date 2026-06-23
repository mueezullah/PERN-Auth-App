import express from "express";
import { createDonationIntent, confirmDonation, stripeWebhook, cleanupStaleDonations } from './payments.controller.js';
import { ensureAuthenticated } from '../auth/auth.middleware.js';

const router = express.Router();
// POST /api/payments/create-intent
// We use 'ensureAuthenticated' because we need to know WHICH user is donating
router.post("/create-intent", ensureAuthenticated, createDonationIntent);

// POST /api/payments/confirm
// Called when frontend says Stripe succeeded. We verify and update the DB!
router.post("/confirm", ensureAuthenticated, confirmDonation);

// POST /api/payments/cleanup
// Admin utility to expire stale pending donations older than 1 hour.
// In production, you'd protect this with an admin-only middleware.
// For now, it requires authentication as a basic safeguard.
router.post("/cleanup", ensureAuthenticated, cleanupStaleDonations);

export default router;

// ──────────────────────────────────────────────────────────────────────
//  NOTE: The Stripe webhook route is NOT mounted here.
//  It's mounted directly in app.js BEFORE express.json() because
//  Stripe requires the raw (unparsed) request body to verify signatures.
//  See app.js for the webhook route: POST /webhooks/stripe
// ──────────────────────────────────────────────────────────────────────
