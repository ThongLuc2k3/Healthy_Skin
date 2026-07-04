import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listExperts, listAreas, getExpertById } from '../services/expertService.js'
import {
  createBooking,
  listBookingsForUser,
  getBookingForUser,
  listBookingsForUserAndExpert,
  linkReportToBooking,
} from '../services/bookingService.js'

const router = Router()

// --- 9D: Marketplace chuyên gia (DEMO) ---
// Toàn bộ dữ liệu chuyên gia/đánh giá/chứng chỉ là dữ liệu mẫu, KHÔNG phải mạng lưới
// đối tác đã ký kết thật — xem cờ "verified" trên từng chứng chỉ.

router.get('/', (req, res) => {
  res.json(listExperts(req.query.area))
})

router.get('/areas', (req, res) => {
  res.json(listAreas())
})

router.get('/bookings/mine', requireAuth, (req, res) => {
  res.json(listBookingsForUser(req.userId))
})

router.get('/:id', (req, res) => {
  const expert = getExpertById(req.params.id)
  if (!expert) {
    return res.status(404).json({ error: 'Không tìm thấy chuyên gia.' })
  }
  res.json(expert)
})

router.get('/:id/my-bookings', requireAuth, (req, res) => {
  res.json(listBookingsForUserAndExpert(req.userId, req.params.id))
})

router.post('/:id/book', requireAuth, (req, res) => {
  const { slot } = req.body ?? {}
  if (typeof slot !== 'string' || !slot) {
    return res.status(400).json({ error: 'Vui lòng chọn một khung giờ.' })
  }

  const booking = createBooking(req.userId, req.params.id, slot)
  if (!booking) {
    return res.status(400).json({ error: 'Chuyên gia hoặc khung giờ không hợp lệ.' })
  }
  res.status(201).json(booking)
})

router.get('/bookings/:bookingId', requireAuth, (req, res) => {
  const booking = getBookingForUser(req.userId, Number(req.params.bookingId))
  if (!booking) {
    return res.status(404).json({ error: 'Không tìm thấy lịch hẹn.' })
  }
  res.json(booking)
})

router.patch('/bookings/:bookingId/link-report', requireAuth, (req, res) => {
  const { reportId } = req.body ?? {}
  const booking = linkReportToBooking(req.userId, Number(req.params.bookingId), Number(reportId))
  if (!booking) {
    return res.status(400).json({ error: 'Không thể liên kết báo cáo — kiểm tra lại lịch hẹn hoặc báo cáo.' })
  }
  res.json(booking)
})

export default router
