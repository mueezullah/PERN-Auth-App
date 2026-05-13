const Campaign = require('./campaign.model');
const { getPaginationData, parsePaginationParams } = require('../../utils/pagination'); 

const createCampaign = async (userId, data) => {
  const { title, description, goal_amount, deadline, media_url } = data;
  const newCampaign = await Campaign.create(userId, title, description, goal_amount, deadline, media_url);
  return { success: true, status: 201, data: newCampaign };
};

const getActiveCampaigns = async (queryPage, queryLimit) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  // Update expired campaigns to 'ended' status before fetching
  await Campaign.updateExpiredCampaigns();

  const offset = (page - 1) * limit;
  const { campaigns, total } = await Campaign.findAllActive(limit, offset);
  
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

module.exports = { createCampaign, getActiveCampaigns, getCampaignById, updateCampaign };
