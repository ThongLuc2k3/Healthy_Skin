import crypto from 'node:crypto'
import path from 'node:path'
import { mkdir,readFile,writeFile } from 'node:fs/promises'
import { database } from '../db/connection.js'
import { uploadPolicy,validateUpload } from '../config/uploads.js'
import { demoMembers,demoPosts } from './sharingService.js'
import { env } from '../config/env.js'

const uploadRoot=path.resolve(env.uploadDir)
const memoryMaterials=[]
const signatures=[
  {mime:'application/pdf',test:b=>b.subarray(0,5).toString()==='%PDF-'},
  {mime:'image/jpeg',test:b=>b[0]===0xff&&b[1]===0xd8&&b[2]===0xff},
  {mime:'image/png',test:b=>b.subarray(1,4).toString()==='PNG'},
  {mime:'image/webp',test:b=>b.subarray(8,12).toString()==='WEBP'},
]
function hasExpectedSignature(buffer,mime){const rule=signatures.find(x=>x.mime===mime);return !rule||rule.test(buffer)}
export function uploadLimits(){return {files:uploadPolicy.maximumFilesPerSharingPost,fileSize:uploadPolicy.maximumFileBytes}}

async function assertHost(userId,postId){
  const db=database();if(!db){const post=demoPosts.find(x=>x.id===postId);if(!post||post.host_id!==userId)throw Object.assign(new Error('Chỉ chủ bài được tải tài liệu lên.'),{status:403});return post}
  const post=(await db.query('select * from sharing_posts where id=$1 and host_id=$2',[postId,userId])).rows[0];if(!post)throw Object.assign(new Error('Chỉ chủ bài được tải tài liệu lên.'),{status:403});return post
}
export async function saveMaterial(userId,postId,file,title=''){
  await assertHost(userId,postId)
  const validation=validateUpload({mimeType:file.mimetype,sizeBytes:file.size});if(!validation.valid)throw Object.assign(new Error('Tệp không được hỗ trợ hoặc vượt quá 100 MB.'),{status:422,code:validation.code})
  if(!hasExpectedSignature(file.buffer,file.mimetype))throw Object.assign(new Error('Chữ ký tệp không khớp định dạng khai báo.'),{status:422,code:'FILE_SIGNATURE_MISMATCH'})
  await mkdir(uploadRoot,{recursive:true});const id=crypto.randomUUID(),storedName=id;await writeFile(path.join(uploadRoot,storedName),file.buffer,{flag:'wx'})
  const record={id,sharing_post_id:postId,uploader_id:userId,title:String(title||file.originalname).slice(0,160),file_url:storedName,original_filename:file.originalname,mime_type:file.mimetype,size_bytes:file.size,scan_status:'safe',created_at:new Date().toISOString()}
  const db=database();if(!db){memoryMaterials.push(record);return record}
  return (await db.query(`insert into sharing_post_materials(id,sharing_post_id,uploader_id,title,file_url,original_filename,mime_type,size_bytes,scan_status,scan_result) values($1,$2,$3,$4,$5,$6,$7,$8,'safe',$9) returning *`,[id,postId,userId,record.title,storedName,file.originalname,file.mimetype,file.size,JSON.stringify({engine:'signature-and-mime-mvp',checkedAt:new Date().toISOString()})])).rows[0]
}
export async function getMaterial(userId,id){
  const db=database();let material,allowed=false
  if(!db){material=memoryMaterials.find(x=>x.id===id);const post=demoPosts.find(x=>x.id===material?.sharing_post_id);allowed=post?.host_id===userId||demoMembers.some(x=>x.sharing_post_id===post?.id&&x.user_id===userId&&x.status!=='refunded')}
  else{material=(await db.query('select * from sharing_post_materials where id=$1 and scan_status=\'safe\'',[id])).rows[0];if(material)allowed=(await db.query(`select 1 from sharing_posts sp where sp.id=$1 and (sp.host_id=$2 or exists(select 1 from sharing_post_members m where m.sharing_post_id=sp.id and m.user_id=$2 and m.status not in ('refunded','cancelled')))`,[material.sharing_post_id,userId])).rowCount>0}
  if(!material||!allowed)throw Object.assign(new Error('Bạn không có quyền truy cập tài liệu này.'),{status:403})
  return {material,buffer:await readFile(path.join(uploadRoot,material.file_url))}
}
export async function listMySharing(userId){
  const db=database();if(!db)return {joined:demoMembers.filter(x=>x.user_id===userId).map(member=>({...member,post:demoPosts.find(p=>p.id===member.sharing_post_id),materials:memoryMaterials.filter(m=>m.sharing_post_id===member.sharing_post_id)})),hosted:demoPosts.filter(p=>p.host_id===userId).map(post=>({post,materials:memoryMaterials.filter(m=>m.sharing_post_id===post.id)}))}
  const [joined,hosted]=await Promise.all([db.query(`select m.*,row_to_json(sp) post,coalesce((select json_agg(sm order by sm.created_at) from sharing_post_materials sm where sm.sharing_post_id=sp.id and sm.scan_status='safe'),'[]') materials from sharing_post_members m join sharing_posts sp on sp.id=m.sharing_post_id where m.user_id=$1 order by m.joined_at desc`,[userId]),db.query(`select row_to_json(sp) post,coalesce((select json_agg(sm order by sm.created_at) from sharing_post_materials sm where sm.sharing_post_id=sp.id and sm.scan_status='safe'),'[]') materials from sharing_posts sp where sp.host_id=$1 order by sp.created_at desc`,[userId])]);return {joined:joined.rows,hosted:hosted.rows}
}
