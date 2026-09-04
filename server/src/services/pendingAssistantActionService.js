import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env.js'
import { MUTATING_ASSISTANT_TOOLS, executeAssistantTool } from './assistantTools.js'

const MAX_AGE_MS = 15 * 60 * 1000
const consumedTokens = new Map()

function signature(value) {
  return createHmac('sha256', env.jwtSecret).update(value).digest('base64url')
}

function normalizeVietnamese(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').trim()
}

export function isNaturalAssistantConfirmation(value) {
  const text = normalizeVietnamese(value)
  return /^(xac (nhan|nhat)( di)?|dong y|dung( roi)?|dum (oi|roi)( na)?|chot|ok|oke|okela|uh|u|yes|chuan|lam luon|trien khai)( nhe| nha| na)?[.!? ]*$/.test(text)
}

export function signAssistantAction(action, userId) {
  if (!action?.type || !MUTATING_ASSISTANT_TOOLS.has(action.type) || !userId) return null
  const body = Buffer.from(JSON.stringify({ ...action, userId: String(userId), expiresAt: Date.now() + MAX_AGE_MS })).toString('base64url')
  return `${body}.${signature(body)}`
}

export function verifyAssistantAction(token, userId) {
  if (!token || !userId) return null
  const [body, supplied] = String(token).split('.')
  if (!body || !supplied) return null
  const expected = signature(body)
  const left = Buffer.from(supplied)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.userId !== String(userId) || Number(payload.expiresAt) < Date.now() || !MUTATING_ASSISTANT_TOOLS.has(payload.type)) return null
    return payload
  } catch { return null }
}

export async function executeSignedAssistantAction(token, userId, context = {}) {
  const action = verifyAssistantAction(token, userId)
  if (!action) return null
  const now = Date.now()
  for (const [usedToken, expiresAt] of consumedTokens) if (expiresAt < now) consumedTokens.delete(usedToken)
  if (consumedTokens.has(token)) return null
  consumedTokens.set(token, Number(action.expiresAt) || now + MAX_AGE_MS)
  const result = await executeAssistantTool(action.type, action.payload, { ...context, userId })
  return { type: action.type, summary: action.summary, result }
}
