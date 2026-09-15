import { Router } from 'express';
import BioTemplate from '../models/BioTemplate.js'; import { authenticate } from '../middleware/auth.middleware.js'; import { asyncHandler } from '../utils/asyncHandler.js'; import { AppError } from '../utils/AppError.js';
const router = Router();
router.get('/', asyncHandler(async (req,res)=>{ const templates=await BioTemplate.find({ $or:[{isSystem:true},{userId:req.user?.id}] }).sort({isSystem:-1,createdAt:-1}); res.json({success:true,data:{templates}}); }));
router.post('/', authenticate, asyncHandler(async (req,res)=>{ const {name,category,themeConfig,blocks=[]}=req.body; if(!name||!category||!themeConfig) throw AppError.unprocessable('name, category and themeConfig are required'); const template=await BioTemplate.create({name,category,themeConfig,blocks,userId:req.user!.id}); res.status(201).json({success:true,data:{template}}); }));
router.delete('/:id', authenticate, asyncHandler(async (req,res)=>{const result=await BioTemplate.deleteOne({_id:req.params.id,userId:req.user!.id,isSystem:false});if(!result.deletedCount)throw AppError.notFound('Template not found');res.status(204).send();}));
export const templatesRoutes=router;
