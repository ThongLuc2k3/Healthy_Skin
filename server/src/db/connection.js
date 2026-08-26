import pg from 'pg'
import { env } from '../config/env.js'

let pool,adapter
const initializedClients=new WeakSet()

async function acquire(){
  const client=await pool.connect()
  try{
    if(!initializedClients.has(client)){
      await client.query(`set search_path to ${env.databaseSchema},public`)
      initializedClients.add(client)
    }
    return client
  }catch(error){client.release();throw error}
}

export function database(){
  if(!env.databaseUrl)return null
  if(!/^[a-z_][a-z0-9_]*$/i.test(env.databaseSchema))throw new Error('DATABASE_SCHEMA không hợp lệ')
  if(!pool){
    pool=new pg.Pool({connectionString:env.databaseUrl,max:10,ssl:env.nodeEnv==='production'?{rejectUnauthorized:false}:undefined})
    adapter={
      connect:acquire,
      async query(...args){const client=await acquire();try{return await client.query(...args)}finally{client.release()}},
      end:()=>pool.end(),
    }
  }
  return adapter
}
