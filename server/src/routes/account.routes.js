import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  getAccountInfo,
  updateAccountInfo,
  linkBankAccount,
  unlinkBankAccount,
  BANK_NAMES,
} from '../services/accountService.js'

const router = Router()

// Thông tin định danh tài khoản (họ tên/SĐT/ngày sinh/ngân hàng liên kết) — khác với /api/profile
// vốn là hồ sơ DA (loại da/dị ứng/mục tiêu). Trang "Tài khoản của tôi" ở frontend gọi nhóm route này.

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(await getAccountInfo(req.userId))
}))

router.get('/bank-options', (req, res) => {
  res.json(BANK_NAMES)
})

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const { fullName, phone, dateOfBirth, addressVi, socialLink } = req.body ?? {}
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập họ tên.' })
  }
  res.json(await updateAccountInfo(req.userId, { fullName, phone, dateOfBirth, addressVi, socialLink }))
}))

router.post('/bank-link', requireAuth, asyncHandler(async (req, res) => {
  const { bankName, accountNumber } = req.body ?? {}
  const result = await linkBankAccount(req.userId, { bankName, accountNumber })
  if (result.error) {
    return res.status(400).json({ error: result.error })
  }
  res.json(result.account)
}))

router.delete('/bank-link', requireAuth, asyncHandler(async (req, res) => {
  res.json(await unlinkBankAccount(req.userId))
}))

export default router
