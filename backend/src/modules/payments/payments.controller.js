// 💡 ARCHITECTURE NOTE (DUAL DATABASE ACCESS PATTERN):
// Standard CRUD models (Users, Posts, Comments, Likes, Follows) use Prisma ORM for type safety.
// Payments & Critical Financial Transactions explicitly use Raw SQL (`pg` pool, parameterized queries,
// explicit BEGIN/COMMIT transaction locks) to showcase raw SQL proficiency, low-level transaction control,
// and performance optimization alongside Prisma.

import pool from "../../config/db.js";
import Stripe from "stripe"
import { findById as findCampaignById } from "../campaigns/campaign.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  GAP 1 FIX — IDEMPOTENT INTENT CREATION                                 ║
// ║                                                                          ║
// ║  PROBLEM: If the user double-clicks "Donate" or their browser retries    ║
// ║  the request, two separate Stripe PaymentIntents get created (each       ║
// ║  with its own pending row in our DB). Only one can ever be confirmed     ║
// ║  thanks to the UNIQUE constraint, but the other becomes an orphan —      ║
// ║  wasting a Stripe API call and cluttering the database.                  ║
// ║                                                                          ║
// ║  FIX: Before creating a new PaymentIntent, we check if this user        ║
// ║  already has a 'pending' donation for this campaign. If they do AND      ║
// ║  the Stripe intent is still usable, we return the SAME client_secret     ║
// ║  instead of creating a duplicate. This makes the endpoint idempotent.    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const createDonationIntent = asyncHandler(async (req, res) => {
    const { amount, campaignId } = req.body;
    // User ID comes from the JWT token via auth middleware
    const userId = req.user.id;

    // Fetch campaign to check if the user is trying to donate to their own campaign and check remaining goal
    const campaignQuery = await pool.query(
        'SELECT user_id, goal_amount, current_amount, status FROM campaigns WHERE id = $1',
        [campaignId]
    );
    if (campaignQuery.rows.length === 0) {
        return res.status(404).json({ message: "Campaign not found" });
    }

    const campaign = campaignQuery.rows[0];
    if (campaign.user_id === userId) {
        return res.status(400).json({ message: "You cannot donate to your own campaign" });
    }
    if (campaign.status !== 'active') {
        return res.status(400).json({ message: "This campaign is no longer active" });
    }

    const goalAmount = parseFloat(campaign.goal_amount);
    const currentAmount = parseFloat(campaign.current_amount);
    const remainingAmount = goalAmount - currentAmount;

    if (amount > remainingAmount) {
        return res.status(400).json({
            message: `You cannot fund more than the required amount. Remaining required amount is $${remainingAmount.toFixed(2)}.`
        });
    }

    // ──────────────────────────────────────────────────────────────────────
    //  IDEMPOTENCY CHECK: Look for an existing pending donation from this
    //  user for this campaign. If one exists and the Stripe PaymentIntent
    //  is still in a usable state, reuse it instead of creating a new one.
    //
    //  "Usable" Stripe states:
    //    • requires_payment_method — user hasn't entered card details yet
    //    • requires_confirmation   — card details entered, awaiting confirm
    //    • requires_action         — e.g. 3D Secure prompt pending
    //
    //  If the existing intent has moved past these states (e.g. it was
    //  canceled or already succeeded), we skip it and create a fresh one.
    // ──────────────────────────────────────────────────────────────────────
    const existingDonation = await pool.query(
        `SELECT stripe_payment_intent_id FROM donations
         WHERE donor_id = $1 AND campaign_id = $2 AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [userId, campaignId]
    );

    if (existingDonation.rows.length > 0) {
        try {
            // Ask Stripe what state this PaymentIntent is in right now
            const existingIntent = await stripe.paymentIntents.retrieve(
                existingDonation.rows[0].stripe_payment_intent_id
            );

            const reusableStates = [
                'requires_payment_method',
                'requires_confirmation',
                'requires_action'
            ];

            if (reusableStates.includes(existingIntent.status)) {
                // ✅ Intent is still alive and waiting — reuse it!
                // This prevents a double-click from creating two intents.
                console.log(
                    `♻️  Reusing existing PaymentIntent ${existingIntent.id} ` +
                    `for user ${userId} on campaign ${campaignId}`
                );
                return res.status(200).json({
                    clientSecret: existingIntent.client_secret,
                });
            }
            // If we reach here, the old intent is no longer usable
            // (canceled, succeeded but never confirmed on our side, etc.)
            // We'll fall through and create a brand-new one below.
        } catch (stripeError) {
            // If Stripe can't find the old intent (rare), just create a new one
            console.warn(
                `⚠️  Could not retrieve existing PaymentIntent: ${stripeError.message}. Creating new one.`
            );
        }
    }

    // 1. Create a Payment Intent on Stripe
    // Stripe expects the amount in CENTS, so we multiply dollars by 100
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        // Stripe API requires all metadata values to be strings!
        // We use String() so that if a bug happens, the server won't crash
        metadata: {
            campaignId: String(campaignId),
            userId: String(userId),
        },
    });

    // 2. Save the donation in our DB as 'pending'
    // We save the 'id' from Stripe so we can confirm it later
    const query = `
          INSERT INTO donations (campaign_id, donor_id, amount, stripe_payment_intent_id, status)
          VALUES ($1, $2, $3, $4, 'pending')
          RETURNING *;
        `;
    const values = [campaignId, userId, amount, paymentIntent.id];
    await pool.query(query, values);

    // 3. Send the 'client_secret' to the frontend
    // The frontend uses this specific secret to open the credit card form securely
    res.status(201).json({
        clientSecret: paymentIntent.client_secret,
    });
});

export const confirmDonation = asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    // 1. Double-check with Stripe that it ACTUALLY succeeded
    // This prevents hackers from just calling this endpoint to fake money!
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment was not successful in Stripe" });
    }

    // 2. Transaction: Update Donation & Campaign at the same time
    // We delegate to a shared helper so the same logic is used here AND
    // in the webhook handler (see Gap 2 below). This eliminates code
    // duplication and ensures both paths behave identically.
    const result = await fulfillDonation(paymentIntentId);

    if (result.alreadyCompleted) {
        return res.status(200).json({ message: "Donation already confirmed" });
    }

    res.status(200).json({ message: "Donation confirmed and campaign updated!" });
});


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  SHARED FULFILLMENT HELPER                                               ║
// ║                                                                          ║
// ║  This function contains the core DB transaction that marks a donation    ║
// ║  as 'completed' and updates the campaign's current_amount. It's called   ║
// ║  from TWO places:                                                        ║
// ║    1. confirmDonation  — the fast path (frontend calls us after Stripe)  ║
// ║    2. stripeWebhook    — the safety net (Stripe calls us directly)       ║
// ║                                                                          ║
// ║  Both paths can safely call this function because it's IDEMPOTENT:       ║
// ║  if the donation is already 'completed', it returns early without        ║
// ║  double-counting the amount. The DB transaction (BEGIN/COMMIT) ensures   ║
// ║  the donation status update and campaign amount update are atomic.        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function fulfillDonation(paymentIntentId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the pending donation record
        const checkQuery = `SELECT status, amount, campaign_id FROM donations WHERE stripe_payment_intent_id = $1`;
        const { rows } = await client.query(checkQuery, [paymentIntentId]);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            // Return a special flag — the webhook might fire before our DB row exists
            // (race condition if Stripe is very fast). The webhook handler checks this.
            return { notFound: true };
        }

        // If it's already completed, do nothing (prevents double-counting if they refresh
        // OR if both the frontend confirm AND the webhook fire for the same payment)
        if (rows[0].status === 'completed') {
            await client.query('ROLLBACK');
            return { alreadyCompleted: true };
        }

        const amount = rows[0].amount;
        const campaignId = rows[0].campaign_id;

        // Mark donation as completed
        await client.query(
            `UPDATE donations SET status = 'completed', updated_at = CURRENT_TIMESTAMP
             WHERE stripe_payment_intent_id = $1`,
            [paymentIntentId]
        );

        // Add the money to the campaign's raised amount!
        // If the goal is reached, automatically mark the campaign status as 'completed'.
        await client.query(
            `UPDATE campaigns 
                 SET current_amount = current_amount + $1,
                     status = CASE 
                         WHEN current_amount + $1 >= goal_amount THEN 'completed' 
                         ELSE status 
                     END,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
            [amount, campaignId]
        );

        await client.query('COMMIT');
        console.log(`✅ Donation fulfilled: PaymentIntent ${paymentIntentId}, $${amount} → campaign ${campaignId}`);



        return { success: true };
    } catch (dbError) {
        await client.query('ROLLBACK');
        throw dbError;
    } finally {
        client.release();
    }
}


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  GAP 2 FIX — STRIPE WEBHOOK HANDLER (THE SAFETY NET)                    ║
// ║                                                                          ║
// ║  PROBLEM: Our current flow is 100% client-driven:                        ║
// ║    1. Frontend calls createDonationIntent → gets client_secret           ║
// ║    2. Frontend uses Stripe.js to charge the card                         ║
// ║    3. Frontend calls confirmDonation → we update our DB                  ║
// ║                                                                          ║
// ║  If the server crashes, the user closes their browser, or the network    ║
// ║  drops between steps 2 and 3, the user IS CHARGED by Stripe but our     ║
// ║  database never learns about it. The donation stays 'pending' forever.   ║
// ║                                                                          ║
// ║  FIX: Register a webhook with Stripe so that Stripe ITSELF tells our    ║
// ║  server when a payment succeeds. This way, even if the frontend never   ║
// ║  calls confirmDonation, Stripe's webhook will trigger the same           ║
// ║  fulfillDonation() logic as a backup.                                    ║
// ║                                                                          ║
// ║  IMPORTANT: The webhook receives the RAW request body (not parsed JSON) ║
// ║  because Stripe needs the raw bytes to verify the signature. That's why ║
// ║  the webhook route is mounted BEFORE express.json() in app.js.           ║
// ║                                                                          ║
// ║  HOW TO SET UP ON STRIPE'S SIDE:                                         ║
// ║    1. Go to https://dashboard.stripe.com/webhooks                        ║
// ║    2. Click "Add endpoint"                                               ║
// ║    3. URL: https://your-domain.com/webhooks/stripe                       ║
// ║    4. Select event: payment_intent.succeeded                             ║
// ║    5. Copy the "Signing secret" (starts with whsec_...)                  ║
// ║    6. Paste it in your .env as STRIPE_WEBHOOK_SECRET                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const stripeWebhook = async (req, res) => {
    // ── Step 1: Verify the request actually came from Stripe ──
    // Stripe signs every webhook request with a secret. We verify the
    // signature to make sure nobody is spoofing payment confirmations.
    // req.body here is a raw Buffer (NOT parsed JSON) because we use
    // express.raw() on this specific route.
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,                              // raw body (Buffer)
            signature,                             // from Stripe's headers
            process.env.STRIPE_WEBHOOK_SECRET      // our webhook signing secret
        );
    } catch (err) {
        // If verification fails, someone is tampering or the secret is wrong.
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // ── Step 2: Handle only the event we care about ──
    // Stripe can send dozens of event types (invoice.paid, charge.refunded, etc.)
    // We only care about payment_intent.succeeded — everything else is ignored.
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object; // the full PaymentIntent object
        console.log(`🔔 Webhook received: payment_intent.succeeded for ${paymentIntent.id}`);

        try {
            const result = await fulfillDonation(paymentIntent.id);

            if (result.notFound) {
                // This can happen if Stripe fires the webhook EXTREMELY fast,
                // before our createDonationIntent even saved the DB row.
                // It's rare but possible. We log it — the frontend's confirmDonation
                // call will pick it up moments later.
                console.warn(
                    `⚠️  Webhook: No donation row found for ${paymentIntent.id}. ` +
                    `The frontend confirm call will handle it.`
                );
            } else if (result.alreadyCompleted) {
                // The frontend's confirmDonation already fulfilled this donation.
                // This is the NORMAL happy path — webhook arrives after the frontend.
                console.log(`ℹ️  Webhook: Donation ${paymentIntent.id} was already confirmed by frontend.`);
            } else {
                // The webhook fulfilled it before the frontend could. This is the
                // SAFETY NET in action — the exact scenario this whole fix is for!
                console.log(`🛟  Webhook: Safety net activated! Fulfilled donation ${paymentIntent.id}`);
            }
        } catch (error) {
            // Log the error but still return 200 to Stripe.
            // If we return an error, Stripe will RETRY the webhook up to ~15 times
            // over 3 days, which could cause noise. It's better to log and investigate.
            console.error(`❌ Webhook: Error fulfilling donation ${paymentIntent.id}:`, error);
        }
    }

    // ── Step 3: Always acknowledge receipt ──
    // Stripe expects a 2xx response within 20 seconds. If we don't respond,
    // Stripe marks the endpoint as failing and retries the event.
    res.status(200).json({ received: true });
};


// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  GAP 3 FIX — STALE PENDING DONATION CLEANUP                             ║
// ║                                                                          ║
// ║  PROBLEM: When a user starts the donation flow but never completes it    ║
// ║  (closes the tab, their card is declined, they change their mind),       ║
// ║  a 'pending' donation row stays in our database forever. Over time,      ║
// ║  these orphaned rows pile up and make the donations table messy.         ║
// ║                                                                          ║
// ║  FIX: Provide a cleanup function that marks donations older than 1 hour ║
// ║  as 'expired'. Stripe PaymentIntents also expire after ~24 hours by      ║
// ║  default, so 1 hour is a safe window.                                    ║
// ║                                                                          ║
// ║  HOW TO USE: This can be called:                                         ║
// ║    • Via an admin-only API route (e.g. POST /payments/cleanup)           ║
// ║    • Via a cron job / scheduled task (e.g. every hour)                   ║
// ║    • Manually when you notice stale rows                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const cleanupStaleDonations = asyncHandler(async (req, res) => {
    // ── What this query does: ──
    // 1. Finds all donations that are still 'pending'
    // 2. AND were created more than 1 hour ago
    // 3. Marks them as 'expired' so they don't clutter future queries
    //
    // We use INTERVAL '1 hour' — Postgres's built-in time math.
    // The RETURNING clause gives us back the rows that were updated,
    // so we can log exactly what was cleaned up.
    const result = await pool.query(
        `UPDATE donations
         SET status = 'expired', updated_at = CURRENT_TIMESTAMP
         WHERE status = 'pending'
           AND created_at < NOW() - INTERVAL '1 hour'
         RETURNING id, stripe_payment_intent_id, campaign_id`
    );

    const expiredCount = result.rowCount;

    if (expiredCount > 0) {
        console.log(`🧹 Cleaned up ${expiredCount} stale pending donation(s):`);
        result.rows.forEach(row => {
            console.log(`   - Donation #${row.id} (Stripe: ${row.stripe_payment_intent_id}, Campaign: ${row.campaign_id})`);
        });

        // ── Optional: Cancel the Stripe PaymentIntents too ──
        // This releases any "held" funds on the user's card statement.
        // We do this in parallel with Promise.allSettled so one failure
        // doesn't block the others.
        const cancelResults = await Promise.allSettled(
            result.rows.map(row =>
                stripe.paymentIntents.cancel(row.stripe_payment_intent_id)
                    .catch(err => {
                        // Some intents may already be canceled or expired on Stripe's side
                        console.warn(`   ⚠️  Could not cancel Stripe intent ${row.stripe_payment_intent_id}: ${err.message}`);
                    })
            )
        );

        const canceledCount = cancelResults.filter(r => r.status === 'fulfilled').length;
        console.log(`   ✅ Canceled ${canceledCount}/${expiredCount} Stripe PaymentIntents`);
    } else {
        console.log(`🧹 No stale pending donations to clean up.`);
    }

    res.status(200).json({
        message: `Cleaned up ${expiredCount} stale pending donation(s)`,
        expiredCount,
    });
});
