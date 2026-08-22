import { Router } from 'express'
import fs from 'node:fs'
import multer from 'multer'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { profileUploadLimiter } from '../middleware/rateLimit.js'
import { listPosts, createPost, recordView, toggleLike, deletePost } from '../services/motivationPostService.js'

const router = Router()

// Lưu công khai vào public/uploads (giống review.routes.js) — video đăng ở Góc truyền động lực là
// nội dung công khai cho mọi người xem, khác với ảnh khuôn mặt/báo cáo khám (riêng tư, phải qua
// requireAuth mới xem được ảnh) ở profile.routes.js.
const UPLOAD_DIR = 'public/uploads/motivation_videos'
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const dot = file.originalname.lastIndexOf('.')
    const ext = dot >= 0 ? file.originalname.slice(dot) : ''
    cb(null, `motivation-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Chỉ chấp nhận file video.'))
    }
    cb(null, true)
  },
})

router.get('/posts', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await listPosts(req.userId))
}))

router.post(
  '/posts',
  requireAuth,
  profileUploadLimiter,
  upload.single('video'),
  asyncHandler(async (req, res) => {
    const { title, description, videoUrl } = req.body ?? {}
    const post = await createPost(req.userId, { title, description, videoUrl }, req.file)
    if (!post) {
      return res.status(400).json({
        error: 'Vui lòng nhập tiêu đề và cung cấp đúng 1 nguồn video: dán link hoặc tải file lên, không cả hai.',
      })
    }
    res.status(201).json(post)
  }),
)

router.post('/posts/:id/view', optionalAuth, asyncHandler(async (req, res) => {
  await recordView(Number(req.params.id), req.userId)
  res.json({ ok: true })
}))

router.post('/posts/:id/like', requireAuth, asyncHandler(async (req, res) => {
  const result = await toggleLike(Number(req.params.id), req.userId)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy bài đăng.' })
  }
  res.json(result)
}))

router.delete('/posts/:id', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deletePost(req.userId, Number(req.params.id))
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy bài đăng hoặc bạn không phải chủ bài.' })
  }
  res.json({ ok: true })
}))

export default router
