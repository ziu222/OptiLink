import { Router } from 'express';
import axios from 'axios';
import Link from '../models/Link.js';
import LinkHealthCheck from '../models/LinkHealthCheck.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
const router = Router();
router.use(authenticate);
router.post('/links/:linkId/check', asyncHandler(async (req, res) => {
  const link = await Link.findOne({ _id: req.params.linkId, userId: req.user!.id, isArchived: { $ne: true } });
  if (!link) throw AppError.notFound('Link not found');
  const started = Date.now(); let statusCode: number | null = null; let error = '';
  try { statusCode = (await axios.head(link.originalUrl, { timeout: 8000, maxRedirects: 5, validateStatus: () => true })).status; } catch (err) { error = err instanceof Error ? err.message : 'Health check failed'; }
  const status = error || !statusCode || statusCode >= 500 ? 'critical' : statusCode >= 400 ? 'warning' : 'healthy';
  const check = await LinkHealthCheck.create({ linkId: link._id, status, statusCode, responseMs: Date.now() - started, error });
  res.status(201).json({ success: true, data: { check } });
}));
router.get('/links/:linkId', asyncHandler(async (req, res) => {
  const link = await Link.findOne({ _id: req.params.linkId, userId: req.user!.id }); if (!link) throw AppError.notFound('Link not found');
  const checks = await LinkHealthCheck.find({ linkId: link._id }).sort({ createdAt: -1 }).limit(30); res.json({ success: true, data: { checks } });
}));
export const healthRoutes = router;
