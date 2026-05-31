const Campaign = require('./campaign.model');
const { getPaginationData, parsePaginationParams } = require('../../utils/pagination');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../../config/db");

const createCampaign = async (userId, data) => {
  const { title, description, goal_amount, deadline, media_url } = data;
  const newCampaign = await Campaign.create(userId, title, description, goal_amount, deadline, media_url);
  return { success: true, status: 201, data: newCampaign };
};

const getActiveCampaigns = async (queryPage, queryLimit, status) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  // Update expired campaigns to 'ended' status before fetching
  await Campaign.updateExpiredCampaigns();

  const offset = (page - 1) * limit;
  const { campaigns, total } = await Campaign.findAllActive(limit, offset, status);
  
  return { 
    success: true, 
    status: 200, 
    data: {
      campaigns,
      pagination: getPaginationData(total, page, limit)
    }
  };
};

const getCampaignById = async (id) => {
  // Update expired campaigns before fetching
  await Campaign.updateExpiredCampaigns();
  
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    return { success: false, status: 404, message: "Campaign not found" };
  }
  return { success: true, status: 200, data: campaign };
};

const updateCampaign = async (id, userId, data) => {
  const campaign = await Campaign.findById(id);
  
  if (!campaign) {
    return { success: false, status: 404, message: "Campaign not found" };
  }
  
  if (campaign.user_id !== userId) {
    return { success: false, status: 403, message: "Forbidden: You do not own this campaign" };
  }
  
  const { title, description, goal_amount, deadline, media_url } = data;
  const updatedCampaign = await Campaign.update(id, title, description, goal_amount, deadline, media_url);
  
  return { success: true, status: 200, data: updatedCampaign };
};

const deleteCampaign = async (id, userId) => {
  const campaign = await Campaign.findById(id);
  
  if (!campaign) {
    return { success: false, status: 404, message: "Campaign not found" };
  }
  
  if (campaign.user_id !== userId) {
    return { success: false, status: 403, message: "Forbidden: You do not own this campaign" };
  }

  // --- Refund all completed donations for this campaign ---
  const donationsResult = await pool.query(
    `SELECT id, stripe_payment_intent_id, amount, donor_id 
     FROM donations 
     WHERE campaign_id = $1 AND status = 'completed'`,
    [id]
  );

  const donations = donationsResult.rows;
  const refundResults = { refunded: 0, failed: 0, totalRefunded: 0, details: [] };

  for (const donation of donations) {
    try {
      // Issue a full refund through Stripe
      await stripe.refunds.create({
        payment_intent: donation.stripe_payment_intent_id,
      });

      // Mark donation as refunded in our database
      await pool.query(
        `UPDATE donations SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [donation.id]
      );

      refundResults.refunded += 1;
      refundResults.totalRefunded += parseFloat(donation.amount);
      refundResults.details.push({
        donation_id: donation.id,
        donor_id: donation.donor_id,
        amount: donation.amount,
        status: 'refunded'
      });
    } catch (refundError) {
      console.error(`Failed to refund donation ${donation.id}:`, refundError.message);
      refundResults.failed += 1;
      refundResults.details.push({
        donation_id: donation.id,
        donor_id: donation.donor_id,
        amount: donation.amount,
        status: 'refund_failed',
        error: refundError.message
      });
    }
  }

  // Soft-delete the campaign (sets status='deleted', current_amount=0)
  const deletedCampaign = await Campaign.deleteCampaign(id);
  
  return { 
    success: true, 
    status: 200, 
    data: deletedCampaign,
    refunds: refundResults
  };
};

module.exports = { 
  createCampaign, 
  getActiveCampaigns, 
  getCampaignById, 
  updateCampaign, 
  deleteCampaign 
};
