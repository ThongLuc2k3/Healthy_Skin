import { query } from '../db/connection.js'

const BANK_NAMES = ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'ACB', 'VPBank', 'TPBank', 'Sacombank']

function toShape(row) {
  return {
    email: row.email,
    fullName: row.full_name || '',
    phone: row.phone || '',
    dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : '',
    addressVi: row.address_vi || '',
    socialLink: row.social_link || '',
    bankName: row.bank_name || null,
    bankAccountMasked: row.bank_account_masked || null,
    bankLinkedAt: row.bank_linked_at || null,
    createdAt: row.created_at,
  }
}

export async function getAccountInfo(userId) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId])
  return rows[0] ? toShape(rows[0]) : null
}

export async function updateAccountInfo(userId, { fullName, phone, dateOfBirth, addressVi, socialLink }) {
  const { rows } = await query(
    `UPDATE users SET full_name = $2, phone = $3, date_of_birth = $4, address_vi = $5, social_link = $6
     WHERE id = $1 RETURNING *`,
    [userId, fullName?.trim() || null, phone?.trim() || null, dateOfBirth || null, addressVi?.trim() || null, socialLink?.trim() || null],
  )
  return rows[0] ? toShape(rows[0]) : null
}

// Liên kết ngân hàng demo — KHÔNG gọi cổng ngân hàng thật, chỉ lưu tên ngân hàng + 4 số cuối để
// hiển thị giống trải nghiệm đã liên kết thật, phục vụ trình diễn (xem ghi chú ở schema.sql).
export async function linkBankAccount(userId, { bankName, accountNumber }) {
  if (!BANK_NAMES.includes(bankName)) {
    return { error: 'Ngân hàng không hợp lệ.' }
  }
  const digitsOnly = String(accountNumber ?? '').replace(/\D/g, '')
  if (digitsOnly.length < 6) {
    return { error: 'Số tài khoản không hợp lệ.' }
  }
  const masked = `•••• ${digitsOnly.slice(-4)}`

  const { rows } = await query(
    `UPDATE users SET bank_name = $2, bank_account_masked = $3, bank_linked_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId, bankName, masked],
  )
  return { account: toShape(rows[0]) }
}

export async function unlinkBankAccount(userId) {
  const { rows } = await query(
    `UPDATE users SET bank_name = NULL, bank_account_masked = NULL, bank_linked_at = NULL
     WHERE id = $1 RETURNING *`,
    [userId],
  )
  return rows[0] ? toShape(rows[0]) : null
}

export { BANK_NAMES }
