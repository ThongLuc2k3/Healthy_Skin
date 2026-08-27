import { Router } from 'express'
import { askAssistant,planAgent } from '../services/assistantService.js'
import { requireAuth } from '../middleware/auth.js'
import { getUser,updateBasicProfile } from '../services/authService.js'
import { createRequest } from '../services/requestService.js'

const router = Router()
router.post('/chat', async (req, res, next) => {
  try { res.json({ data: { answer: await askAssistant(req.body.message, req.body.history) } }) }
  catch (error) { next(error) }
})
router.post('/agent',requireAuth,async(req,res,next)=>{try{const user=await getUser(req.auth.sub);res.json({data:await planAgent(req.body.message,req.body.history,{user:{displayName:user.display_name,areaLabel:user.area_label,defaultUniversityId:user.default_university_id,memberships:user.memberships||[]},now:new Date().toISOString(),timezone:'Asia/Ho_Chi_Minh'})})}catch(error){next(error)}})
router.post('/actions/execute',requireAuth,async(req,res,next)=>{try{const action=req.body.action;if(!action||!['create_request','update_profile'].includes(action.type))throw Object.assign(new Error('Hành động Agent không được hỗ trợ.'),{status:422});let result;if(action.type==='create_request')result=await createRequest(req.auth.sub,action.payload);else result=await updateBasicProfile(req.auth.sub,action.payload);res.json({data:{type:action.type,result}})}catch(error){next(error)}})
export default router
