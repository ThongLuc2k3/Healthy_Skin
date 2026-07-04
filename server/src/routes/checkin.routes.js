import { Router } from 'express'
import fs from 'node:fs'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { checkinLimiter } from '../middleware/rateLimit.js'
import { upsertCheckin, getCheckinByDate, getCheckinRawById, getCalendar } from '../services/checkinService.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh.'))
    }
    cb(null, true)
  },
})

const router = Router()

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

router.post(
  '/',
  requireAuth,
  checkinLimiter,
  upload.fields([
    { name: 'skincarePhoto', maxCount: 1 },
    { name: 'mealPhoto', maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    let skincareTasksCompleted = []
    if (req.body.skincareTasksCompleted) {
      try {
        skincareTasksCompleted = JSON.parse(req.body.skincareTasksCompleted)
        if (!Array.isArray(skincareTasksCompleted)) throw new Error('not an array')
      } catch {
        return res.status(400).json({ error: 'Danh sách việc đã hoàn thành không hợp lệ.' })
      }
    }

    const result = upsertCheckin(req.userId, {
      date: todayStr(),
      roadmapId: req.body.roadmapId ? Number(req.body.roadmapId) : null,
      skincareTasksCompleted,
      mealDescription: (req.body.mealDescription || '').slice(0, 500),
      note: (req.body.note || '').slice(0, 500),
      skincareFile: req.files?.skincarePhoto?.[0],
      mealFile: req.files?.mealPhoto?.[0],
    })

    res.json(result)
  }),
)

router.get('/today', requireAuth, (req, res) => {
  res.json(getCheckinByDate(req.userId, todayStr()))
})

router.get('/calendar', requireAuth, (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 90)
  res.json(getCalendar(req.userId, days))
})

// Ảnh điểm danh chỉ phục vụ qua route có xác thực + kiểm tra quyền sở hữu —
// KHÔNG dùng express.static công khai vì đây có thể là ảnh khuôn mặt/bữa ăn riêng tư.
router.get('/photo/:id/:field', requireAuth, (req, res) => {
  const { field } = req.params
  const id = Number(req.params.id)
  if (!['skincare', 'meal'].includes(field) || !Number.isInteger(id)) {
    return res.status(400).json({ error: 'Yêu cầu ảnh không hợp lệ.' })
  }

  const checkin = getCheckinRawById(id)
  if (!checkin || checkin.user_id !== req.userId) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }

  const filePath = field === 'skincare' ? checkin.skincare_photo_path : checkin.meal_photo_path
  const mime = field === 'skincare' ? checkin.skincare_photo_mime : checkin.meal_photo_mime
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }

  res.setHeader('Content-Type', mime || 'image/jpeg')
  res.sendFile(filePath)
})

export default router
