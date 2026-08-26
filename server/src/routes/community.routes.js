import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listChannelMessages,listServers,proposeChannel,sendChannelMessage } from '../services/communityService.js'
const router=Router()
router.get('/servers',async(req,res,next)=>{try{res.json({data:await listServers()})}catch(error){next(error)}})
router.get('/channels/:id/messages',requireAuth,async(req,res,next)=>{try{res.json({data:await listChannelMessages(req.auth.sub,req.params.id)})}catch(error){next(error)}})
router.post('/channels/:id/messages',requireAuth,async(req,res,next)=>{try{res.status(201).json({data:await sendChannelMessage(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})
router.post('/servers/:id/channel-proposals',requireAuth,async(req,res,next)=>{try{res.status(201).json({data:await proposeChannel(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})
export default router
