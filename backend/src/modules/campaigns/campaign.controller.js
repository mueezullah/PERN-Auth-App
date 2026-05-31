const campaignService = require("./campaign.service");

const create = async (req, res) => {
  try {
    if (req.user.role !== 'fundraiser' && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Forbidden: Only verified fundraisers or admins can create campaigns",
        });
    }
    const result = await campaignService.createCampaign(req.user.id, req.body);
    res
      .status(result.status)
      .json({ success: result.success, data: result.data });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const listActive = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await campaignService.getActiveCampaigns(page, limit, status);
    if (!result.success) {
      return res
        .status(result.status)
        .json({ success: false, message: result.message });
    }
    res.status(result.status).json({ success: true, data: result.data });
  } catch (error) {
    console.error("List campaigns error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await campaignService.getCampaignById(req.params.id);
    if (!result.success) {
      return res
        .status(result.status)
        .json({ success: false, message: result.message });
    }
    res.status(result.status).json({ success: true, data: result.data });
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const result = await campaignService.deleteCampaign(
      req.params.id,
      req.user.id
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
      refunds: result.refunds
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  create,
  listActive,
  getOne,
  update,
  deleteCampaign
};
