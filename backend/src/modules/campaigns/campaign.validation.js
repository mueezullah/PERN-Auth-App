import Joi from "joi";

const createCampaignSchema = Joi.object({
  title: Joi.string().min(4).max(255).required(),
  description: Joi.string().min(10).required(),
  goal_amount: Joi.number().positive().precision(2).required(),
  deadline: Joi.date().iso().greater('now').required(),
  media_url: Joi.string().uri().optional().allow(null, '')
});

const updateCampaignSchema = Joi.object({
  title: Joi.string().min(5).max(255).optional(),
  description: Joi.string().min(20).optional(),
  goal_amount: Joi.number().positive().precision(2).optional(),
  deadline: Joi.date().iso().greater('now').optional(),
  media_url: Joi.string().uri().optional().allow(null, '')
}).min(1);

export const validateCreate = (req, res, next) => {
  const { error } = createCampaignSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

export const validateUpdate = (req, res, next) => {
  const { error } = updateCampaignSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};
