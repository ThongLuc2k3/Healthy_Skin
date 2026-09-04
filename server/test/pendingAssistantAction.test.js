import test from 'node:test'
import assert from 'node:assert/strict'
import { isNaturalAssistantConfirmation, signAssistantAction, verifyAssistantAction } from '../src/services/pendingAssistantActionService.js'

test('action TLUCS được ký, gắn đúng người dùng và chống sửa payload', () => {
  const token = signAssistantAction({ type: 'wallet_topup', summary: 'Nạp 10000 VND', payload: { amountVnd: 10000 } }, 'user-7')
  assert.equal(verifyAssistantAction(token, 'user-7').payload.amountVnd, 10000)
  assert.equal(verifyAssistantAction(token, 'user-8'), null)
  assert.equal(verifyAssistantAction(`${token}x`, 'user-7'), null)
})

test('TLUCS hiểu xác nhận tự nhiên nhưng không nhầm yêu cầu mới', () => {
  assert.equal(isNaturalAssistantConfirmation('đúm òi nà'), true)
  assert.equal(isNaturalAssistantConfirmation('ừ nha'), true)
  assert.equal(isNaturalAssistantConfirmation('nạp thêm 10k'), false)
})
