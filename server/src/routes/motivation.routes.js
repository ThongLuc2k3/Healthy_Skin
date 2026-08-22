import { Router } from 'express'
import fs from 'node:fs'
import multer from 'multer'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { profileUploadLimiter } from '../middleware/rateLimit.js'
import { listPosts, createPost, updatePost, recordView, toggleLike, deletePost } from '../services/motivationPostService.js'
import { listComments, createComment, updateComment, deleteComment, toggleCommentReaction } from '../services/commentService.js'

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
    if (!file.mimetype.startsWith('video/') && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh hoặc video.'))
    }
    cb(null, true)
  },
})

// Bình luận (kể cả ảnh đính kèm) dùng chung logic VÀ thư mục lưu với review.routes.js — xem
// commentService.js (đường dẫn ảnh nó tự ghép luôn là "/uploads/reviews/...", không phân biệt bình
// luận cho đánh giá hay bài đăng, nên multer ở đây phải ghi vào ĐÚNG thư mục đó).
const REVIEW_UPLOAD_DIR = 'public/uploads/reviews'
fs.mkdirSync(REVIEW_UPLOAD_DIR, { recursive: true })
const commentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REVIEW_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const dot = file.originalname.lastIndexOf('.')
    const ext = dot >= 0 ? file.originalname.slice(dot) : ''
    cb(null, `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})
const MAX_COMMENT_IMAGES = 6
const uploadCommentImages = multer({
  storage: commentImageStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_COMMENT_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ chấp nhận file hình ảnh!'))
    cb(null, true)
  },
})

router.get('/posts/:id/comments', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await listComments('motivation', req.params.id, req.userId))
}))

router.post('/posts/:id/comments', requireAuth, uploadCommentImages.array('images', MAX_COMMENT_IMAGES), asyncHandler(async (req, res) => {
  const created = await createComment('motivation', req.params.id, req.userId, req.body ?? {}, req.files)
  if (!created) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung hoặc đính kèm ảnh.' })
  }
  res.status(201).json(created)
}))

router.put('/comments/:commentId', requireAuth, uploadCommentImages.array('images', MAX_COMMENT_IMAGES), asyncHandler(async (req, res) => {
  const updated = await updateComment(req.userId, req.params.commentId, req.body ?? {}, req.files)
  if (!updated) {
    return res.status(400).json({ error: 'Không tìm thấy bình luận, bạn không phải chủ bình luận, hoặc bình luận cần có nội dung/ảnh.' })
  }
  res.json(updated)
}))

router.delete('/comments/:commentId', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deleteComment(req.userId, req.params.commentId)
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy bình luận hoặc bạn không phải chủ bình luận.' })
  }
  res.json({ ok: true })
}))

router.post('/comments/:commentId/reaction', requireAuth, asyncHandler(async (req, res) => {
  const { reaction } = req.body ?? {}
  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ error: 'Phản ứng không hợp lệ.' })
  }
  res.json(await toggleCommentReaction(req.params.commentId, req.userId, reaction))
}))

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
        error: 'Vui lòng nhập tiêu đề và cung cấp đúng 1 nguồn nội dung: dán link video hoặc tải file ảnh/video lên, không cả hai.',
      })
    }
    res.status(201).json(post)
  }),
)

router.put('/posts/:id', requireAuth, asyncHandler(async (req, res) => {
  const { title, description } = req.body ?? {}
  const updated = await updatePost(req.userId, Number(req.params.id), { title, description })
  if (!updated) {
    return res.status(400).json({ error: 'Vui lòng nhập tiêu đề, hoặc bạn không phải chủ bài đăng.' })
  }
  res.json(updated)
}))

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
