import crypto from 'node:crypto'
import { database } from '../db/connection.js'
import { demoApplications,demoRequests } from './requestService.js'
import { freezeRequestTransaction,releaseTransaction,settleRequestNoShow } from './walletService.js'

const memoryAttendance=[]
const memoryReviews=[]

export async function listMySessions(userId){
  const db=database()
  if(!db)return demoRequests.filter(r=>r.author_id===userId||demoApplications.some(m=>m.request_id===r.id&&m.receiver_id===userId)).map(r=>{if(!r.appointment_id)ensureAppointment(r.id);return {...r,role:r.author_id===userId?'author':'receiver',match:demoApplications.find(m=>m.request_id===r.id),reviews:memoryReviews.filter(x=>x.request_id===r.id)}})
  await db.query(`insert into appointments(request_id,starts_at,ends_at) select r.id,r.starts_at,r.starts_at+(r.duration_minutes||' minutes')::interval from requests r join matches m on m.request_id=r.id where (r.author_id=$1 or m.receiver_id=$1) on conflict(request_id) do nothing`,[userId])
  return (await db.query(`select r.*,m.receiver_id,c.id conversation_id,a.id appointment_id,a.ends_at,a.exact_location,a.meeting_url,a.status appointment_status,case when r.author_id=$1 then 'author' else 'receiver' end role from requests r join matches m on m.request_id=r.id left join conversations c on c.request_id=r.id left join appointments a on a.request_id=r.id where r.author_id=$1 or m.receiver_id=$1 order by r.starts_at desc`,[userId])).rows
}

export async function ensureAppointment(requestId,client=null){
  const db=client||database();if(!db){const request=demoRequests.find(x=>x.id===requestId);if(!request)return null;request.appointment_id=request.appointment_id||crypto.randomUUID();request.appointment_status='scheduled';return request}
  return (await db.query(`insert into appointments(request_id,starts_at,ends_at) select id,starts_at,starts_at+(duration_minutes||' minutes')::interval from requests where id=$1 on conflict(request_id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at returning *`,[requestId])).rows[0]
}

export async function checkIn(userId,requestId,eventType='check_in',note=''){
  if(!['check_in','check_out','no_show_report'].includes(eventType))throw Object.assign(new Error('Sự kiện điểm danh không hợp lệ.'),{status:422})
  const db=database();if(!db){const request=demoRequests.find(x=>x.id===requestId);const match=demoApplications.find(x=>x.request_id===requestId);if(!request||![request.author_id,match?.receiver_id].includes(userId))throw Object.assign(new Error('Bạn không thuộc phiên này.'),{status:403});const item={id:crypto.randomUUID(),request_id:requestId,user_id:userId,event_type:eventType,note,created_at:new Date().toISOString()};memoryAttendance.push(item);return item}
  const membership=await db.query('select a.id from appointments a join requests r on r.id=a.request_id join matches m on m.request_id=r.id where r.id=$1 and (r.author_id=$2 or m.receiver_id=$2)',[requestId,userId])
  if(!membership.rowCount)throw Object.assign(new Error('Bạn không thuộc phiên này.'),{status:403})
  return (await db.query('insert into attendance_events(appointment_id,user_id,event_type,note) values($1,$2,$3,$4) returning *',[membership.rows[0].id,userId,eventType,note||null])).rows[0]
}

export async function completeSession(userId,requestId){
  const db=database()
  if(!db){const request=demoRequests.find(x=>x.id===requestId);if(!request||request.author_id!==userId)throw Object.assign(new Error('Chỉ người đăng có thể xác nhận hoàn tất.'),{status:403});if(request.kind==='paid')await releaseTransaction(requestId,userId);request.status='completed';request.completed_at=new Date().toISOString();return request}
  const request=(await db.query('select * from requests where id=$1',[requestId])).rows[0]
  if(!request||request.author_id!==userId)throw Object.assign(new Error('Chỉ người đăng có thể xác nhận hoàn tất.'),{status:403})
  if(request.kind==='paid')await releaseTransaction(requestId,userId)
  else await db.query(`update requests set status='completed' where id=$1`,[requestId])
  await db.query(`update appointments set status='completed',completed_at=now() where request_id=$1`,[requestId])
  return {...request,status:'completed'}
}

