import test from 'node:test'
import assert from 'node:assert/strict'
import { validateUpload } from '../src/config/uploads.js'
test('chấp nhận định dạng an toàn trong giới hạn',()=>assert.equal(validateUpload({mimeType:'application/pdf',sizeBytes:1024}).valid,true))
test('từ chối tệp thực thi hoặc file nén',()=>{assert.equal(validateUpload({mimeType:'application/x-msdownload',sizeBytes:1024}).valid,false);assert.equal(validateUpload({mimeType:'application/zip',sizeBytes:1024}).valid,false)})
test('từ chối tệp lớn hơn 100 MB',()=>assert.equal(validateUpload({mimeType:'video/mp4',sizeBytes:100*1024*1024+1}).code,'FILE_TOO_LARGE'))
