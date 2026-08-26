import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { blockUser,listChatRequests,listPeople,requestChat,respondChatRequest } from '../services/socialService.js'
import { notify } from '../services/notificationService.js'
const router=Router();router.use(requireAuth)
router.get('/people',async(req,res,next)=>{try{res.json({data:await listPeople(req.auth.sub,req.query)})}catch(error){next(error)}})
router.get('/chat-requests',async(req,res,next)=>{try{res.json({data:await listChatRequests(req.auth.sub)})}catch(error){next(error)}})
router.post('/people/:id/chat-request',async(req,res,next)=>{try{const data=await requestChat(req.auth.sub,req.params.id,req.body.introMessage);await notify(req.params.id,{kind:'chat_request',title:'Bạn có lời mời trò chuyện mới',body:req.body.introMessage,actionUrl:'/peers'});res.status(201).json({data})}catch(error){next(error)}})
router.post('/chat-requests/:id/respond',async(req,res,next)=>{try{const data=await respondChatRequest(req.auth.sub,req.params.id,req.body.decision);await notify(data.request.sender_id,{kind:'chat_request_response',title:req.body.decision==='accepted'?'Lời mời trò chuyện đã được chấp nhận':'Lời mời trò chuyện đã bị từ chối',body:req.body.decision==='accepted'?'Phòng chat riêng đã sẵn sàng.':'Bạn có thể tiếp tục tương tác qua nội dung công khai.',actionUrl:req.body.decision==='accepted'?'/tin-nhan':'/peers'});res.json({data})}catch(error){next(error)}})
router.post('/people/:id/block',async(req,res,next)=>{try{res.json(await blockUser(req.auth.sub,req.params.id))}catch(error){next(error)}})
export default router
