import bcrypt from 'bcrypt'
import { query } from '../db/connection.js'

const SALT_ROUNDS = 10

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0]
}

export async function findUserById(id) {
  const { rows } = await query('SELECT id, email, created_at FROM users WHERE id = $1', [id])
  return rows[0]
}

export async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const { rows } = await query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash],
  )
  return rows[0]
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}
