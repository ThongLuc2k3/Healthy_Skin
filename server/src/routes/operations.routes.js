import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireModerator } from '../middleware/admin.js'
import { createReport,decideModeration,decideVerification,listOperationsQueue,resolveReport,submitVerification } from '../services/operationsService.js'
const router=Router();router.use(requireAuth)
router.post('/reports',async(req,res,next)=>{try{res.status(201).json({data:await createReport(req.auth.sub,req.body)})}catch(error){next(error)}})
router.post('/verifications',async(req,res,next)=>{try{res.status(201).json({data:await submitVerification(req.auth.sub,req.body)})}catch(error){next(error)}})
router.get('/admin/queue',requireModerator,async(req,res,next)=>{try{res.json({data:await listOperationsQueue()})}catch(error){next(error)}})
router.post('/admin/verifications/:id',requireModerator,async(req,res,next)=>{try{res.json({data:await decideVerification(req.auth.sub,req.params.id,req.body.decision,req.body.note)})}catch(error){next(error)}})
router.post('/admin/reports/:id',requireModerator,async(req,res,next)=>{try{res.json({data:await resolveReport(req.params.id,req.body.status)})}catch(error){next(error)}})
router.post('/admin/moderation/:id',requireModerator,async(req,res,next)=>{try{res.json({data:await decideModeration(req.auth.sub,req.params.id,req.body.decision,req.body.note)})}catch(error){next(error)}})
export default router
