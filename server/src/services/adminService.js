import { query, transaction } from '../db/connection.js'
import { getSettlementSummary } from './settlementService.js'
import { listTransactionsForUser } from './paymentIntentService.js'

function parsed(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

export async function getOverviewStats() {
  const [members, experts, venues, pendingApps, expertBookings, venueBookings, settlement] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users'),
    query('SELECT COUNT(*)::int AS count FROM experts'),
    query('SELECT COUNT(*)::int AS count FROM partner_venues'),
    query(`SELECT COUNT(*)::int AS count FROM venue_applications WHERE status = 'pending'`),
    query('SELECT COUNT(*)::int AS count FROM expert_bookings'),
    query('SELECT COUNT(*)::int AS count FROM venue_bookings'),
    getSettlementSummary(),
  ])

  const grossTotalVnd = settlement.reduce((sum, row) => sum + row.gross_total_vnd, 0)
  const commissionTotalVnd = settlement.reduce((sum, row) => sum + row.commission_total_vnd, 0)

  return {
    memberCount: members.rows[0].count,
    expertCount: experts.rows[0].count,
    venueCount: venues.rows[0].count,
    pendingVenueApplications: pendingApps.rows[0].count,
    expertBookingCount: expertBookings.rows[0].count,
    venueBookingCount: venueBookings.rows[0].count,
    grossTotalVnd,
    commissionTotalVnd,
    settlementByType: settlement,
  }
}

export async function listMembers({ limit = 100 } = {}) {
  const { rows } = await query(
    `SELECT
       u.id, u.email, u.full_name, u.phone, u.created_at,
       COALESCE(w.plan_id, 'free') AS plan_id,
       COALESCE(w.balance_vnd, 0) AS balance_vnd,
       COALESCE(w.loyalty_points, 0) AS loyalty_points,
       (SELECT COUNT(*)::int FROM expert_bookings eb WHERE eb.user_id = u.id) AS expert_booking_count,
       (SELECT COUNT(*)::int FROM venue_bookings vb WHERE vb.user_id = u.id) AS venue_booking_count,
       (SELECT COUNT(*)::int FROM website_reviews r WHERE r.user_id = u.id) AS review_count
     FROM users u
     LEFT JOIN user_wallets w ON w.user_id = u.id
     ORDER BY u.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name || '',
    phone: row.phone || '',
    createdAt: row.created_at,
    planId: row.plan_id,
    balanceVnd: row.balance_vnd,
    loyaltyPoints: row.loyalty_points,
    expertBookingCount: row.expert_booking_count,
    venueBookingCount: row.venue_booking_count,
    reviewCount: row.review_count,
  }))
}

export async function listExpertsAdmin() {
  const { rows } = await query(
    `SELECT
       e.*,
       (SELECT COUNT(*)::int FROM expert_bookings eb WHERE eb.expert_id = e.id) AS booking_count
     FROM experts e
     ORDER BY e.rating_avg DESC`,
  )
  return rows.map((row) => {
    const certifications = parsed(row.certifications) ?? []
    return {
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      clinicName: row.clinic_name,
      areaVi: row.area_vi,
      bioVi: row.bio_vi,
      ratingAvg: row.rating_avg,
      reviewCount: (parsed(row.reviews) ?? []).length,
      bookingCount: row.booking_count,
      consultationFeeVnd: row.consultation_fee_vnd,
      availableSlots: parsed(row.available_slots) ?? [],
      certifications,
      certificationCount: certifications.length,
      unverifiedCertificationCount: certifications.filter((c) => !c.verified).length,
    }
  })
}

// id ổn định kiểu bs_<tên_không_dấu>, thêm số đếm nếu trùng — chuyên gia thêm qua Admin không có
// đánh giá/mức phí niêm yết sẵn nên khởi tạo rating_avg=0, reviews=[] giống 1 hồ sơ vừa tạo thật.
export async function createExpert(input) {
  const baseId = `bs_${slugify(input.name)}`
  let id = baseId
  let suffix = 1
  while ((await query('SELECT 1 FROM experts WHERE id = $1', [id])).rows.length > 0) {
    suffix += 1
    id = `${baseId}_${suffix}`
  }

  await query(
    `INSERT INTO experts
      (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
     VALUES ($1,$2,$3,$4,$5,$6,'[]',0,'[]',$7,$8)`,
    [id, input.name, input.specialty, input.clinicName, input.areaVi, input.bioVi,
      JSON.stringify(input.availableSlots ?? []), input.consultationFeeVnd ?? 0],
  )
  return id
}

export async function updateExpert(id, input) {
  const { rows } = await query(
    `UPDATE experts SET
       name = $2, specialty = $3, clinic_name = $4, area_vi = $5, bio_vi = $6,
       available_slots = $7, consultation_fee_vnd = $8
     WHERE id = $1 RETURNING id`,
    [id, input.name, input.specialty, input.clinicName, input.areaVi, input.bioVi,
      JSON.stringify(input.availableSlots ?? []), input.consultationFeeVnd ?? 0],
  )
  return rows[0] ?? null
}

export async function updateExpertCertifications(id, certifications) {
  const { rows } = await query(
    `UPDATE experts SET certifications = $2 WHERE id = $1 RETURNING id`,
    [id, JSON.stringify(certifications ?? [])],
  )
  return rows[0] ?? null
}

// Mọi chuyên gia đều có sẵn 1 dòng expert_accounts (đăng nhập demo, xem seedExpertAccounts) — xoá
// dòng đó trước trong CÙNG transaction, nếu không thì experts luôn vướng lỗi khoá ngoại dù chuyên
// gia đó chưa hề có lịch hẹn nào. expert_bookings.expert_id vẫn không có ON DELETE CASCADE (cố ý,
// không tự xoá lịch sử booking của người dùng), nên 23503 ở bước xoá experts nghĩa là đã có lịch hẹn.
export async function deleteExpert(id) {
  try {
    return await transaction(async (client) => {
      await client.query('DELETE FROM expert_accounts WHERE expert_id = $1', [id])
      const { rows } = await client.query('DELETE FROM experts WHERE id = $1 RETURNING id', [id])
      return { deleted: rows.length > 0 }
    })
  } catch (error) {
    if (error.code === '23503') {
      return { deleted: false, reason: 'has_bookings' }
    }
    throw error
  }
}

export const listMemberTransactions = listTransactionsForUser

export async function listSponsoredPlacementsAdmin() {
  const { rows } = await query('SELECT * FROM sponsored_products ORDER BY id')
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sponsorName: row.sponsor_name,
    active: row.active,
    placements: parsed(row.placements) ?? [],
  }))
}

export async function updateSponsoredPlacement(id, placements) {
  const { rows } = await query(
    `UPDATE sponsored_products SET placements = $2 WHERE id = $1 RETURNING id, placements`,
    [id, JSON.stringify(placements ?? [])],
  )
  return rows[0]
}
