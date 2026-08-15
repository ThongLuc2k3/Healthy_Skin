import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  listVenues,
  listCategories,
  getVenueById,
  listServicesForVenue,
  bookService,
  listBookingsForUser,
  getBookingForUser,
} from '../services/venueService.js'

const router = Router()

// --- DEMO: "Dịch Vụ Quanh Bạn" ---
// Trung tâm/spa/phòng khám/gym là dữ liệu mẫu minh hoạ, KHÔNG phải mạng lưới đối tác đã ký kết
// thật. Đặt cọc/thanh toán ở đây đều là mô phỏng, hoá đơn sinh ra là hoá đơn nội bộ của web.

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listVenues(req.query.category))
}))

router.get('/categories', asyncHandler(async (req, res) => {
  res.json(await listCategories())
}))

router.get('/bookings/mine', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listBookingsForUser(req.userId))
}))

router.get('/bookings/:bookingId', requireAuth, asyncHandler(async (req, res) => {
  const booking = await getBookingForUser(req.userId, Number(req.params.bookingId))
  if (!booking) {
    return res.status(404).json({ error: 'Không tìm thấy lịch đặt dịch vụ.' })
  }
  res.json(booking)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const venue = await getVenueById(req.params.id)
  if (!venue) {
    return res.status(404).json({ error: 'Không tìm thấy trung tâm.' })
  }
  const services = await listServicesForVenue(req.params.id)
  res.json({ ...venue, services })
}))

router.post('/services/:serviceId/book', requireAuth, asyncHandler(async (req, res) => {
  const serviceId = Number(req.params.serviceId)
  const { userVoucherId } = req.body ?? {}
  if (!Number.isInteger(serviceId)) {
    return res.status(400).json({ error: 'Dịch vụ không hợp lệ.' })
  }

  const booking = await bookService(req.userId, serviceId, {
    userVoucherId: userVoucherId ? Number(userVoucherId) : null,
  })
  if (!booking) {
    return res.status(400).json({ error: 'Không thể đặt dịch vụ này.' })
  }
  res.status(201).json(booking)
}))

export default router
