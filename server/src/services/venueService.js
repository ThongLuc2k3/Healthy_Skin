import crypto from 'node:crypto'
import { query, transaction } from '../db/connection.js'

function toVenueShape(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    addressVi: row.address_vi,
    areaVi: row.area_vi,
    descriptionVi: row.description_vi,
    coverImageUrl: row.cover_image_url,
  }
}

function toServiceShape(row) {
  return {
    id: row.id,
    venueId: row.venue_id,
    nameVi: row.name_vi,
    priceVnd: row.price_vnd,
    durationMinutes: row.duration_minutes,
  }
}

function toBookingShape(row) {
  return {
    id: row.id,
    serviceId: row.service_id,
    userVoucherId: row.user_voucher_id,
    scheduledAt: row.scheduled_at,
    finalPriceVnd: row.final_price_vnd,
    status: row.status,
    invoiceCode: row.invoice_code,
    createdAt: row.created_at,
  }
}

export async function listVenues(category) {
  const { rows } = await query(
    `SELECT * FROM partner_venues ${category ? 'WHERE category = $1' : ''} ORDER BY name`,
    category ? [category] : [],
  )
  return rows.map(toVenueShape)
}

export async function listCategories() {
  const { rows } = await query('SELECT DISTINCT category FROM partner_venues ORDER BY category')
  return rows.map((row) => row.category)
}

export async function getVenueById(id) {
  const { rows } = await query('SELECT * FROM partner_venues WHERE id = $1', [id])
  return rows[0] ? toVenueShape(rows[0]) : null
}

export async function listServicesForVenue(venueId) {
  const { rows } = await query(
    'SELECT * FROM partner_services WHERE venue_id = $1 ORDER BY id', [venueId],
  )
  return rows.map(toServiceShape)
}

export async function getServiceRawById(id) {
  const { rows } = await query('SELECT * FROM partner_services WHERE id = $1', [id])
  return rows[0]
}

function generateInvoiceCode() {
  return `HS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
}

// Đặt dịch vụ tại trung tâm đối tác — DEMO: đặt cọc/thanh toán là giả lập, invoice_code là mã
// hoá đơn nội bộ của web, KHÔNG phải hoá đơn điện tử hợp lệ theo quy định thuế.
export async function bookService(userId, serviceId, { userVoucherId, scheduledAt } = {}) {
  const service = await getServiceRawById(serviceId)
  if (!service) return null

  let finalPrice = service.price_vnd
  let appliedUserVoucherId = null

  if (userVoucherId) {
    const { rows } = await query(
      `SELECT uv.*, v.discount_type, v.discount_value FROM user_vouchers uv
       JOIN vouchers v ON v.id = uv.voucher_id
       WHERE uv.id = $1 AND uv.user_id = $2 AND uv.used_at IS NULL`,
      [userVoucherId, userId],
    )
    const voucher = rows[0]
    if (voucher) {
      finalPrice = voucher.discount_type === 'percent'
        ? Math.round(finalPrice * (1 - voucher.discount_value / 100))
        : Math.max(finalPrice - voucher.discount_value, 0)
      appliedUserVoucherId = voucher.id
    }
  }

  const invoiceCode = generateInvoiceCode()

  return transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO venue_bookings (user_id,service_id,user_voucher_id,scheduled_at,final_price_vnd,status,invoice_code)
       VALUES ($1,$2,$3,$4,$5,'confirmed',$6) RETURNING *`,
      [userId, serviceId, appliedUserVoucherId, scheduledAt ?? new Date(), finalPrice, invoiceCode],
    )
    if (appliedUserVoucherId) {
      await client.query('UPDATE user_vouchers SET used_at = NOW() WHERE id = $1', [appliedUserVoucherId])
    }
    return toBookingShape(rows[0])
  })
}

export async function listBookingsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM venue_bookings WHERE user_id = $1 ORDER BY created_at DESC', [userId],
  )
  return rows.map(toBookingShape)
}

export async function getBookingForUser(userId, id) {
  const { rows } = await query(
    'SELECT * FROM venue_bookings WHERE id = $1 AND user_id = $2', [id, userId],
  )
  return rows[0] ? toBookingShape(rows[0]) : null
}
