import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listConversations,listMessages,sendMessage } from '../services/conversationService.js'
const router=Router();router.use(requireAuth)
router.get('/',async(req,res,next)=>{try{res.json({data:await listConversations(req.auth.sub)})}catch(e){next(e)}})
router.get('/:id/messages',async(req,res,next)=>{try{res.json({data:await listMessages(req.auth.sub,req.params.id,req.query.before)})}catch(e){next(e)}})
router.post('/:id/messages',async(req,res,next)=>{try{res.status(201).json({data:await sendMessage(req.auth.sub,req.params.id,req.body)})}catch(e){next(e)}})
export default router
