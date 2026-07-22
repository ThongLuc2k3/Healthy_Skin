import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import db from '../db/connection.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Cấu hình Multer để lưu ảnh upload vào thư mục public/uploads/reviews
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/reviews')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `review-${Date.now()}${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn ảnh 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh!'))
    }
  }
})

// 1. GET: Lấy danh sách đánh giá
router.get('/', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT 
        r.id, r.rating, r.title, r.content, r.image_path, r.created_at,
        u.email as author_name 
      FROM website_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `).all()

    res.json({ reviews })
  } catch (error) {
    console.error('[Get Reviews Error]:', error)
    res.status(500).json({ error: 'Lỗi khi tải danh sách đánh giá' })
  }
})

// 2. POST: Gửi đánh giá kèm ảnh (upload.single('image'))
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    const { title, content, rating = 5 } = req.body
    
    // Đường dẫn ảnh lưu trong DB
    const image_path = req.file ? `/uploads/reviews/${req.file.filename}` : null
    const image_mime = req.file ? req.file.mimetype : null

    if (!title || !content) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' })
    }

    const stmt = db.prepare(`
      INSERT INTO website_reviews (user_id, rating, title, content, image_path, image_mime)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(req.userId, Number(rating), title.trim(), content.trim(), image_path, image_mime)

    res.json({
      success: true,
      reviewId: result.lastInsertRowid,
      message: 'Gửi đánh giá kèm hình ảnh thành công!'
    })
  } catch (error) {
    console.error('[Post Review Error]:', error)
    res.status(500).json({ error: 'Không thể gửi đánh giá' })
  }
})

export default router