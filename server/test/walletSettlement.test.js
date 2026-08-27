import test from 'node:test'
import assert from 'node:assert/strict'
import { attachPayee,demoTopup,demoWithdraw,getWallet,holdPaidRequest,holdSharingAccess,payRemaining,refundSharingAccess,settleRequestNoShow } from '../src/services/walletService.js'

test('rút tiền mô phỏng trừ số dư và ghi sổ cái',async()=>{
  const user='demo-withdraw-user';await demoTopup(user,200000);await demoWithdraw(user,50000);const wallet=await getWallet(user)
  assert.equal(wallet.available_vnd,150000);assert.equal(wallet.entries[0].entry_type,'demo_withdraw')
})

test('người nhận vắng mặt thì hoàn đủ tiền đã giữ cho người đăng',async()=>{
  const payer='no-show-payer',payee='no-show-receiver',requestId='no-show-request'
  await demoTopup(payer,100000)
  await holdPaidRequest({userId:payer,requestId,grossVnd:50000,depositVnd:5000})
  await attachPayee(requestId,payee)
  await payRemaining(payer,requestId)
  const result=await settleRequestNoShow(requestId,payer,'receiver')
  const wallet=await getWallet(payer)
  assert.equal(result.status,'refunded')
  assert.equal(wallet.available_vnd,100000)
  assert.equal(wallet.pending_vnd,0)
})

test('người đăng vắng mặt thì chia đôi và trừ phí 1% phần bồi thường',async()=>{
  const payer='absent-author',payee='waiting-receiver',requestId='author-no-show-request'
  await demoTopup(payer,100000)
  await holdPaidRequest({userId:payer,requestId,grossVnd:50000,depositVnd:5000})
  await attachPayee(requestId,payee)
  await payRemaining(payer,requestId)
  const result=await settleRequestNoShow(requestId,payee,'author')
  const payerWallet=await getWallet(payer),payeeWallet=await getWallet(payee)
  assert.equal(result.status,'partially_refunded')
  assert.equal(payerWallet.available_vnd,75000)
  assert.equal(payeeWallet.available_vnd,24750)
})

test('hủy vé sau hạn hoàn 50% và chuyển 50% còn lại sau phí',async()=>{
  const buyer='late-sharing-buyer',host='late-sharing-host',postId='late-sharing-post'
  await demoTopup(buyer,20000)
  await holdSharingAccess({buyerId:buyer,hostId:host,sharingPostId:postId,amountVnd:20000})
  const result=await refundSharingAccess(postId,buyer,.5)
  const buyerWallet=await getWallet(buyer),hostWallet=await getWallet(host)
  assert.equal(result.refunded_vnd,10000)
  assert.equal(buyerWallet.available_vnd,10000)
  assert.equal(hostWallet.available_vnd,9900)
})
