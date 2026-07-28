import { query } from '../db/connection.js'
import { getExpertById } from './expertService.js'
import { getExpertReportRawById } from './expertReportService.js'

async function toShape(row) {
  if (!row) return null
  const [expert, report] = await Promise.all([
    getExpertById(row.expert_id),
    row.consultation_report_id ? getExpertReportRawById(row.consultation_report_id) : null,
  ])
  return {
    id: row.id,
    expert: expert ? { id: expert.id, name: expert.name, specialty: expert.specialty } : null,
    slot: row.slot, status: row.status,
    consultationReport: report
      ? { id: report.id, originalName: report.original_name,
          fileUrl: `/profile/expert-report/${report.id}/file` }
      : null,
    createdAt: row.created_at,
  }
}

export async function createBooking(userId, expertId, slot) {
  const expert = await getExpertById(expertId)
  if (!expert?.available_slots.includes(slot)) return null
  const { rows } = await query(
    `INSERT INTO expert_bookings (user_id,expert_id,slot,status)
     VALUES ($1,$2,$3,'booked') RETURNING *`,
    [userId, expertId, slot],
  )
  return toShape(rows[0])
}

export async function listBookingsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM expert_bookings WHERE user_id=$1 ORDER BY created_at DESC',
    [userId],
  )
  return Promise.all(rows.map(toShape))
}

export async function listBookingsForUserAndExpert(userId, expertId) {
  const { rows } = await query(
    'SELECT * FROM expert_bookings WHERE user_id=$1 AND expert_id=$2 ORDER BY created_at DESC',
    [userId, expertId],
  )
  return Promise.all(rows.map(toShape))
}

export async function getBookingRawById(id) {
  const { rows } = await query('SELECT * FROM expert_bookings WHERE id=$1', [id])
  return rows[0]
}

export async function getBookingForUser(userId, id) {
  const row = await getBookingRawById(id)
  if (!row || Number(row.user_id) !== Number(userId)) return null
  return toShape(row)
}

export async function linkReportToBooking(userId, bookingId, reportId) {
  const [booking, report] = await Promise.all([
    getBookingRawById(bookingId), getExpertReportRawById(reportId),
  ])
  if (!booking || Number(booking.user_id) !== Number(userId)) return null
  if (!report || Number(report.user_id) !== Number(userId)) return null
  const { rows } = await query(
    `UPDATE expert_bookings SET consultation_report_id=$1,status='completed'
     WHERE id=$2 RETURNING *`,
    [reportId, bookingId],
  )
  return toShape(rows[0])
}
