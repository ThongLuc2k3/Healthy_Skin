import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePlatformFee, calculateSharingHostDeposit, reviewContentAccessPrice, splitCompensation, validateDuration, validatePaidAmount, validateRequestStart } from '../src/config/policies.js'

const now = new Date('2026-08-26T10:00:00.000Z')
test('từ chối lịch bắt đầu sớm hơn 30 phút',()=>assert.equal(validateRequestStart('2026-08-26T10:29:59.000Z',now).code,'START_TOO_SOON'))
test('chấp nhận lịch bắt đầu đúng sau 30 phút',()=>assert.equal(validateRequestStart('2026-08-26T10:30:00.000Z',now).valid,true))
test('chấp nhận lịch trong vòng 3 ngày',()=>assert.equal(validateRequestStart('2026-08-29T10:00:00.000Z',now).valid,true))
test('từ chối lịch vượt quá 3 ngày',()=>assert.equal(validateRequestStart('2026-08-29T10:00:01.000Z',now).code,'START_TOO_FAR'))
test('chấp nhận thời lượng từ 15 đến 240 phút',()=>{assert.equal(validateDuration(15).valid,true);assert.equal(validateDuration(240).valid,true)})
test('cảnh báo phiên dài hơn 2 giờ',()=>assert.equal(validateDuration(180).warning,'CONSIDER_SPLITTING_SESSION'))
test('từ chối thời lượng ngoài giới hạn',()=>{assert.equal(validateDuration(14).valid,false);assert.equal(validateDuration(241).valid,false)})
test('chấp nhận ngân sách trả phí 10.000đ–200.000đ theo bước 1.000đ',()=>{assert.equal(validatePaidAmount(10_000).valid,true);assert.equal(validatePaidAmount(200_000).valid,true)})
test('từ chối ngân sách ngoài biên hoặc sai bước giá',()=>{assert.equal(validatePaidAmount(9_000).valid,false);assert.equal(validatePaidAmount(201_000).valid,false);assert.equal(validatePaidAmount(10_500).valid,false)})
test('tính hoa hồng đúng 1%',()=>{assert.equal(calculatePlatformFee(10_000),100);assert.equal(calculatePlatformFee(200_000),2_000);assert.equal(calculatePlatformFee(5_000),50)})
test('nội dung miễn phí hoặc đến 20.000đ không cần duyệt giá',()=>{assert.equal(reviewContentAccessPrice(0).adminReviewRequired,false);assert.equal(reviewContentAccessPrice(20_000).adminReviewRequired,false)})
test('giá nội dung trên 20.000đ cần admin duyệt',()=>assert.equal(reviewContentAccessPrice(21_000).adminReviewRequired,true))
test('chia đủ tiền bồi thường kể cả khi không chia hết',()=>{const parts=splitCompensation(990,['a','b','c','d']);assert.equal(parts.reduce((sum,item)=>sum+item.amountVnd,0),990);assert.deepEqual(parts.map(item=>item.amountVnd),[248,248,247,247])})
test('cọc chủ bài bằng 10% giá vé và buổi miễn phí không cọc',()=>{assert.equal(calculateSharingHostDeposit(0),0);assert.equal(calculateSharingHostDeposit(10_000),1_000);assert.equal(calculateSharingHostDeposit(20_000),2_000)})
