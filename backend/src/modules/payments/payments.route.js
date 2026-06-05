import express from "express";
import { createDonationIntent, confirmDonation } from './payments.controller.js';
import { ensureAuthenticated } from '../auth/auth.middleware.js';

const router = express.Router();
// POST /api/payments/create-intent
// We use 'ensureAuthenticated' because we need to know WHICH user is donating
router.post("/create-intent", ensureAuthenticated, createDonationIntent);

// POST /api/payments/confirm
// Called when frontend says Stripe succeeded. We verify and update the DB!
router.post("/confirm", ensureAuthenticated, confirmDonation);

export default router;
