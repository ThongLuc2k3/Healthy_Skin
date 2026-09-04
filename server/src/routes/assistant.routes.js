import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { planAgent } from '../services/assistantService.js'
import { requireAuth } from '../middleware/auth.js'
import { getUser } from '../services/authService.js'
import { answerFromKnowledge } from '../services/knowledgeService.js'
import { MUTATING_ASSISTANT_TOOLS, executeAssistantTool } from '../services/assistantTools.js'

const router = Router()
const aiLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'AI_RATE_LIMITED', message: 'Bạn đang thao tác với trợ lý AI quá nhanh. Vui lòng thử lại sau ít phút.' } } })
const greetingPattern = /^\s*(xin chào|chào|hello|hi|hey|alo)[!.?\s]*$/i
const greeting = 'Chào bạn! Mình là Agent TLUCS. Bạn có thể hỏi kiến thức hoặc nhờ mình tra cứu và thao tác các chức năng ngay trong chat.'

function normalizeIntent(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9%]+/g, ' ').trim()
}

export function shouldUseAgent(message) {
  const text = normalizeIntent(message)
  const staticQuestion = /^(cach|lam sao|huong dan|tai sao|vi sao|la gi|quy dinh|chinh sach) /.test(text)
  const personalData = /(cua toi|cua minh|vi toi|vi minh|so du|bao nhieu tien|lich su|thong bao cua|ho so cua|yeu cau cua|bai cua|phien cua|tin nhan cua)/.test(text)
  const operation = /(dang|tao|nhan|chon|tham gia|mo khoa|xac nhan|xac nhat|huy|cap nhat|doi|nap|rut|thanh toan|giai ngan|check in|hoan tat|danh gia|bao cao|khieu nai|tranh chap|binh luan|tha|luu|theo doi|tang|gui|nhan tin|moi|chap nhan|tu choi|de xuat|xac minh|tim|tra cuu|xem|liet ke)/.test(text)
  const requestCue = /^(dang|tao|nhan|chon|tham gia|mo khoa|xac nhan|xac nhat|huy|cap nhat|doi|nap|rut|thanh toan|giai ngan|check in|hoan tat|danh gia|bao cao|khieu nai|tranh chap|binh luan|tha|luu|theo doi|tang|gui|nhan tin|moi|chap nhan|tu choi|de xuat|xac minh|tim|tra cuu|xem|liet ke)( |$)|(toi muon|minh muon|co the|hay |giup toi|giup minh|dum|ho toi|cho toi|duoc khong|duoc k)/.test(text)
  return personalData || (!staticQuestion && operation && requestCue)
}

router.post('/chat', aiLimiter, async (req, res, next) => {
  try {
    if (greetingPattern.test(String(req.body.message || ''))) return res.json({ data: { answer: greeting, mode: 'script' } })
    const knowledge = await answerFromKnowledge(req.body.message)
    res.json({ data: { answer: knowledge.answer, mode: 'rag', confidence: knowledge.confidence, source: knowledge.source } })
  } catch (error) { next(error) }
})

router.post('/agent', aiLimiter, requireAuth, async (req, res, next) => {
  try {
    const message = String(req.body.message || '')
    if (greetingPattern.test(message)) return res.json({ data: { reply: greeting, action: null, toolsUsed: [], steps: 0, mode: 'script' } })
    if (!shouldUseAgent(message)) {
      const knowledge = await answerFromKnowledge(message)
      return res.json({ data: { reply: knowledge.answer, action: null, toolsUsed: knowledge.confidence >= .85 ? ['search_tlucs_knowledge'] : [], steps: 1, mode: 'rag', confidence: knowledge.confidence } })
    }
    const user = await getUser(req.auth.sub)
    const context = { userId: req.auth.sub, universityId: user.default_university_id, user: { displayName: user.display_name, areaLabel: user.area_label, defaultUniversityId: user.default_university_id, memberships: user.memberships || [] }, now: new Date().toISOString(), timezone: 'Asia/Ho_Chi_Minh' }
    res.json({ data: await planAgent(message, req.body.history, context) })
  } catch (error) { next(error) }
})

router.post('/actions/execute', requireAuth, async (req, res, next) => {
  try {
    const action = req.body.action
    if (!action || !MUTATING_ASSISTANT_TOOLS.has(action.type)) throw Object.assign(new Error('Hành động Agent không được hỗ trợ.'), { status: 422 })
    const user = await getUser(req.auth.sub)
    const result = await executeAssistantTool(action.type, action.payload, { userId: req.auth.sub, universityId: user.default_university_id })
    res.json({ data: { type: action.type, result } })
  } catch (error) { next(error) }
})

export default router
