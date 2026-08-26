import pg from 'pg'
import { env } from '../config/env.js'
let pool
export function database(){
  if (!env.databaseUrl) return null
  pool ??= new pg.Pool({ connectionString: env.databaseUrl, max: 10, options:`-c search_path=${env.databaseSchema},public`, ssl: env.nodeEnv === 'production' ? { rejectUnauthorized:false } : undefined })
  return pool
}
