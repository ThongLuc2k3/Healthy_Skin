import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { planAgent } from '../services/assistantService.js'
import { requireAuth } from '../middleware/auth.js'
import { getUser } from '../services/authService.js'
import { answerFromKnowledge } from '../services/knowledgeService.js'
import { MUTATING_ASSISTANT_TOOLS, executeAssistantTool } from '../services/assistantTools.js'

const router = Router()
const aiLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'AI_RATE_LIMITED', message: 'Bạn đang thao tác với trợ lý AI quá nhanh. Vui lòng thử lại sau ít phút.' } } })
const actionPattern = /\b(đăng|tạo|nhận|chọn|tham gia|mở khóa|xác nhận|hủy|cập nhật|đổi|nạp|rút|thanh toán|giải ngân|check.?in|hoàn tất|đánh giá|báo|khiếu nại|tranh chấp|bình luận|thả|lưu|theo dõi|tặng|gửi|nhắn|mời|chấp nhận|từ chối|đề xuất|xác minh|tìm|tra|xem|liệt kê)\b/i
const commandHintPattern = /(^\s*(đăng|tạo|nhận|chọn|tham gia|mở khóa|xác nhận|hủy|cập nhật|đổi|nạp|rút|thanh toán|giải ngân|check.?in|hoàn tất|đánh giá|báo|khiếu nại|tranh chấp|bình luận|thả|lưu|theo dõi|tặng|gửi|nhắn|mời|chấp nhận|từ chối|đề xuất|xác minh|tìm|tra|xem|liệt kê)\b|\b(tôi muốn|mình muốn|hãy|giúp tôi|giúp mình|dùm|hộ tôi|cho tôi)\b)/i
const greetingPattern = /^\s*(xin chào|chào|hello|hi|hey|alo)[!.?\s]*$/i
const greeting = 'Chào bạn! Mình là Agent TLUCS. Bạn có thể hỏi kiến thức hoặc nhờ mình tra cứu và thao tác các chức năng ngay trong chat.'

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
    const looksLikeCommand = actionPattern.test(message) && commandHintPattern.test(message) && !/^\s*(cách|làm sao|hướng dẫn|tại sao|vì sao)\b/i.test(message)
    if (!looksLikeCommand) {
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
