import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  confirmSharingAccess,
  cancelSharingParticipation,
  cancelSharingPost,
  createSharingPostChecked,
  joinSharingPost,
  listSharingPosts,
  openSharingDispute,
  reviewSharing,
} from '../services/sharingService.js'
import { waitForPaymentSimulation } from '../services/paymentSimulation.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    res.json({ data: await listSharingPosts(req.query) })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    res.status(201).json({ data: await createSharingPostChecked(req.auth.sub, req.body) })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    await waitForPaymentSimulation()
    res.json({ data: await joinSharingPost(req.auth.sub, req.params.id), simulation:true })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/confirm', requireAuth, async (req, res, next) => {
  try {
    res.json({ data: await confirmSharingAccess(req.auth.sub, req.params.id) })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/disputes', requireAuth, async (req, res, next) => {
  try {
    res.status(201).json({ data: await openSharingDispute(req.auth.sub, req.params.id, req.body) })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/cancel-participation',requireAuth,async(req,res,next)=>{try{res.json({data:await cancelSharingParticipation(req.auth.sub,req.params.id)})}catch(error){next(error)}})
router.post('/:id/cancel-post',requireAuth,async(req,res,next)=>{try{res.json({data:await cancelSharingPost(req.auth.sub,req.params.id,req.body.reason)})}catch(error){next(error)}})
router.post('/:id/reviews',requireAuth,async(req,res,next)=>{try{res.status(201).json({data:await reviewSharing(req.auth.sub,req.params.id,req.body)})}catch(error){next(error)}})

export default router