export async function reviewSession(userId,requestId,input={}){
  const rating=Number(input.rating),comment=String(input.comment||'').trim()
  if(!Number.isInteger(rating)||rating<1||rating>5||comment.length>1000)throw Object.assign(new Error('Đánh giá không hợp lệ.'),{status:422})
  const db=database()
  if(!db){const request=demoRequests.find(x=>x.id===requestId),match=demoApplications.find(x=>x.request_id===requestId);const revieweeId=request?.author_id===userId?match?.receiver_id:request?.author_id;if(!revieweeId)throw Object.assign(new Error('Bạn không thể đánh giá phiên này.'),{status:403});const item={id:crypto.randomUUID(),request_id:requestId,reviewer_id:userId,reviewee_id:revieweeId,rating,comment,created_at:new Date().toISOString()};memoryReviews.push(item);return item}
  const relation=(await db.query('select r.author_id,m.receiver_id,r.status from requests r join matches m on m.request_id=r.id where r.id=$1',[requestId])).rows[0]
  const revieweeId=relation?.author_id===userId?relation.receiver_id:relation?.receiver_id===userId?relation.author_id:null
  if(!revieweeId||relation.status!=='completed')throw Object.assign(new Error('Chỉ hai bên của phiên đã hoàn tất mới được đánh giá.'),{status:403})
  return (await db.query('insert into reviews(request_id,reviewer_id,reviewee_id,rating,comment) values($1,$2,$3,$4,$5) on conflict(request_id,reviewer_id) do update set rating=excluded.rating,comment=excluded.comment returning *',[requestId,userId,revieweeId,rating,comment||null])).rows[0]
}

export async function reportNoShow(userId,requestId,input={}){
  const absentParty=input.absentParty
  if(!['author','receiver'].includes(absentParty))throw Object.assign(new Error('Vui lòng chọn đúng bên vắng mặt.'),{status:422})
  const db=database()
  if(!db){const request=demoRequests.find(x=>x.id===requestId),match=demoApplications.find(x=>x.request_id===requestId);if(!request||![request.author_id,match?.receiver_id].includes(userId))throw Object.assign(new Error('Bạn không thuộc phiên này.'),{status:403});const threshold=new Date(request.starts_at).getTime()+request.duration_minutes*30000;if(Date.now()<threshold)throw Object.assign(new Error('Chỉ được kết luận vắng mặt sau quá 50% thời lượng.'),{status:409});await checkIn(userId,requestId,'no_show_report',input.note||'Vắng quá 50% thời lượng');if(request.kind==='paid')await settleRequestNoShow(requestId,userId,absentParty);request.status='cancelled';if(absentParty==='receiver'&&userId===request.author_id)memoryReviews.push({id:crypto.randomUUID(),request_id:requestId,reviewer_id:userId,reviewee_id:match.receiver_id,rating:1,comment:input.note||'Vắng mặt quá 50% thời lượng.',created_at:new Date().toISOString()});return request}
  const relation=(await db.query(`select r.*,m.receiver_id,a.id appointment_id,a.ends_at from requests r join matches m on m.request_id=r.id join appointments a on a.request_id=r.id where r.id=$1 and (r.author_id=$2 or m.receiver_id=$2)`,[requestId,userId])).rows[0]
  if(!relation)throw Object.assign(new Error('Bạn không thuộc phiên này.'),{status:403})
  const threshold=new Date(relation.starts_at).getTime()+Number(relation.duration_minutes)*30000
  if(Date.now()<threshold)throw Object.assign(new Error('Chỉ được kết luận vắng mặt sau quá 50% thời lượng.'),{status:409})
  await db.query(`insert into attendance_events(appointment_id,user_id,event_type,note) values($1,$2,'no_show_report',$3)`,[relation.appointment_id,userId,input.note||'Vắng quá 50% thời lượng'])
  if(relation.kind==='paid')await settleRequestNoShow(requestId,userId,absentParty)
  else{await db.query(`update requests set status='cancelled' where id=$1`,[requestId]);await db.query(`update appointments set status='cancelled',completed_at=now() where request_id=$1`,[requestId])}
  if(absentParty==='receiver'&&userId===relation.author_id)await db.query(`insert into reviews(request_id,reviewer_id,reviewee_id,rating,comment) values($1,$2,$3,1,$4) on conflict(request_id,reviewer_id) do update set rating=1,comment=excluded.comment`,[requestId,userId,relation.receiver_id,input.note||'Vắng mặt quá 50% thời lượng.'])
  return {...relation,status:'cancelled'}
}
export async function openRequestDispute(userId,requestId,input={}){
  const reason=String(input.reason||'').trim();if(reason.length<10)throw Object.assign(new Error('Mô tả tranh chấp cần ít nhất 10 ký tự.'),{status:422});const tx=await freezeRequestTransaction(requestId,userId);const db=database();if(!db)return {id:crypto.randomUUID(),transaction_id:tx.id,opened_by:userId,reason,status:'open',created_at:new Date().toISOString()};return (await db.query('insert into disputes(transaction_id,opened_by,reason) values($1,$2,$3) returning *',[tx.id,userId,reason])).rows[0]
}
