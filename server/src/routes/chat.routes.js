import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import { chatLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { chatReply } from '../services/chatService.js'
import { GeminiNotConfiguredError, GeminiRequestError } from '../services/geminiService.js'

const router = Router()

router.post(
  '/',
  optionalAuth,
  chatLimiter,
  asyncHandler(async (req, res) => {
    const { messages, context } = req.body ?? {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' })
    }
    const hasInvalidMessage = messages.some(
      (m) =>
        !m ||
        typeof m.text !== 'string' ||
        !m.text.trim() ||
        !['user', 'assistant'].includes(m.role),
    )
    if (hasInvalidMessage) {
      return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ.' })
    }

    let reply
    try {
      reply = await chatReply(messages, context ?? {})
    } catch (err) {
      if (err instanceof GeminiNotConfiguredError) {
        return res.status(503).json({
          error: 'Trợ lý AI chưa sẵn sàng — thiếu cấu hình Gemini API key.',
        })
      }
      if (err instanceof GeminiRequestError) {
        return res.status(502).json({ error: 'Không thể trả lời lúc này, vui lòng thử lại.' })
      }
      throw err
    }

    res.json({ reply })
  }),
)

export default router
