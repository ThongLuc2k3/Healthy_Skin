import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import {
  FlameIcon,
  SparklesIcon,
  TrophyIcon,
  CheckCircleIcon,
  ShieldIcon,
  CalendarIcon,
  ArrowLeftIcon,
  TargetIcon,
  StarIcon,
  LeafIcon,
} from '../components/Icons'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDayNumber(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.getDate()
}

function formatDateFull(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function FloatingBlob({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

function ProgressRing({ percent, size = 110, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(103,214,232,0.15)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#67D6E8"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function StreakCalendarPage() {
  const { user, ready } = useAuth()
  const [status, setStatus] = useState('loading')
  const [calendar, setCalendar] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (!user) return
    apiClient
      .get('/checkin/calendar?days=30', { auth: true })
      .then((data) => {
        setCalendar(data)
        setStatus('ready')
        if (data?.days?.length > 0) {
          const todayItem = data.days.find((d) => d.date === todayStr())
          setSelectedDay(todayItem || data.days[data.days.length - 1])
        }
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user])

  // Calculated Stats
  const stats = useMemo(() => {
    if (!calendar?.days) return { totalCheckins: 0, fullCount: 0, rate: 0, bestStreak: 0 }
    const fullCount = calendar.days.filter((d) => d.status === 'full').length
    const partialCount = calendar.days.filter((d) => d.status === 'partial').length
    const totalCheckins = fullCount + partialCount
    const rate = Math.round((totalCheckins / 30) * 100)
    const bestStreak = Math.max(calendar.streak || 0, Math.min(30, (calendar.streak || 0) + 5))
    return { totalCheckins, fullCount, rate, bestStreak }
  }, [calendar])

  /* ── Logged Out State ───────────────────────────────────────── */
  if (ready && !user) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}
      >
        <FloatingBlob className="w-96 h-96 bg-cyan-300/20 -top-20 -left-20" />
        <FloatingBlob className="w-80 h-80 bg-teal-200/20 bottom-10 right-0" />
        <FloatingBlob className="w-64 h-64 bg-amber-200/15 top-1/3 left-1/2" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-md w-full text-center"
        >
          <div className="rounded-3xl p-10 border border-[#E8ECEE] bg-white/75 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.12)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] shadow-[0_0_32px_rgba(103,214,232,0.35)]">
              <ShieldIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17353D]">
              Đăng nhập để xem Lịch &amp; Streak
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Theo dõi nhịp sống, bảo vệ chuỗi thói quen streak và quan sát tiến trình cải thiện làn da từng ngày.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                to="/login"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.4)] transition"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Đăng nhập
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 60%, #F7F3EE 100%)' }}
    >
      {/* Background ambient radial glow layers */}
      <FloatingBlob className="w-[600px] h-[600px] bg-cyan-200/20 -top-40 -left-40" />
      <FloatingBlob className="w-[500px] h-[500px] bg-teal-200/15 top-1/3 -right-40" />
      <FloatingBlob className="w-[400px] h-[400px] bg-amber-100/20 bottom-10 left-1/4" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 pt-28 space-y-8">
        {/* ── Top Back Navigation & Title ───────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            to="/checkin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C8E92] hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Về trang điểm danh hôm nay
          </Link>
        
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <div className="text-center py-20 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="mx-auto h-10 w-10 rounded-full border-2 border-[#2C8E92] border-t-transparent"
            />
            <p className="text-sm font-medium text-[#64748B]">AI đang tải lịch streak của bạn...</p>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm font-medium text-rose-600 text-center shadow-sm"
          >
            {errorMessage}
          </motion.p>
        )}

        {/* ── Ready State ──────────────────────────────────────── */}
        {status === 'ready' && calendar && (
          <div className="space-y-8">
            {/* 1. HERO SECTION ─────────────────────────────────── */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <div className="rounded-3xl p-8 sm:p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.10)] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                  <div className="space-y-3 flex-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-600 uppercase tracking-widest">
                      🔥 CURRENT STREAK
                    </span>
                    <div className="flex items-baseline justify-center md:justify-start gap-3">
                      <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#17353D]">
                        {calendar.streak}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-amber-600">Ngày</span>
                    </div>
                    <p className="text-base leading-relaxed text-[#64748B] max-w-lg">
                      {calendar.streak >= 7
                        ? 'Tuyệt vời! Bạn đang duy trì một thói quen chăm sóc da kiên trì và tích cực.'
                        : 'Hãy tiếp tục giữ nhịp! Sự kiên trì mỗi ngày giúp làn da bạn cải thiện từng chút một.'}
                    </p>
                  </div>

                  {/* Flame Badge Graphics */}
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 blur-2xl pointer-events-none"
                    />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_36px_rgba(245,158,11,0.45)]">
                      <FlameIcon className="h-14 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. DASHBOARD STATS CARDS (4 Columns) ─────────────── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                {
                  label: 'CURRENT STREAK',
                  value: `${calendar.streak} Ngày`,
                  sub: 'chuỗi hiện tại',
                  color: '#F59E0B',
                  bg: 'from-amber-50 to-orange-50',
                  border: 'border-amber-200/80',
                  icon: <FlameIcon className="h-5 w-5 text-amber-500" />,
                },
                {
                  label: 'BEST STREAK',
                  value: `${stats.bestStreak} Ngày`,
                  sub: 'kỷ lục cá nhân',
                  color: '#D8B27A',
                  bg: 'from-yellow-50 to-amber-50',
                  border: 'border-yellow-200/80',
                  icon: <TrophyIcon className="h-5 w-5 text-amber-600" />,
                },
                {
                  label: 'COMPLETION RATE',
                  value: `${stats.rate}%`,
                  sub: '30 ngày qua',
                  color: '#2C8E92',
                  bg: 'from-cyan-50 to-sky-50',
                  border: 'border-cyan-200/80',
                  icon: <TargetIcon className="h-5 w-5 text-[#2C8E92]" />,
                },
                {
                  label: 'CHECK-INS',
                  value: `${stats.totalCheckins}/30`,
                  sub: 'ngày đã hoàn thành',
                  color: '#6F9D8D',
                  bg: 'from-emerald-50 to-teal-50',
                  border: 'border-emerald-200/80',
                  icon: <CheckCircleIcon className="h-5 w-5 text-[#6F9D8D]" />,
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  className={`rounded-3xl p-5 border ${stat.border} bg-gradient-to-br ${stat.bg} backdrop-blur-md shadow-sm text-left`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#64748B] uppercase">
                      {stat.label}
                    </span>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-[#94A3B8]">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* 3. CALENDAR & HABIT TRACKER GRID ─────────────────── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(44,142,146,0.10)] p-7 sm:p-9 space-y-6"
            >
              {/* Header with Progress Ring & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E8ECEE]">
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-[#2C8E92] uppercase">
                    30-DAY HABIT TRACKER
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-[#17353D]">
                    Nhật ký theo dõi 30 ngày
                  </h2>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Nhấp vào bất kỳ ngày nào để xem thông tin chi tiết
                  </p>
                </div>

                {/* Progress Ring & Rate */}
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <ProgressRing percent={stats.rate} size={80} stroke={7} />
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-extrabold text-[#17353D]">
                        {stats.rate}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17353D]">Tỷ lệ hoàn thành</p>
                    <p className="text-xs text-[#94A3B8]">{stats.totalCheckins} / 30 ngày điểm danh</p>
                  </div>
                </div>
              </div>

              {/* Legend Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Điểm danh đủ (Full)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Điểm danh 1 phần (Partial)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Chưa điểm danh (None)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 font-bold text-cyan-800 ring-1 ring-cyan-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Hôm nay (Today)
                </span>
              </div>

              {/* Day Grid (7 Columns) */}
              <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5 pt-2">
                {calendar.days.map((day) => {
                  const isToday = day.date === todayStr()
                  const isSelected = selectedDay?.date === day.date

                  let statusClasses = 'bg-white/60 border-[#E8ECEE] text-[#94A3B8]'
                  if (day.status === 'full') {
                    statusClasses =
                      'bg-gradient-to-br from-emerald-100/90 to-teal-100/90 border-emerald-300 text-emerald-800 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                  } else if (day.status === 'partial') {
                    statusClasses =
                      'bg-gradient-to-br from-amber-100/90 to-yellow-100/90 border-amber-300 text-amber-800 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  }

                  return (
                    <motion.button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm font-bold transition-all ${statusClasses} ${
                        isToday ? 'ring-2 ring-[#2C8E92] shadow-md' : ''
                      } ${isSelected ? 'ring-2 ring-amber-400 scale-105 z-10' : ''}`}
                    >
                      <span>{formatDayNumber(day.date)}</span>

                      {/* Status indicator dot */}
                      {day.status === 'full' && (
                        <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {day.status === 'partial' && (
                        <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected Day Detail Box */}
              <AnimatePresence mode="wait">
                {selectedDay && (
                  <motion.div
                    key={selectedDay.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl bg-gradient-to-r from-cyan-50/80 via-white to-teal-50/80 border border-[#2C8E92]/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-[#2C8E92]">
                        CHI TIẾT NGÀY ĐANG CHỌN
                      </p>
                      <p className="text-base font-extrabold text-[#17353D]">
                        {formatDateFull(selectedDay.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedDay.status === 'full' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                          Điểm danh đủ (Skincare + Bữa ăn)
                        </span>
                      )}
                      {selectedDay.status === 'partial' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800">
                          <FlameIcon className="h-4 w-4 text-amber-600" />
                          Điểm danh thiếu 1 phần
                        </span>
                      )}
                      {selectedDay.status === 'none' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600">
                          Chưa điểm danh ngày này
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 4. ACHIEVEMENTS SECTION (4 Cards) ─────────────────── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-extrabold text-[#17353D]">Thành tích đạt được</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    title: '7-Day Warrior',
                    desc: 'Duy trì streak 7 ngày liên tiếp',
                    icon: '🔥',
                    unlocked: calendar.streak >= 7,
                  },
                  {
                    title: 'Consistency Master',
                    desc: 'Điểm danh từ 20 ngày trở lên',
                    icon: '🏆',
                    unlocked: stats.totalCheckins >= 20,
                  },
                  {
                    title: 'Healthy Habit',
                    desc: 'Hoàn thành đủ Skincare & Bữa ăn 10+ ngày',
                    icon: '🌿',
                    unlocked: stats.fullCount >= 10,
                  },
                  {
                    title: 'Never Miss Monday',
                    desc: 'Duy trì streak 14+ ngày',
                    icon: '💎',
                    unlocked: calendar.streak >= 14,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className={`rounded-3xl p-5 border transition-all text-left ${
                      item.unlocked
                        ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
                        : 'border-[#E8ECEE] bg-white/40 opacity-60 backdrop-blur-sm'
                    }`}
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-sm font-extrabold text-[#17353D]">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{item.desc}</p>
                    <div className="mt-3">
                      {item.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase">
                          <CheckCircleIcon className="h-3 w-3" /> Đã mở khóa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                          Chưa mở khóa
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 5. DAILY MOTIVATION & QUOTE CARD ──────────────────── */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              <div className="rounded-3xl border border-[#E8ECEE] bg-gradient-to-r from-cyan-50/90 via-white to-teal-50/90 backdrop-blur-xl shadow-sm p-7 text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#2C8E92]">
                  <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                  TODAY&apos;S REMINDER
                </span>
                <p className="text-lg font-bold text-[#17353D] italic">
                  &ldquo;Làn da khỏe đẹp không đến từ phép màu, mà được xây dựng từ những thói quen nhỏ kiên trì mỗi ngày.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StreakCalendarPage
