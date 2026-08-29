import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { askAssistant,planAgent,runSearch,summarizeSearchResults } from '../services/assistantService.js'
import { requireAuth } from '../middleware/auth.js'
import { getUser,updateBasicProfile } from '../services/authService.js'
import { createRequest } from '../services/requestService.js'
import { createSharingPostChecked } from '../services/sharingService.js'
import { demoTopup,demoWithdraw } from '../services/walletService.js'

const router = Router()
const aiLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'AI_RATE_LIMITED', message: 'Bạn đang thao tác với trợ lý AI quá nhanh. Vui lòng thử lại sau ít phút.' } } })

router.post('/chat', aiLimiter, async (req, res, next) => {
  try { res.json({ data: { answer: await askAssistant(req.body.message, req.body.history) } }) }
  catch (error) { next(error) }
})
router.post('/agent',aiLimiter,requireAuth,async(req,res,next)=>{
  try{
    const user=await getUser(req.auth.sub)
    const context={user:{displayName:user.display_name,areaLabel:user.area_label,defaultUniversityId:user.default_university_id,memberships:user.memberships||[]},now:new Date().toISOString(),timezone:'Asia/Ho_Chi_Minh'}
    const plan=await planAgent(req.body.message,req.body.history,context)
    if(plan.action?.type==='search'){
      const {target,q}=plan.action.payload||{}
      const results=await runSearch(target,q,{universityId:user.default_university_id,userId:req.auth.sub})
      const reply=await summarizeSearchResults(req.body.message,req.body.history,context,target,results)
      return res.json({data:{reply,action:null}})
    }
    res.json({data:plan})
  }catch(error){next(error)}
})
router.post('/actions/execute',requireAuth,async(req,res,next)=>{
  try{
    const action=req.body.action
    const allowed=['create_request','update_profile','create_sharing_post','wallet_topup','wallet_withdraw']
    if(!action||!allowed.includes(action.type))throw Object.assign(new Error('Hành động Agent không được hỗ trợ.'),{status:422})
    let result
    if(action.type==='create_request')result=await createRequest(req.auth.sub,action.payload)
    else if(action.type==='update_profile')result=await updateBasicProfile(req.auth.sub,action.payload)
    else if(action.type==='create_sharing_post')result=await createSharingPostChecked(req.auth.sub,action.payload)
    else if(action.type==='wallet_topup')result=await demoTopup(req.auth.sub,Number(action.payload?.amountVnd))
    else result=await demoWithdraw(req.auth.sub,Number(action.payload?.amountVnd))
    res.json({data:{type:action.type,result}})
  }catch(error){next(error)}
})
export default router
