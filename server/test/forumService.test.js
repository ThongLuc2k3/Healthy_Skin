import test from 'node:test';import assert from 'node:assert/strict';import { addComment,listComments,reactComment,sendCommentGift,sendGift,validatePostInput } from '../src/services/forumService.js'
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

test('trả lời bình luận được lưu kèm parent_id và đọc lại được',async()=>{
  const root=await addComment('cmt-root-user','forum-home',{body:'Câu hỏi hay, mình cũng đang thắc mắc chỗ này.'})
  const reply=await addComment('cmt-reply-user','forum-home',{body:'Mình từng gặp, để mình chia sẻ cách xử lý.',parentId:root.id})
  assert.equal(reply.parent_id,root.id)
  const list=await listComments('forum-home')
  assert.ok(list.some(item=>item.id===reply.id&&item.parent_id===root.id))
})

test('trả lời vào bình luận không thuộc bài thì báo 404',async()=>{
  await assert.rejects(()=>addComment('cmt-x-user','forum-ai',{body:'Trả lời nhầm bài.',parentId:'khong-ton-tai'}),err=>err.status===404)
})

test('thả tym bình luận bật/tắt và cập nhật số đếm',async()=>{
  const c=await addComment('cmt-like-author','forum-home',{body:'Nội dung này rất đáng lưu lại.'})
  const on=await reactComment('cmt-liker',c.id)
  assert.equal(on.active,true)
  let list=await listComments('forum-home')
  assert.equal(list.find(item=>item.id===c.id).reaction_count,1)
  const off=await reactComment('cmt-liker',c.id)
  assert.equal(off.active,false)
  list=await listComments('forum-home')
  assert.equal(list.find(item=>item.id===c.id).reaction_count,0)
})

test('tặng quà bình luận chuyển tiền cho tác giả bình luận sau phí',async()=>{
  const author='cmt-gift-author',sender='cmt-gift-sender'
  const c=await addComment(author,'forum-home',{body:'Cảm ơn mọi người, mình tổng hợp lại bên dưới.'})
  await demoTopup(sender,20000)
  const result=await sendCommentGift(sender,c.id,10000)
  assert.equal(result.feeVnd,1000)
  assert.equal(result.payoutVnd,9000)
  const senderWallet=await getWallet(sender),authorWallet=await getWallet(author)
  assert.equal(senderWallet.available_vnd,10000)
  assert.equal(authorWallet.available_vnd,9000)
  const list=await listComments('forum-home')
  assert.equal(list.find(item=>item.id===c.id).gift_total_vnd,10000)
})

test('không thể tự tặng quà cho bình luận của mình',async()=>{
  const me='cmt-self-gift'
  const c=await addComment(me,'forum-home',{body:'Bình luận của chính mình để kiểm thử.'})
  await demoTopup(me,20000)
  await assert.rejects(()=>sendCommentGift(me,c.id,10000),err=>err.status===409)
})
