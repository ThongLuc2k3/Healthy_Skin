import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { CheckCircleIcon, WarningIcon, SparklesIcon, SearchIcon } from '../components/Icons'
import { RESULT } from '../logic/matchEngine'

const THEME = {
  [RESULT.SUITABLE]: {
    badge: 'bg-[#6F9D8D]/15 text-[#2C8E92] border border-[#6F9D8D]/30',
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
  const { user, ready } = useAuth()
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')

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
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] mt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
          <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-xl rounded-[32px] border border-[#E7ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] via-[#67D6E8] to-[#6F9D8D] text-white shadow-[0_6px_20px_rgba(44,142,146,0.3)]">
            <SearchIcon className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#17353D]">
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
              className="inline-flex items-center justify-center rounded-full shadow-[0_8px_25px_rgba(103,214,232,0.35)] cursor-pointer overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
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
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#67D6E8]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-12">
        {/* PAGE HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2C8E92]/20 bg-[#2C8E92]/8 px-4 py-1.5 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C8E92]">
              AI SCAN HISTORY · PERSONAL REPORT TIMELINE
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17353D]">
            Lịch Sử Quét AI
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Toàn bộ lịch sử các lần AI phân tích sản phẩm và nhãn thành phần của bạn, sắp xếp theo thứ tự thời gian mới nhất.
          </p>

          {/* DASHBOARD SUMMARY METRICS CARDS */}
          {history !== null && (
            <div className="mt-8 grid gap-4 grid-cols-3 text-left">
              <div className="rounded-2xl bg-white border border-[#E8ECEE] p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Tổng quét</p>
                <p className="mt-2 font-display text-3xl font-black text-[#17353D]">{totalScans}</p>
                <p className="mt-1 text-[11px] text-[#64748B]">Lần phân tích AI</p>
              </div>

              <div className="rounded-2xl bg-white border border-[#E8ECEE] p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">Phù hợp</p>
                <p className="mt-2 font-display text-3xl font-black text-[#2C8E92]">{suitableCount}</p>
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

        {/* CONTENT TIMELINE AREA */}
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
              className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC] p-12 text-center shadow-[0_12px_40px_rgba(44,142,146,0.06)] space-y-5 max-w-2xl mx-auto"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92] border border-[#2C8E92]/20">
                <SparklesIcon className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#17353D]">
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
                  className="inline-flex items-center justify-center rounded-full shadow-[0_8px_25px_rgba(103,214,232,0.35)] cursor-pointer overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
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
            <div className="relative space-y-8 before:absolute before:left-4 sm:before:left-6 before:top-6 before:bottom-6 before:w-[2px] before:bg-gradient-to-b before:from-[#2C8E92]/40 before:via-[#67D6E8]/50 before:to-[#6F9D8D]/20">
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
                    <div className="absolute left-1.5 sm:left-3.5 top-6 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2C8E92] text-white ring-4 ring-[#F7FBFC] shadow-sm">
                      <SparklesIcon className="h-3 w-3 text-white" />
                    </div>

                    <motion.div
                      whileHover={{ y: -4, scale: 1.005 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 shadow-[0_12px_40px_rgba(44,142,146,0.06)] hover:border-[#2C8E92] hover:shadow-[0_20px_50px_rgba(44,142,146,0.12)] transition-all space-y-4"
                    >
                      {/* CARD TOP ROW: TIMESTAMP & RESULT BADGE */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-xs font-bold text-[#2C8E92] bg-[#2C8E92]/10 border border-[#2C8E92]/20 px-3 py-1 rounded-full">
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
                      <h2 className="font-display text-xl sm:text-2xl font-black text-[#17353D] leading-snug">
                        {entry.matchedItemName || entry.productName || 'Không nhận diện được sản phẩm'}
                      </h2>

                      {/* AI EXPLANATION / INSIGHT CARD */}
                      {entry.reason && (
                        <div className="rounded-2xl bg-white border border-[#E8EEF0] p-5 space-y-1.5 shadow-xs">
                          <p className="text-xs font-bold text-[#2C8E92] uppercase tracking-wider">
                            Phân tích từ AI Assistant
                          </p>
                          <p className="text-sm leading-relaxed text-[#17353D] font-normal">
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
      </div>
    </div>
  )
}

export default ScanHistoryPage
