import test from 'node:test';import assert from 'node:assert/strict';import { validateRequestInput } from '../src/services/requestService.js'
const now=new Date('2026-08-26T10:00:00Z');const base={kind:'paid',title:'Cần hỏi kinh nghiệm môn AI',description:'Mình muốn hỏi kỹ về workload và cách chấm điểm môn học.',startsAt:'2026-08-26T11:00:00Z',durationMinutes:30,amountVnd:50000,deliveryMode:'online'}
test('chấp nhận yêu cầu trả phí hợp lệ',()=>assert.equal(validateRequestInput(base,now).valid,true))
test('từ chối giá vượt 200.000đ',()=>assert.equal(validateRequestInput({...base,amountVnd:201000},now).errors.amountVnd,'AMOUNT_TOO_HIGH'))
test('trao đổi phải mô tả điều có thể giúp',()=>assert.ok(validateRequestInput({...base,kind:'exchange',amountVnd:null},now).errors.offeredDescription))
