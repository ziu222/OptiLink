import { Request, Response } from 'express';
import { campaignService } from '../services/campaign.service.js';
import type { ListCampaignsQuery } from '../validators/campaign.validator.js';

export class CampaignController {
  async createCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await campaignService.createCampaign(req.user!.id, req.body);
    res.status(201).json({ success: true, data: { campaign } });
  }

  async listCampaigns(req: Request, res: Response): Promise<void> {
    const data = await campaignService.listCampaigns(req.user!.id, req.query as unknown as ListCampaignsQuery);
    res.status(200).json({ success: true, data });
  }

  async getCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await campaignService.getCampaign(req.user!.id, req.params.id as string);
    res.status(200).json({ success: true, data: { campaign } });
  }

  async updateCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await campaignService.updateCampaign(req.user!.id, req.params.id as string, req.body);
    res.status(200).json({ success: true, data: { campaign } });
  }

  async deleteCampaign(req: Request, res: Response): Promise<void> {
    await campaignService.deleteCampaign(req.user!.id, req.params.id as string);
    res.status(204).send();
  }

  async addLink(req: Request, res: Response): Promise<void> {
    const campaign = await campaignService.addLink(req.user!.id, req.params.id as string, req.body.linkId);
    res.status(200).json({ success: true, data: { campaign } });
  }

  async removeLink(req: Request, res: Response): Promise<void> {
    await campaignService.removeLink(req.user!.id, req.params.id as string, req.params.linkId as string);
    res.status(204).send();
  }

  async createRule(req: Request, res: Response): Promise<void> {
    const rule = await campaignService.createRule(req.user!.id, req.params.id as string, req.body);
    res.status(201).json({ success: true, data: { rule } });
  }

  async updateRule(req: Request, res: Response): Promise<void> {
    const rule = await campaignService.updateRule(
      req.user!.id,
      req.params.id as string,
      req.params.ruleId as string,
      req.body,
    );
    res.status(200).json({ success: true, data: { rule } });
  }

  async deleteRule(req: Request, res: Response): Promise<void> {
    await campaignService.deleteRule(req.user!.id, req.params.id as string, req.params.ruleId as string);
    res.status(204).send();
  }
}

export const campaignController = new CampaignController();
