import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addCampaignLinkSchema,
  createCampaignRuleSchema,
  createCampaignSchema,
  listCampaignsQuerySchema,
  updateCampaignRuleSchema,
  updateCampaignSchema,
} from '../validators/campaign.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCampaignSchema), asyncHandler(campaignController.createCampaign));
router.get('/', validate(listCampaignsQuerySchema, 'query'), asyncHandler(campaignController.listCampaigns));
router.get('/:id', asyncHandler(campaignController.getCampaign));
router.patch('/:id', validate(updateCampaignSchema), asyncHandler(campaignController.updateCampaign));
router.delete('/:id', asyncHandler(campaignController.deleteCampaign));

router.post('/:id/links', validate(addCampaignLinkSchema), asyncHandler(campaignController.addLink));
router.delete('/:id/links/:linkId', asyncHandler(campaignController.removeLink));

router.post('/:id/rules', validate(createCampaignRuleSchema), asyncHandler(campaignController.createRule));
router.patch('/:id/rules/:ruleId', validate(updateCampaignRuleSchema), asyncHandler(campaignController.updateRule));
router.delete('/:id/rules/:ruleId', asyncHandler(campaignController.deleteRule));

export const campaignRoutes = router;
