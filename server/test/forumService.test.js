import test from 'node:test';import assert from 'node:assert/strict';import { addComment,listComments,sendGift,validatePostInput } from '../src/services/forumService.js'
import { demoTopup,getWallet } from '../src/services/walletService.js'
test('chấp nhận bài diễn đàn đầy đủ',()=>assert.equal(validatePostInput({title:'Kinh nghiệm đăng ký môn AI',body:'Mình chia sẻ một số kinh nghiệm đã rút ra sau khi học môn này.',keywords:['AI']}).valid,true))
test('từ chối bài quá ngắn hoặc quá nhiều từ khóa',()=>{const result=validatePostInput({title:'Ngắn',body:'Ngắn',keywords:Array(9).fill('x')});assert.equal(result.valid,false);assert.ok(result.errors.keywords)})
test('bình luận diễn đàn được lưu và đọc lại',async()=>{const created=await addComment('forum-test-user','forum-home',{body:'Thông tin này rất hữu ích, cảm ơn bạn đã chia sẻ.'});const comments=await listComments('forum-home');assert.ok(comments.some(item=>item.id===created.id));assert.equal(created.display_name,'Bạn')})

test('tặng quà bài viết chuyển tiền cho tác giả sau khi trừ phí nền tảng',async()=>{
  const sender='gift-sender-a'
  await demoTopup(sender,20000)
  const result=await sendGift(sender,'forum-ai',10000)
  assert.equal(result.feeVnd,1000)
  assert.equal(result.payoutVnd,9000)
  assert.ok(result.giftCount>=1)
  const senderWallet=await getWallet(sender),authorWallet=await getWallet('demo-author-1')
  assert.equal(senderWallet.available_vnd,10000)
  assert.equal(authorWallet.available_vnd,9000)
  assert.equal(senderWallet.entries[0].entry_type,'post_gift_sent')
  assert.equal(authorWallet.entries[0].entry_type,'post_gift_received')
})

test('tặng quà khi số dư không đủ thì bị từ chối và không chuyển tiền',async()=>{
  const sender='gift-sender-broke'
  await demoTopup(sender,10000)
  await sendGift(sender,'forum-ai',10000)
  await assert.rejects(()=>sendGift(sender,'forum-ai',10000),err=>err.status===402&&err.code==='INSUFFICIENT_BALANCE')
  const wallet=await getWallet(sender)
  assert.equal(wallet.available_vnd,0)
})

test('không thể tự tặng quà cho bài của mình',async()=>{
  await demoTopup('demo-author-2',10000)
  await assert.rejects(()=>sendGift('demo-author-2','forum-home',10000),err=>err.status===409)
})

test('từ chối mức quà không nằm trong danh sách cho phép',async()=>{
  await demoTopup('gift-sender-b',20000)
  await assert.rejects(()=>sendGift('gift-sender-b','forum-ai',5000),err=>err.status===422&&err.code==='INVALID_GIFT_TIER')
})

test('tặng quà cho bài không tồn tại trả về 404',async()=>{
  await demoTopup('gift-sender-c',20000)
  await assert.rejects(()=>sendGift('gift-sender-c','khong-co-bai-nay',10000),err=>err.status===404)
})
