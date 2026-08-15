import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { WalletIcon, SparklesIcon, CheckCircleIcon } from '../components/Icons'

const TOPUP_PRESETS = [20000, 50000, 100000]

function formatVnd(amount) {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function PricingPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [plans, setPlans] = useState([])
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/chat/plans').then(setPlans).catch(() => {})
    if (user) {
      apiClient.get('/chat/wallet', { auth: true }).then(setWallet).catch(() => {})
    }
  }, [user])

  async function handleUpgrade(planId) {
    setBusyId(planId)
    setError('')
    setMessage('')
    try {
      const status = await apiClient.post('/chat/upgrade', { planId }, { auth: true })
      setWallet(status)
      setMessage('Đã kích hoạt gói (demo, không phát sinh thanh toán thật).')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  async function handleTopup(amount) {
    setBusyId(`topup_${amount}`)
    setError('')
    setMessage('')
    try {
      const status = await apiClient.post('/chat/topup', { amountVnd: amount }, { auth: true })
      setWallet(status)
      setMessage(`Đã nạp ${formatVnd(amount)} vào ví (demo, không phát sinh thanh toán thật).`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#17353D]">
            Gói Trợ Lý
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#64748B]">
            Miễn phí 5 câu hỏi mỗi ngày để hỏi Trợ Lý về cách dùng app hoặc thành phần cơ bản. Cần
            hỏi nhiều hơn thì mua thêm gói hoặc nạp ví bên dưới. Mọi giao dịch ở đây đều là{' '}
            <span className="font-semibold text-[#2C8E92]">demo minh hoạ</span>, chưa tích hợp cổng
            thanh toán thật. Nếu bạn cần tư vấn sâu về tình trạng cụ thể, nên{' '}
            <Link to="/experts" className="font-semibold text-[#2C8E92] underline">
              đặt lịch với chuyên gia thật
            </Link>{' '}
            thay vì hỏi thêm Trợ Lý.
          </p>
        </motion.div>

        {!user ? (
          <div className="mt-10 rounded-2xl border border-[#2C8E92]/20 bg-white p-8 text-center shadow-xs">
            <p className="text-sm text-[#64748B]">
              Cần <Link to="/login" className="font-bold text-[#2C8E92] hover:underline">đăng nhập</Link> để mua gói hoặc nạp ví.
            </p>
          </div>
        ) : (
          <>
            {wallet && (
              <div className="mt-10 rounded-2xl border border-[#E8EEF0] bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92]">
                    <WalletIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#17353D]">Ví của bạn</p>
                    <p className="text-xs text-[#64748B]">
                      Còn {wallet.remainingFreeToday} câu miễn phí hôm nay · {wallet.purchasedQuestionsRemaining} câu đã mua · {wallet.loyaltyPoints} điểm tích luỹ
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#2C8E92]/10 px-4 py-1.5 text-xs font-bold text-[#2C8E92]">
                  Số dư: {formatVnd(wallet.balanceVnd)}
                </span>
              </div>
            )}

            {message && (
              <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-[28px] border border-[#E8EEF0] bg-white p-7 shadow-xs flex flex-col">
                  <SparklesIcon className="h-6 w-6 text-[#2C8E92]" />
                  <h3 className="mt-4 text-lg font-bold text-[#17353D]">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-black text-[#2C8E92]">{formatVnd(plan.priceVnd)}</p>
                  <p className="mt-1 text-sm text-[#64748B]">Cộng thêm {plan.questionQuota} câu hỏi</p>
                  <button
                    type="button"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={busyId === plan.id}
                    className="mt-6 rounded-full bg-[#2C8E92] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#17353D] disabled:opacity-60"
                  >
                    {busyId === plan.id ? 'Đang xử lý...' : 'Mua gói (demo)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[28px] border border-[#E8EEF0] bg-white p-7 shadow-xs">
              <h3 className="text-lg font-bold text-[#17353D]">Nạp ví</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Nạp ví được cộng thêm điểm tích luỹ (10% giá trị nạp), dùng đổi voucher ở Kho Voucher.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {TOPUP_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleTopup(amount)}
                    disabled={busyId === `topup_${amount}`}
                    className="flex items-center gap-2 rounded-full border border-[#2C8E92]/30 bg-[#F7FBFC] px-5 py-2.5 text-sm font-bold text-[#2C8E92] transition hover:bg-[#67D6E8]/10 disabled:opacity-60"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {busyId === `topup_${amount}` ? 'Đang xử lý...' : `Nạp ${formatVnd(amount)}`}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PricingPage
