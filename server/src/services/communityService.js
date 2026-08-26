import crypto from 'node:crypto'
import { database } from '../db/connection.js'
import { screenText } from './moderationService.js'

const defaultChannels = [
  ['chung', 'Chung'],
  ['hoi-mon-hoc', 'Hỏi môn học'],
  ['doi-song-sinh-vien', 'Đời sống sinh viên'],
  ['nha-tro-ky-tuc-xa', 'Nhà trọ – ký túc xá'],
  ['thuc-tap-viec-lam', 'Thực tập – việc làm'],
  ['hoat-dong-cau-lac-bo', 'Hoạt động – câu lạc bộ'],
]
const memoryMessages = new Map()

export async function listServers() {
  const db = database()
  if (!db) return [{ id: 'hcmus-server', university_id: 'hcmus', university_code: 'HCMUS', name: 'Cộng đồng HCMUS', slug: 'hcmus', channels: defaultChannels.map(([slug,name],position)=>({id:`hcmus-${slug}`,slug,name,position})) }]
  const { rows } = await db.query(`select s.*,u.code university_code,u.name university_name from community_servers s join universities u on u.id=s.university_id order by u.is_pilot desc,u.name`)
  for (const server of rows) server.channels = (await db.query('select * from channels where server_id=$1 order by position,name',[server.id])).rows
  return rows
}

export async function listChannelMessages(userId, channelId) {
  const db = database()
  if (!db) return memoryMessages.get(channelId) || []
  const { rows } = await db.query(`select m.*,u.display_name,u.avatar_url,um.verification_status,u2.code university_code from conversations c join messages m on m.conversation_id=c.id join users u on u.id=m.sender_id left join university_memberships um on um.user_id=u.id left join universities u2 on u2.id=um.university_id where c.channel_id=$1 order by m.created_at desc limit 100`,[channelId])
  return rows.reverse()
}

export async function sendChannelMessage(userId, channelId, input={}) {
  const body=String(input.body||'').trim()
  if(body.length<1||body.length>2000)throw Object.assign(new Error('Tin nhắn cần từ 1 đến 2.000 ký tự.'),{status:422})
  const moderation=screenText({body})
  if(moderation.outcome!=='publish')throw Object.assign(new Error('Tin nhắn có nội dung cần quản trị viên xem xét.'),{status:422,code:'CONTENT_HELD'})
  const db=database()
  if(!db){const item={id:crypto.randomUUID(),sender_id:userId,display_name:'Bạn',body,kind:'text',created_at:new Date().toISOString()};const list=memoryMessages.get(channelId)||[];list.push(item);memoryMessages.set(channelId,list);return item}
  const client=await db.connect()
  try{await client.query('begin');let conversation=(await client.query('select id from conversations where channel_id=$1',[channelId])).rows[0];if(!conversation)conversation=(await client.query(`insert into conversations(kind,channel_id) values('channel',$1) returning id`,[channelId])).rows[0];const message=(await client.query(`insert into messages(conversation_id,sender_id,kind,body) values($1,$2,'text',$3) returning *`,[conversation.id,userId,body])).rows[0];await client.query('commit');return message}catch(error){await client.query('rollback');throw error}finally{client.release()}
}

export async function proposeChannel(userId,serverId,input={}){
  const name=String(input.name||'').trim(),description=String(input.description||'').trim()
  if(name.length<3||description.length<10)throw Object.assign(new Error('Tên hoặc mô tả đề xuất quá ngắn.'),{status:422})
  const db=database();if(!db)return {id:crypto.randomUUID(),server_id:serverId,proposer_id:userId,name,description,status:'pending'}
  return (await db.query('insert into channel_proposals(server_id,proposer_id,name,description) values($1,$2,$3,$4) returning *',[serverId,userId,name,description])).rows[0]
}
