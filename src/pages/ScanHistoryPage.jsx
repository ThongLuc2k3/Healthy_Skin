import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { CheckCircleIcon, WarningIcon, SparklesIcon, SearchIcon, HistoryIcon, StethoscopeIcon, MapIcon } from '../components/Icons'
import { RESULT } from '../logic/matchEngine'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatVnd, formatDateTime } from '../lib/format'

const TABS = [
  { key: 'scan', label: 'Quét sản phẩm', icon: SparklesIcon },
  { key: 'transactions', label: 'Giao dịch', icon: HistoryIcon },
  { key: 'expert-bookings', label: 'Lịch hẹn chuyên gia', icon: StethoscopeIcon },
  { key: 'venue-bookings', label: 'Đặt dịch vụ', icon: MapIcon },
]

const TRANSACTION_PURPOSE_LABELS = {
  wallet_topup: 'Nạp ví',
  plan_purchase: 'Mua gói Trợ Lý',
  venue_deposit: 'Đặt cọc dịch vụ',
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState(null)

  useEffect(() => {
    apiClient.get('/chat/wallet/transactions', { auth: true }).then(setTransactions).catch(() => setTransactions([]))
  }, [])

  if (transactions === null) return <p className="text-center text-sm text-[#64748B] py-10">Đang tải...</p>
  if (transactions.length === 0) return <p className="text-center text-sm text-[#64748B] py-10">Chưa có giao dịch nào.</p>

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E8ECEE] bg-white px-5 py-4 shadow-xs">
          <div>
            <p className="font-bold text-[#0e3b33]">{TRANSACTION_PURPOSE_LABELS[t.purpose] || t.purpose}</p>
            <p className="text-xs text-[#64748B]">
              {formatDateTime(t.completedAt || t.createdAt)} · Mã: <span className="font-mono">{t.providerRef}</span>
            </p>
          </div>
          <span className="font-bold text-[#2fa98c]">{formatVnd(t.amountVnd)}</span>
        </div>
      ))}
    </div>
  )
}

function ExpertBookingsTab() {
  const [bookings, setBookings] = useState(null)

  useEffect(() => {
    apiClient.get('/experts/bookings/mine', { auth: true }).then(setBookings).catch(() => setBookings([]))
  }, [])

  if (bookings === null) return <p className="text-center text-sm text-[#64748B] py-10">Đang tải...</p>
  if (bookings.length === 0) return <p className="text-center text-sm text-[#64748B] py-10">Chưa có lịch hẹn chuyên gia nào.</p>

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Link
          key={b.id}
          to={`/my-bookings/${b.id}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E8ECEE] bg-white px-5 py-4 shadow-xs hover:border-[#2fa98c] transition"
        >
          <div>
            <p className="font-bold text-[#0e3b33]">{b.expert?.name} <span className="font-normal text-[#64748B]">· {b.expert?.specialty}</span></p>
            <p className="text-xs text-[#64748B]">Khung giờ: {b.slot} · Đặt lúc {formatDateTime(b.createdAt)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            b.status === 'completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-[#2fa98c]/10 text-[#2fa98c]'
          }`}>
            {b.status === 'completed' ? 'Đã hoàn tất' : 'Đã đặt lịch'}
          </span>
        </Link>
      ))}
    </div>
  )
}

