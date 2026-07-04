import { Router } from 'express'
import upload from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { scanLimiter } from '../middleware/rateLimit.js'
import { analyzeImage, GeminiNotConfiguredError, GeminiRequestError } from '../services/geminiService.js'
import { getProfile } from '../services/profileService.js'
import { recordScan, listScanHistory } from '../services/scanHistoryService.js'

const router = Router()

router.post(
  '/',
  requireAuth,
  scanLimiter,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn một ảnh để quét.' })
    }

    const profile = getProfile(req.userId)

    let analysis
    try {
      analysis = await analyzeImage(req.file.buffer, req.file.mimetype, profile)
    } catch (err) {
      if (err instanceof GeminiNotConfiguredError) {
        return res.status(503).json({
          error: 'Tính năng quét ảnh thật chưa sẵn sàng — thiếu cấu hình Gemini API key. Vui lòng thử lại sau.',
        })
      }
      if (err instanceof GeminiRequestError) {
        return res.status(502).json({ error: 'Không thể phân tích ảnh lúc này, vui lòng thử lại.' })
      }
      throw err
    }

    if (!analysis.recognized) {
      return res.status(422).json({
        error: analysis.reason || 'Không nhận diện được sản phẩm/thực phẩm rõ ràng trong ảnh.',
      })
    }

    recordScan(req.userId, {
      productName: analysis.productName,
      result: analysis.result,
      reason: analysis.reason,
    })

    res.json({
      productName: analysis.productName,
      result: analysis.result,
      reason: analysis.reason,
    })
  }),
)

router.get('/history', requireAuth, (req, res) => {
  res.json(listScanHistory(req.userId))
})

export default router
