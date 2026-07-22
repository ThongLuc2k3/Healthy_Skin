import Database from 'better-sqlite3'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../config/env.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(process.cwd(), config.dbPath)
mkdirSync(dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

// Bù cột còn thiếu cho DB đã tồn tại từ trước khi schema.sql có thêm cột mới
// (CREATE TABLE IF NOT EXISTS không tự thêm cột vào bảng đã có sẵn).
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!columns.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

ensureColumn('scan_history', 'product_name', 'TEXT')
ensureColumn('profiles', 'skin_type_note', "TEXT NOT NULL DEFAULT ''")
ensureColumn('profiles', 'allergies_note', "TEXT NOT NULL DEFAULT ''")
ensureColumn('profiles', 'conditions_note', "TEXT NOT NULL DEFAULT ''")
ensureColumn('profiles', 'goals_note', "TEXT NOT NULL DEFAULT ''")
ensureColumn('profiles', 'consent_given_at', 'TEXT')
ensureColumn('profiles', 'face_photo_path', 'TEXT')
ensureColumn('profiles', 'face_photo_mime', 'TEXT')
ensureColumn('profiles', 'diagnosed_conditions', "TEXT NOT NULL DEFAULT '[]'")
ensureColumn('website_reviews', 'image_path', 'TEXT')
ensureColumn('website_reviews', 'image_mime', 'TEXT')

export default db