function VenueBookingsTab() {
  const [bookings, setBookings] = useState(null)

  useEffect(() => {
    apiClient.get('/venues/bookings/mine', { auth: true }).then(setBookings).catch(() => setBookings([]))
  }, [])

  if (bookings === null) return <p className="text-center text-sm text-[#64748B] py-10">Đang tải...</p>
  if (bookings.length === 0) return <p className="text-center text-sm text-[#64748B] py-10">Chưa có lượt đặt dịch vụ nào.</p>

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E8ECEE] bg-white px-5 py-4 shadow-xs">
          <div>
            <p className="font-bold text-[#0e3b33]">Mã hoá đơn: <span className="font-mono">{b.invoiceCode}</span></p>
            <p className="text-xs text-[#64748B]">Đặt lúc {formatDateTime(b.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#2fa98c]">{formatVnd(b.finalPriceVnd)}</span>
            <p className="text-[11px] text-[#64748B] capitalize">{b.status.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const THEME = {
  [RESULT.SUITABLE]: {
    badge: 'bg-[#6F9D8D]/15 text-[#2fa98c] border border-[#6F9D8D]/30',
    label: 'Phù hợp hoàn toàn',
    icon: CheckCircleIcon,
  },
  [RESULT.CAUTION]: {
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    label: 'Cần cân nhắc',
    icon: WarningIcon,
  },
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  // PostgreSQL trả ISO 8601 có timezone; vẫn chấp nhận định dạng SQLite cũ
  // để dữ liệu/API cache cũ không làm trang lịch sử bị "Invalid Date".
  const normalized = timestamp.includes('T') ? timestamp : `${timestamp.replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

function ScanHistoryPage() {
  useDocumentTitle('Lịch sử')
  const { user, ready } = useAuth()
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('scan')

  useEffect(() => {
    if (!user) return
    apiClient
      .get('/scan/history', { auth: true })
      .then(setHistory)
      .catch((err) => setError(err.message))
  }, [user])

  // UNAUTHENTICATED STATE
  if (ready && !user) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#eaf7f1] via-[#FCFDFC] to-[#eaf7f1] mt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#70c4af]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
          <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-xl rounded-[32px] border border-[#E7ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2fa98c] via-[#70c4af] to-[#6F9D8D] text-white shadow-[0_6px_20px_rgba(47, 169, 140,0.3)]">
            <SearchIcon className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#0e3b33]">
            Cần đăng nhập
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Đăng nhập để xem lịch sử tất cả những lần AI phân tích sản phẩm, theo dõi gợi ý và quản lý nhật ký chăm sóc da của bạn.
          </p>

          <div className="pt-2">
            <motion.div
              whileHover={{ backgroundPosition: 'right center' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center rounded-full shadow-[0_8px_25px_rgba(112, 196, 175,0.35)] cursor-pointer overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #2fa98c 0%, #70c4af 51%, #2fa98c 100%)',
                backgroundSize: '200% auto',
                transition: '0.5s',
              }}
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-9 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white cursor-pointer"
              >
                Đăng nhập ngay
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Calculate Summary Stats from History
  const totalScans = history?.length || 0
  const suitableCount = history?.filter((e) => e.result === RESULT.SUITABLE).length || 0
  const cautionCount = history?.filter((e) => e.result === RESULT.CAUTION).length || 0

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eaf7f1] via-[#FCFDFC] to-[#eaf7f1] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#70c4af]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#70c4af]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-12">
        {/* PAGE HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2fa98c]/20 bg-[#2fa98c]/8 px-4 py-1.5 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2fa98c]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2fa98c]">
              NHẬT KÝ HOẠT ĐỘNG CÁ NHÂN
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0e3b33]">
            Lịch Sử Hoạt Động
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Toàn bộ lịch sử quét sản phẩm, giao dịch ví, lịch hẹn chuyên gia và đặt dịch vụ của bạn.
          </p>

          {/* DASHBOARD SUMMARY METRICS CARDS */}
          {activeTab === 'scan' && history !== null && (
            <div className="mt-8 grid gap-4 grid-cols-3 text-left">
              <div className="rounded-2xl bg-white border border-[#E8ECEE] p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Tổng quét</p>
                <p className="mt-2 font-display text-3xl font-black text-[#0e3b33]">{totalScans}</p>
                <p className="mt-1 text-[11px] text-[#64748B]">Lần phân tích AI</p>
              </div>

              <div className="rounded-2xl bg-white border border-[#E8ECEE] p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Phù hợp</p>
                <p className="mt-2 font-display text-3xl font-black text-[#2fa98c]">{suitableCount}</p>
                <p className="mt-1 text-[11px] text-[#64748B]">Tương thích cao</p>
              </div>

              <div className="rounded-2xl bg-white border border-[#E8ECEE] p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#A87A45]">Cân nhắc</p>
                <p className="mt-2 font-display text-3xl font-black text-[#A87A45]">{cautionCount}</p>
                <p className="mt-1 text-[11px] text-[#64748B]">Chú ý thành phần</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* TAB SWITCHER */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.key ? 'bg-[#2fa98c] text-white' : 'bg-white border border-[#c5e7dd] text-[#64748B]'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'expert-bookings' && <ExpertBookingsTab />}
        {activeTab === 'venue-bookings' && <VenueBookingsTab />}

        {/* CONTENT TIMELINE AREA (tab "Quét sản phẩm") */}
        {activeTab === 'scan' && (
        <div className="space-y-6">
          {/* ERROR ALERT */}
          {error && (
            <div className="mx-auto max-w-xl rounded-2xl bg-rose-50 border border-rose-200 p-5 text-center text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* LOADING SKELETON CARDS */}
          {!error && history === null && (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-[#E8ECEE] rounded-full" />
                    <div className="h-6 w-24 bg-[#E8ECEE] rounded-full" />
                  </div>
                  <div className="h-6 w-2/3 bg-[#E8ECEE] rounded-xl" />
                  <div className="h-16 w-full bg-[#E8ECEE] rounded-2xl" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY HISTORY STATE */}
          {history?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC] p-12 text-center shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] space-y-5 max-w-2xl mx-auto"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#70c4af]/15 text-[#2fa98c] border border-[#2fa98c]/20">
                <SparklesIcon className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0e3b33]">
                Chưa có lịch sử quét
              </h2>
              <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
                Bạn chưa thực hiện lần quét ảnh sản phẩm nào. Hãy quét nhãn mỹ phẩm hoặc thực phẩm đầu tiên để AI phân tích đối chiếu.
              </p>
              <div className="pt-2">
                <motion.div
                  whileHover={{ backgroundPosition: 'right center' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center justify-center rounded-full shadow-[0_8px_25px_rgba(112, 196, 175,0.35)] cursor-pointer overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #2fa98c 0%, #70c4af 51%, #2fa98c 100%)',
                    backgroundSize: '200% auto',
                    transition: '0.5s',
                  }}
                >
                  <Link
                    to="/scan"
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    Quét sản phẩm ngay
                    <span>→</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SCAN HISTORY TIMELINE */}
          {history && history.length > 0 && (
            <div className="relative space-y-8 before:absolute before:left-4 sm:before:left-6 before:top-6 before:bottom-6 before:w-[2px] before:bg-gradient-to-b before:from-[#2fa98c]/40 before:via-[#70c4af]/50 before:to-[#6F9D8D]/20">
              {history.map((entry, index) => {
                const theme = entry.result ? THEME[entry.result] : null
                const Icon = theme?.icon

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative pl-10 sm:pl-14"
                  >
                    {/* Timeline Node Icon */}
                    <div className="absolute left-1.5 sm:left-3.5 top-6 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2fa98c] text-white ring-4 ring-[#eaf7f1] shadow-sm">
                      <SparklesIcon className="h-3 w-3 text-white" />
                    </div>

                    <motion.div
                      whileHover={{ y: -4, scale: 1.005 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] hover:border-[#2fa98c] hover:shadow-[0_20px_50px_rgba(47, 169, 140,0.12)] transition-all space-y-4"
                    >
                      {/* CARD TOP ROW: TIMESTAMP & RESULT BADGE */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-xs font-bold text-[#2fa98c] bg-[#2fa98c]/10 border border-[#2fa98c]/20 px-3 py-1 rounded-full">
                          {formatDate(entry.createdAt)}
                        </span>

                        {entry.result && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold shadow-xs ${theme.badge}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {theme.label || entry.result}
                          </span>
                        )}
                      </div>

                      {/* PRODUCT NAME */}
                      <h2 className="font-display text-xl sm:text-2xl font-black text-[#0e3b33] leading-snug">
                        {entry.matchedItemName || entry.productName || 'Không nhận diện được sản phẩm'}
                      </h2>

                      {/* AI EXPLANATION / INSIGHT CARD */}
                      {entry.reason && (
                        <div className="rounded-2xl bg-white border border-[#c5e7dd] p-5 space-y-1.5 shadow-xs">
                          <p className="text-xs font-bold text-[#2fa98c] uppercase tracking-wider">
                            Phân tích từ AI Assistant
                          </p>
                          <p className="text-sm leading-relaxed text-[#0e3b33] font-normal">
                            {entry.reason}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default ScanHistoryPage
