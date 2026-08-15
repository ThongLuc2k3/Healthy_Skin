import { query } from '../db/connection.js'

// Số câu hỏi Trợ Lý miễn phí mỗi ngày cho tài khoản chưa mua thêm gói.
export const FREE_DAILY_QUESTIONS = 5

// Nạp ví theo demo: quy đổi 10% số tiền nạp thành điểm tích luỹ (dùng đổi voucher ở Kho Voucher).
const POINTS_PER_VND = 0.1

// Các gói Trợ Lý demo — mua xong cộng thẳng số câu vào "kho câu hỏi đã mua", trừ dần khi hết
// quota miễn phí trong ngày. Giá/số câu chỉ mang tính minh hoạ, chưa chốt công thức tính phí thật.
export const CHAT_PLANS = [
  { id: 'basic_10', name: 'Gói Trợ Lý 10 câu', questionQuota: 10, priceVnd: 15000 },
  { id: 'plus_30', name: 'Gói Trợ Lý 30 câu', questionQuota: 30, priceVnd: 39000 },
  { id: 'pro_100', name: 'Gói Trợ Lý 100 câu', questionQuota: 100, priceVnd: 109000 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

async function getOrCreateWallet(userId) {
  const { rows } = await query('SELECT * FROM user_wallets WHERE user_id = $1', [userId])
  if (rows[0]) return rows[0]

  const inserted = await query(
    `INSERT INTO user_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId],
  )
  return inserted.rows[0]
}

async function getOrCreateUsageToday(userId) {
  const date = todayStr()
  const { rows } = await query(
    'SELECT * FROM chat_usage_log WHERE user_id = $1 AND date = $2',
    [userId, date],
  )
  if (rows[0]) return rows[0]

  const inserted = await query(
    `INSERT INTO chat_usage_log (user_id, date) VALUES ($1, $2)
     ON CONFLICT (user_id, date) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId, date],
  )
  return inserted.rows[0]
}

function toWalletShape(walletRow, usageRow) {
  const askedToday = usageRow?.question_count || 0
  const remainingFree = Math.max(FREE_DAILY_QUESTIONS - askedToday, 0)
  return {
    balanceVnd: walletRow?.balance_vnd || 0,
    loyaltyPoints: walletRow?.loyalty_points || 0,
    planId: walletRow?.plan_id || 'free',
    purchasedQuestionsRemaining: walletRow?.purchased_questions_remaining || 0,
    askedToday,
    remainingFreeToday: remainingFree,
  }
}

export async function getWalletStatus(userId) {
  const [wallet, usage] = await Promise.all([getOrCreateWallet(userId), getOrCreateUsageToday(userId)])
  return toWalletShape(wallet, usage)
}

// Kiểm tra + ghi nhận một lượt hỏi Trợ Lý. Trả về { allowed, status }. Ưu tiên trừ vào quota
// miễn phí trong ngày trước, hết thì trừ vào kho câu hỏi đã mua; hết cả hai thì allowed=false
// để route trả lời gợi ý nâng cấp gói/đặt lịch chuyên gia thay vì lỗi chung chung.
export async function consumeChatQuestion(userId) {
  const wallet = await getOrCreateWallet(userId)
  const usage = await getOrCreateUsageToday(userId)

  if (usage.question_count < FREE_DAILY_QUESTIONS) {
    const updated = await query(
      `UPDATE chat_usage_log SET question_count = question_count + 1
       WHERE user_id = $1 AND date = $2 RETURNING *`,
      [userId, todayStr()],
    )
    return { allowed: true, status: toWalletShape(wallet, updated.rows[0]) }
  }

  if (wallet.purchased_questions_remaining > 0) {
    const updatedWallet = await query(
      `UPDATE user_wallets SET purchased_questions_remaining = purchased_questions_remaining - 1,
       updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId],
    )
    return { allowed: true, status: toWalletShape(updatedWallet.rows[0], usage) }
  }

  return { allowed: false, status: toWalletShape(wallet, usage) }
}

export async function topupWallet(userId, amountVnd) {
  const amount = Math.max(Math.floor(Number(amountVnd) || 0), 0)
  if (amount <= 0) {
    throw new Error('Số tiền nạp không hợp lệ.')
  }
  const points = Math.floor(amount * POINTS_PER_VND)

  await getOrCreateWallet(userId)
  const { rows } = await query(
    `UPDATE user_wallets
     SET balance_vnd = balance_vnd + $2, loyalty_points = loyalty_points + $3, updated_at = NOW()
     WHERE user_id = $1 RETURNING *`,
    [userId, amount, points],
  )

  const usage = await getOrCreateUsageToday(userId)
  return toWalletShape(rows[0], usage)
}

export async function purchasePlan(userId, planId) {
  const plan = CHAT_PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error('Gói Trợ Lý không hợp lệ.')
  }

  await getOrCreateWallet(userId)
  const { rows } = await query(
    `UPDATE user_wallets
     SET plan_id = $2, purchased_questions_remaining = purchased_questions_remaining + $3,
     updated_at = NOW() WHERE user_id = $1 RETURNING *`,
    [userId, plan.id, plan.questionQuota],
  )

  const usage = await getOrCreateUsageToday(userId)
  return toWalletShape(rows[0], usage)
}
