import test from 'node:test';import assert from 'node:assert/strict';import { validatePostInput } from '../src/services/forumService.js'
test('chấp nhận bài diễn đàn đầy đủ',()=>assert.equal(validatePostInput({title:'Kinh nghiệm đăng ký môn AI',body:'Mình chia sẻ một số kinh nghiệm đã rút ra sau khi học môn này.',keywords:['AI']}).valid,true))
test('từ chối bài quá ngắn hoặc quá nhiều từ khóa',()=>{const result=validatePostInput({title:'Ngắn',body:'Ngắn',keywords:Array(9).fill('x')});assert.equal(result.valid,false);assert.ok(result.errors.keywords)})
