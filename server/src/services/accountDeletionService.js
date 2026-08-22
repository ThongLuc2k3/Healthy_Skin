import fs from 'node:fs'
import { transaction } from '../db/connection.js'

// Xoá tài khoản và toàn bộ dữ liệu liên quan — đúng cam kết "người dùng có quyền yêu cầu xoá" trong
// tài liệu chính sách/mo-ta-san-pham.md. DELETE FROM users cascade dọn sạch mọi bảng tham chiếu tới
// users(id) ON DELETE CASCADE (profiles, scan_history, expert_reports, expert_bookings ->
// consultation_threads -> consultation_messages, user_wallets, chat_usage_log, user_vouchers,
// venue_bookings, website_reviews, consent_events, payment_intents) — nhưng cascade chỉ xoá DÒNG
// TRONG DATABASE, không đụng tới file trên đĩa, nên phải tự đọc đường dẫn TRƯỚC khi xoá rồi unlink
// SAU khi transaction commit.
export async function deleteAccount(userId) {
  const filePaths = await transaction(async (client) => {
    const [faceRes, reportRes, reviewRes, messageRes] = await Promise.all([
      client.query('SELECT face_photo_path FROM profiles WHERE user_id = $1 AND face_photo_path IS NOT NULL', [userId]),
      client.query('SELECT file_path FROM expert_reports WHERE user_id = $1', [userId]),
      client.query('SELECT image_path FROM website_reviews WHERE user_id = $1 AND image_path IS NOT NULL', [userId]),
      client.query(
        `SELECT cm.image_path FROM consultation_messages cm
         JOIN consultation_threads ct ON ct.id = cm.thread_id
         JOIN expert_bookings eb ON eb.id = ct.booking_id
         WHERE eb.user_id = $1 AND cm.image_path IS NOT NULL`,
        [userId],
      ),
    ])

    const paths = [
      ...faceRes.rows.map((r) => r.face_photo_path),
      ...reportRes.rows.map((r) => r.file_path),
      ...reviewRes.rows.map((r) => r.image_path),
      ...messageRes.rows.map((r) => r.image_path),
    ].filter(Boolean)

    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [userId])
    if (rowCount === 0) {
      throw new Error('Không tìm thấy tài khoản để xoá.')
    }

    return paths
  })

  for (const filePath of filePaths) {
    fs.unlink(filePath, () => {})
  }

  return { ok: true, filesRemoved: filePaths.length }
}
