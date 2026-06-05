import pool from "../../config/db.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the pending donation record
        const checkQuery = `SELECT status, amount, campaign_id FROM donations WHERE stripe_payment_intent_id = $1`;
        const { rows } = await client.query(checkQuery, [paymentIntentId]);

        if (rows.length === 0) throw new Error("Donation record not found in database");

        // If it's already completed, do nothing (prevents double-counting if they refresh)
        if (rows[0].status === 'completed') {
            await client.query('ROLLBACK');
            return res.status(200).json({ message: "Donation already confirmed" });
        }

        const amount = rows[0].amount;
        const campaignId = rows[0].campaign_id;

        // Mark donation as completed
        await client.query(
            `UPDATE donations SET status = 'completed' WHERE stripe_payment_intent_id = $1`,
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
        res.status(200).json({ message: "Donation confirmed and campaign updated!" });
    } catch (dbError) {
        await client.query('ROLLBACK');
        throw dbError;
    } finally {
        client.release();
    }
});
