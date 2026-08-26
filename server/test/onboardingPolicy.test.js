import test from 'node:test'
import assert from 'node:assert/strict'
import { validateOnboarding } from '../src/services/onboardingPolicy.js'
const valid={displayName:'Mèo Máy',accountKind:'university_student',areaLabel:'Thủ Đức',topicIds:['topic-1'],availability:[{weekday:1,startTime:'18:00',endTime:'20:00'}]}
test('chấp nhận onboarding đầy đủ',()=>assert.equal(validateOnboarding(valid).valid,true))
test('từ chối onboarding thiếu trường bắt buộc',()=>{const result=validateOnboarding({});assert.equal(result.valid,false);assert.ok(result.errors.displayName);assert.ok(result.errors.topicIds)})
