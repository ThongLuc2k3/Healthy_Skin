import bcrypt from 'bcrypt'
import db from '../db/connection.js'

const SALT_ROUNDS = 10

const findByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?')
const findByIdStmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?')
const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')

export function findUserByEmail(email) {
  return findByEmailStmt.get(email)
}

export function findUserById(id) {
  return findByIdStmt.get(id)
}

export async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const { lastInsertRowid } = insertUserStmt.run(email, passwordHash)
  return findUserById(lastInsertRowid)
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}
