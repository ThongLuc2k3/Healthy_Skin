import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { checkIn,completeSession,listMySessions,openRequestDispute,reportNoShow,reviewSession } from '../services/sessionService.js'
const router=Router();router.use(requireAuth)
router.get('/',async(req,res,next)=>{try{res.json({data:await listMySessions(req.auth.sub)})}catch(error){next(error)}})
router.post('/:id/attendance',async(req,res,next)=>{try{res.status(201).json({data:await checkIn(req.auth.sub,req.params.id,req.body.eventType,req.body.note)})}catch(error){next(error)}})
router.post('/:id/complete',async(req,res,next)=>{try{res.json({data:await completeSession(req.auth.sub,req.params.id)})}catch(error){next(error)}})
router.post('/:id/reviews',async(req,res,next)=>{try{res.status(201).json({data:await reviewSession(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})
router.post('/:id/no-show',async(req,res,next)=>{try{res.json({data:await reportNoShow(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})
router.post('/:id/disputes',async(req,res,next)=>{try{res.status(201).json({data:await openRequestDispute(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})
export default router
