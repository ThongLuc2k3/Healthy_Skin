import db from '../db/connection.js'
import { getExpertById } from './expertService.js'
import { getExpertReportRawById } from './expertReportService.js'

const insertStmt = db.prepare(`
  INSERT INTO expert_bookings (user_id, expert_id, slot, status)
  VALUES (@user_id, @expert_id, @slot, 'booked')
`)
const getByIdStmt = db.prepare('SELECT * FROM expert_bookings WHERE id = ?')
const listByUserStmt = db.prepare('SELECT * FROM expert_bookings WHERE user_id = ? ORDER BY created_at DESC')
const listByUserAndExpertStmt = db.prepare(
  'SELECT * FROM expert_bookings WHERE user_id = ? AND expert_id = ? ORDER BY created_at DESC',
)
const linkReportStmt = db.prepare(
  `UPDATE expert_bookings SET consultation_report_id = ?, status = 'completed' WHERE id = ?`,
)

function toShape(row) {
  if (!row) return null
  const expert = getExpertById(row.expert_id)
  const report = row.consultation_report_id ? getExpertReportRawById(row.consultation_report_id) : null
  return {
    id: row.id,
    expert: expert ? { id: expert.id, name: expert.name, specialty: expert.specialty } : null,
    slot: row.slot,
    status: row.status,
    consultationReport: report
      ? { id: report.id, originalName: report.original_name, fileUrl: `/profile/expert-report/${report.id}/file` }
      : null,
    createdAt: row.created_at,
  }
}

export function createBooking(userId, expertId, slot) {
  const expert = getExpertById(expertId)
  if (!expert) return null
  if (!expert.available_slots.includes(slot)) return null

  const { lastInsertRowid } = insertStmt.run({ user_id: userId, expert_id: expertId, slot })
  return toShape(getByIdStmt.get(lastInsertRowid))
}

export function listBookingsForUser(userId) {
  return listByUserStmt.all(userId).map(toShape)
}

export function listBookingsForUserAndExpert(userId, expertId) {
  return listByUserAndExpertStmt.all(userId, expertId).map(toShape)
}

// Trả về row thô — dùng nội bộ để kiểm tra ownership trước khi trả shape công khai.
export function getBookingRawById(id) {
  return getByIdStmt.get(id)
}

export function getBookingForUser(userId, id) {
  const row = getByIdStmt.get(id)
  if (!row || row.user_id !== userId) return null
  return toShape(row)
}

// Liên kết báo cáo đã upload qua luồng 9C (POST /api/profile/expert-report) vào lịch hẹn —
// tái dùng dữ liệu đã có thay vì tự viết lại logic upload file.
export function linkReportToBooking(userId, bookingId, reportId) {
  const booking = getByIdStmt.get(bookingId)
  if (!booking || booking.user_id !== userId) return null

  const report = getExpertReportRawById(reportId)
  if (!report || report.user_id !== userId) return null

  linkReportStmt.run(reportId, bookingId)
  return toShape(getByIdStmt.get(bookingId))
}
