import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldUseAgent } from '../src/routes/assistant.routes.js'

test('dữ liệu cá nhân và thao tác được chuyển tới Agent', () => {
  assert.equal(shouldUseAgent('bạn có thể xem ví tôi có bao nhiêu và nạp thêm 10k được k'), true)
  assert.equal(shouldUseAgent('số dư của tôi hiện tại là bao nhiêu?'), true)
  assert.equal(shouldUseAgent('tìm giúp mình bài chia sẻ giải tích'), true)
  assert.equal(shouldUseAgent('xác nhat'), true)
})

test('câu hỏi kiến thức tĩnh ở lại RAG', () => {
  assert.equal(shouldUseAgent('cách nạp tiền vào ví là gì?'), false)
  assert.equal(shouldUseAgent('hướng dẫn đăng yêu cầu'), false)
  assert.equal(shouldUseAgent('phí nền tảng là bao nhiêu?'), false)
  assert.equal(shouldUseAgent('TLUCS thuộc lĩnh vực nào?'), false)
})
