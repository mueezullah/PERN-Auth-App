import * as campaignService from "./campaign.service.js";

// Central wrapper to pipe unexpected exceptions straight to your errorHandler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const create = asyncHandler(async (req, res) => {
  if (req.user.role !== "fundraiser" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "Forbidden: Only verified fundraisers or admins can create campaigns",
    });
  }
  const result = await campaignService.createCampaign(req.user.id, req.body);
  res
    .status(result.status)
    .json({ success: result.success, data: result.data });
});

export const listActive = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await campaignService.getActiveCampaigns(page, limit, status);
  if (!result.success) {
    return res
      .status(result.status)
      .json({ success: false, message: result.message });
  }
  res.status(result.status).json({ success: true, data: result.data });
});

export const getOne = asyncHandler(async (req, res) => {
  const result = await campaignService.getCampaignById(req.params.id);
  if (!result.success) {
    return res
      .status(result.status)
      .json({ success: false, message: result.message });
  }
  res.status(result.status).json({ success: true, data: result.data });
});

export const getUserCampaigns = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const result = await campaignService.getUserCampaigns(
    userId,
    req.query.page,
    req.query.limit,
  );
  if (!result.success) {
    return res
      .status(result.status)
      .json({ success: false, message: result.message });
  }
  res.status(result.status).json({ success: true, data: result.data });
});

export const update = asyncHandler(async (req, res) => {
  const result = await campaignService.updateCampaign(
    req.params.id,
    req.user.id,
    req.body,
  );
  if (!result.success) {
    return res
      .status(result.status)
      .json({ success: false, message: result.message });
  }
  res.status(result.status).json({ success: true, data: result.data });
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  const result = await campaignService.deleteCampaign(
    req.params.id,
    req.user.id,
  );
  if (!result.success) {
    return res
      .status(result.status)
      .json({ success: false, message: result.message });
  }
  res.status(result.status).json({
    success: true,
    message: "Campaign deleted successfully",
    data: result.data,
    refunds: result.refunds,
  });
});
