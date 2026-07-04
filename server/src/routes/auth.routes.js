import { Router } from 'express'
import { createUser, findUserByEmail, findUserById, verifyPassword } from '../services/userService.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ.' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    }

    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email này đã được đăng ký.' })
    }

    const user = await createUser(email, password)
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user.id, email: user.email } })
  }),
)

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    const user = findUserByEmail(email)
    const passwordMatches = user && (await verifyPassword(password ?? '', user.password_hash))
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
    }

    const token = signToken(user)
    res.json({ token, user: { id: user.id, email: user.email } })
  }),
)

router.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.userId)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' })
  }
  res.json({ id: user.id, email: user.email })
})

export default router
