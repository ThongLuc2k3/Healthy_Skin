import test from 'node:test'
import assert from 'node:assert/strict'
import { acceptRequest,createRequest } from '../src/services/requestService.js'
import { listConversations,sendMessage } from '../src/services/conversationService.js'
import { completeSession,reviewSession } from '../src/services/sessionService.js'
import { demoTopup,getWallet,payRemaining } from '../src/services/walletService.js'

test('E2E yêu cầu trả phí: đăng → ghép → chat → thanh toán → hoàn tất → đánh giá',async()=>{
  const author='e2e-author',receiver='e2e-receiver'
  await demoTopup(author,100000)
  const request=await createRequest(author,{kind:'paid',title:'Cần trao đổi kinh nghiệm môn kiểm thử',description:'Mình cần trao đổi kỹ về cách chuẩn bị và ôn tập môn kiểm thử phần mềm.',amountVnd:50000,durationMinutes:30,deliveryMode:'online',startsAt:new Date(Date.now()+3600000).toISOString()})
  const accepted=await acceptRequest(request.id,receiver)
  assert.equal(accepted.mode,'instant')
  await payRemaining(author,request.id)
  const rooms=await listConversations(receiver)
  const room=rooms.find(x=>x.request_id===request.id)
  assert.ok(room)
  const message=await sendMessage(receiver,room.id,{kind:'text',body:'Chào bạn, mình đã sẵn sàng trao đổi.'})
  assert.equal(message.body,'Chào bạn, mình đã sẵn sàng trao đổi.')
  await completeSession(author,request.id)
  const review=await reviewSession(receiver,request.id,{rating:5,comment:'Trao đổi rõ ràng và đúng hẹn.'})
  assert.equal(review.rating,5)
  const receiverWallet=await getWallet(receiver)
  assert.equal(receiverWallet.available_vnd,49500)
})
