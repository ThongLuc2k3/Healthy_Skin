import test from 'node:test';import assert from 'node:assert/strict';import { screenText } from '../src/services/moderationService.js'
test('tự đăng nội dung an toàn',()=>assert.equal(screenText({title:'Hỏi kinh nghiệm môn AI',description:'Mình muốn biết cách chuẩn bị.'}).outcome,'publish'))
test('giam ưu tiên nội dung thi hộ',()=>assert.equal(screenText({title:'Cần người thi hộ',description:'Liên hệ mình.'}).outcome,'priority_hold'))
test('giam link ngoài để admin xem',()=>assert.equal(screenText({title:'Tài liệu tham khảo',description:'Xem tại https://example.com'}).outcome,'hold'))
