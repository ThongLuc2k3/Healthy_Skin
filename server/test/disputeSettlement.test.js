import test from 'node:test'
import assert from 'node:assert/strict'
import { settleDisputeAmounts } from '../src/config/policies.js'

test('hoàn tiền: trả toàn bộ phần đang giữ cho người mua, không thu phí', () => {
  assert.deepEqual(settleDisputeAmounts(50000, 'refund'), {
    transactionStatus: 'refunded', feeVnd: 0, payerRefundVnd: 50000, payeePayoutVnd: 0,
  })
})

test('giải ngân: trả cho người bán sau khi trừ phí nền tảng 1%', () => {
  assert.deepEqual(settleDisputeAmounts(50000, 'release'), {
    transactionStatus: 'released', feeVnd: 500, payerRefundVnd: 0, payeePayoutVnd: 49500,
  })
})

test('chia đôi: người mua nhận nửa, người bán nhận nửa còn lại sau phí', () => {
  assert.deepEqual(settleDisputeAmounts(50000, 'split'), {
    transactionStatus: 'partially_refunded', feeVnd: 250, payerRefundVnd: 25000, payeePayoutVnd: 24750,
  })
})

test('chia đôi số lẻ: phần dư dồn về phía bồi thường người bán', () => {
  assert.deepEqual(settleDisputeAmounts(5001, 'split'), {
    transactionStatus: 'partially_refunded', feeVnd: 25, payerRefundVnd: 2500, payeePayoutVnd: 2476,
  })
})

test('bác bỏ: giữ nguyên tiền, không chuyển cho ai', () => {
  assert.deepEqual(settleDisputeAmounts(50000, 'dismiss'), {
    transactionStatus: 'held', feeVnd: 0, payerRefundVnd: 0, payeePayoutVnd: 0,
  })
})

test('không có tiền đang giữ thì mọi khoản chuyển đều bằng 0', () => {
  assert.deepEqual(settleDisputeAmounts(0, 'release'), {
    transactionStatus: 'released', feeVnd: 0, payerRefundVnd: 0, payeePayoutVnd: 0,
  })
})

test('quyết định không hợp lệ thì báo lỗi 422', () => {
  assert.throws(() => settleDisputeAmounts(50000, 'wat'), err => err.status === 422 && err.code === 'INVALID_DISPUTE_DECISION')
})
