import { Router } from 'express';
import TrackingPreset from '../models/TrackingPreset.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();
router.use(authenticate);

const buildUrl = (url: string, fields: Record<string, string>) => {
  const target = new URL(url);
  Object.entries(fields).forEach(([key, value]) => { if (value) target.searchParams.set(`utm_${key}`, value); });
  return target.toString();
};

router.post('/build', asyncHandler(async (req, res) => {
  const { url, source, medium, campaign = '', term = '', content = '' } = req.body;
  if (!url || !source || !medium) throw AppError.unprocessable('url, source and medium are required');
  res.json({ success: true, data: { url: buildUrl(url, { source, medium, campaign, term, content }) } });
}));
router.get('/presets', asyncHandler(async (req, res) => {
  const presets = await TrackingPreset.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { presets } });
}));
router.post('/presets', asyncHandler(async (req, res) => {
  const { name, source, medium, campaign = '', term = '', content = '' } = req.body;
  if (!name || !source || !medium) throw AppError.unprocessable('name, source and medium are required');
  const preset = await TrackingPreset.create({ userId: req.user!.id, name, source, medium, campaign, term, content });
  res.status(201).json({ success: true, data: { preset } });
}));
router.delete('/presets/:id', asyncHandler(async (req, res) => {
  const result = await TrackingPreset.deleteOne({ _id: req.params.id, userId: req.user!.id });
  if (!result.deletedCount) throw AppError.notFound('Tracking preset not found');
  res.status(204).send();
}));
export const trackingRoutes = router;
