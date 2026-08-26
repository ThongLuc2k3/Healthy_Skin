import crypto from 'node:crypto'
import { database } from '../db/connection.js'
import { deliverNotification } from './deliveryService.js'
const memory=[]
export async function notify(userId,{kind='system',title,body,actionUrl=null}){const db=database();if(!db){const item={id:crypto.randomUUID(),user_id:userId,kind,title,body,action_url:actionUrl,read_at:null,created_at:new Date().toISOString()};memory.unshift(item);return item}const item=(await db.query('insert into notifications(user_id,kind,title,body,action_url) values($1,$2,$3,$4,$5) returning *',[userId,kind,title,body,actionUrl])).rows[0];deliverNotification(userId,item).catch(error=>console.error('Notification delivery failed',error));return item}
export async function listNotifications(userId){const db=database();if(!db)return memory.filter(x=>x.user_id===userId).slice(0,50);return (await db.query('select * from notifications where user_id=$1 order by created_at desc limit 50',[userId])).rows}
export async function readNotification(userId,id){const db=database();if(!db){const item=memory.find(x=>x.id===id&&x.user_id===userId);if(item)item.read_at=new Date().toISOString();return item}return (await db.query('update notifications set read_at=coalesce(read_at,now()) where id=$1 and user_id=$2 returning *',[id,userId])).rows[0]}
