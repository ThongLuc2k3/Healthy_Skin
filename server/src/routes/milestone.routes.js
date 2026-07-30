import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { listMilestones, createMilestone, compareMilestone, deleteMilestone } from '../services/milestoneService.js'

const router = Router()

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh.'))
    }
    cb(null, true)
  },
})

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listMilestones(req.userId))
}))

router.post('/', requireAuth, imageUpload.single('image'), asyncHandler(async (req, res) => {
  const milestone = await createMilestone(req.userId, req.file || null)
  res.status(201).json(milestone)
}))

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ.' })
  }
  const deleted = await deleteMilestone(req.userId, id)
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy milestone.' })
  }
  res.json({ ok: true })
}))

router.get('/:id/compare', requireAuth, asyncHandler(async (req, res) => {
  const result = await compareMilestone(req.userId, Number(req.params.id))
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy milestone.' })
  }
  res.json(result)
}))

export default router
