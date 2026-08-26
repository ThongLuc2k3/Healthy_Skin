import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listNotifications,readNotification } from '../services/notificationService.js'
import { savePushSubscription } from '../services/deliveryService.js'
const router=Router();router.use(requireAuth)
router.get('/',async(req,res,next)=>{try{res.json({data:await listNotifications(req.auth.sub)})}catch(error){next(error)}})
router.post('/:id/read',async(req,res,next)=>{try{res.json({data:await readNotification(req.auth.sub,req.params.id)})}catch(error){next(error)}})
router.post('/push-subscriptions',async(req,res,next)=>{try{res.status(201).json({data:await savePushSubscription(req.auth.sub,req.body)})}catch(error){next(error)}})
export default router
