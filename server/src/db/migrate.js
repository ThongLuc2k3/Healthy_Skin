import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { env } from '../config/env.js'

if (!env.databaseUrlDirect) throw new Error('Thiếu DATABASE_URL_DIRECT hoặc DATABASE_URL')
if (!/^[a-z_][a-z0-9_]*$/i.test(env.databaseSchema)) throw new Error('DATABASE_SCHEMA không hợp lệ')

const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const client = new pg.Client({ connectionString: env.databaseUrlDirect, ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined })
await client.connect()
try {
  await client.query(`create schema if not exists ${env.databaseSchema}`)
  await client.query(`set search_path to ${env.databaseSchema},public`)
  await client.query('create table if not exists _tlucs_migrations(id text primary key,applied_at timestamptz not null default now())')
  const done = await client.query(`select 1 from _tlucs_migrations where id='0001_initial'`)
  if (done.rowCount) console.log(`Schema ${env.databaseSchema} đã được áp dụng trước đó.`)
  else {
    await client.query('begin')
    await client.query(sql)
    await client.query(`insert into _tlucs_migrations(id) values('0001_initial')`)
    await client.query('commit')
    console.log(`Đã tạo schema ${env.databaseSchema} cho TLUCS.`)
  }
  await client.query(`create unique index if not exists transactions_request_unique on transactions(request_id) where request_id is not null`)
  await client.query(`create unique index if not exists transactions_sharing_buyer_unique on transactions(sharing_post_id,payer_id) where sharing_post_id is not null`)
  await client.query(`alter table requests add column if not exists course_name text`)
  await client.query(`alter type transaction_status add value if not exists 'cancelled'`)
} catch (error) {
  await client.query('rollback')
  throw error
} finally { await client.end() }
