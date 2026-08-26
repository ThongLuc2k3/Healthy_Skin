import test from 'node:test';import assert from 'node:assert/strict';import { confirmSharingAccess,createSharingPost,joinSharingPost,openSharingDispute,validateSharingInput } from '../src/services/sharingService.js'
import { demoTopup,getWallet } from '../src/services/walletService.js'
const paid={format:'instant_unlock',title:'Bộ ghi chú ôn thi môn AI',description:'Tài liệu tổng hợp kiến thức và checklist ôn tập cuối kỳ.',deliverables:'PDF và checklist',contentFormat:'PDF',contentExtent:'18 trang',refundTerms:'Hoàn khi sai mô tả',accessPriceVnd:10000}
test('chấp nhận bài mở khóa trả phí đủ mô tả',()=>assert.equal(validateSharingInput(paid).valid,true))
test('từ chối bài trả phí thiếu thông tin xem trước',()=>assert.ok(validateSharingInput({...paid,deliverables:''}).errors.preview))
test('buổi trao đổi kiểm tra sức chứa tối thiểu',()=>assert.ok(validateSharingInput({...paid,format:'scheduled_exchange',startsAt:new Date().toISOString(),capacity:2,minimumParticipants:3}).errors.minimumParticipants))

test('người mua xác nhận thì giải ngân sau phí 1%',async()=>{
  const hostId='sharing-host-confirm'
  const buyerId='sharing-buyer-confirm'
  await demoTopup(buyerId,10000)
  const post=await createSharingPost(hostId,paid)
  await joinSharingPost(buyerId,post.id)
  const member=await confirmSharingAccess(buyerId,post.id)
  const hostWallet=await getWallet(hostId)
  assert.equal(member.status,'completed')
  assert.equal(hostWallet.available_vnd,9900)
})

test('báo sai mô tả đóng băng tiền thay vì giải ngân',async()=>{
  const hostId='sharing-host-dispute'
  const buyerId='sharing-buyer-dispute'
  await demoTopup(buyerId,10000)
  const post=await createSharingPost(hostId,paid)
  await joinSharingPost(buyerId,post.id)
  const dispute=await openSharingDispute(buyerId,post.id,{reason:'not_as_described',description:'Tài liệu nhận được không giống phần mô tả.'})
  const hostWallet=await getWallet(hostId)
  assert.equal(dispute.status,'open')
  assert.equal(hostWallet.available_vnd,0)
})
