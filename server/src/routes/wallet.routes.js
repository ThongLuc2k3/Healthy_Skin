import { Router } from 'express'
import { env } from '../config/env.js'
import { requireAuth } from '../middleware/auth.js'
import { demoTopup,getWallet,payRemaining,releaseTransaction } from '../services/walletService.js'
import { waitForPaymentSimulation } from '../services/paymentSimulation.js'
const router=Router();router.use(requireAuth)
router.get('/',async(req,res,next)=>{try{res.json({data:await getWallet(req.auth.sub)})}catch(e){next(e)}})
router.post('/demo-topup',async(req,res,next)=>{try{if(env.nodeEnv==='production')return res.status(404).end();await waitForPaymentSimulation();res.json({data:await demoTopup(req.auth.sub,Number(req.body.amountVnd)),simulation:true})}catch(e){next(e)}})
router.post('/requests/:id/pay',async(req,res,next)=>{try{await waitForPaymentSimulation();res.json({data:await payRemaining(req.auth.sub,req.params.id),simulation:true})}catch(e){next(e)}})
router.post('/requests/:id/release',async(req,res,next)=>{try{res.json({data:await releaseTransaction(req.params.id,req.auth.sub)})}catch(e){next(e)}})
export default router
