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
import {
  createThreadForBooking,
  getThreadForUser,
  listMessages,
  postUserMessage,
  getMessageRawById,
  getThreadOwnerUserId,
} from '../services/consultationService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// --- 9D: Marketplace chuyên gia (DEMO) ---
// Toàn bộ dữ liệu chuyên gia/đánh giá/chứng chỉ là dữ liệu mẫu, KHÔNG phải mạng lưới
// đối tác đã ký kết thật — xem cờ "verified" trên từng chứng chỉ.

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listExperts(req.query.area))
}))

router.get('/areas', asyncHandler(async (req, res) => {
  res.json(await listAreas())
}))

router.get('/bookings/mine', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listBookingsForUser(req.userId))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const expert = await getExpertById(req.params.id)
  if (!expert) {
    return res.status(404).json({ error: 'Không tìm thấy chuyên gia.' })
  }
  res.json(expert)
}))

router.get('/:id/my-bookings', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listBookingsForUserAndExpert(req.userId, req.params.id))
}))

router.post('/:id/book', requireAuth, asyncHandler(async (req, res) => {
  const { slot, consent } = req.body ?? {}
  if (typeof slot !== 'string' || !slot) {
    return res.status(400).json({ error: 'Vui lòng chọn một khung giờ.' })
  }
  if (consent !== true) {
    return res.status(400).json({
      error: 'Cần đồng ý gửi hồ sơ cá nhân cho chuyên gia xem trước khi đặt lịch.',
    })
  }

  const booking = await createBooking(req.userId, req.params.id, slot)
  if (!booking) {
    return res.status(400).json({ error: 'Chuyên gia hoặc khung giờ không hợp lệ.' })
  }
  await createThreadForBooking(booking.id, req.userId)
  res.status(201).json(booking)
}))

router.get('/bookings/:bookingId/thread', requireAuth, asyncHandler(async (req, res) => {
  const result = await getThreadForUser(req.userId, Number(req.params.bookingId))
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện tư vấn.' })
  }
  const messages = await listMessages(result.thread.id)
  res.json({ status: result.thread.status, messages })
}))

router.post('/bookings/:bookingId/thread/messages', requireAuth, asyncHandler(async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 1000) : ''
  if (!text) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung tin nhắn.' })
  }
  const result = await getThreadForUser(req.userId, Number(req.params.bookingId))
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện tư vấn.' })
  }
  const message = await postUserMessage(result.thread.id, text)
  res.status(201).json(message)
}))

// Ảnh chuyên gia gửi trong cuộc trò chuyện — chỉ phục vụ cho đúng người dùng sở hữu booking đó.
router.get('/consultations/messages/:messageId/image', requireAuth, asyncHandler(async (req, res) => {
  const message = await getMessageRawById(Number(req.params.messageId))
  if (!message?.image_path) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }
  const ownerUserId = await getThreadOwnerUserId(message.thread_id)
  if (!ownerUserId || Number(ownerUserId) !== Number(req.userId)) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }
  res.setHeader('Content-Type', message.image_mime || 'image/jpeg')
  res.sendFile(message.image_path)
}))

router.get('/bookings/:bookingId', requireAuth, asyncHandler(async (req, res) => {
  const booking = await getBookingForUser(req.userId, Number(req.params.bookingId))
  if (!booking) {
    return res.status(404).json({ error: 'Không tìm thấy lịch hẹn.' })
  }
  res.json(booking)
}))

router.patch('/bookings/:bookingId/link-report', requireAuth, asyncHandler(async (req, res) => {
  const { reportId } = req.body ?? {}
  const booking = await linkReportToBooking(req.userId, Number(req.params.bookingId), Number(reportId))
  if (!booking) {
    return res.status(400).json({ error: 'Không thể liên kết báo cáo — kiểm tra lại lịch hẹn hoặc báo cáo.' })
  }
  res.json(booking)
}))

export default router
