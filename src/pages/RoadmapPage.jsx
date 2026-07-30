import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import { loadPlanPreferences } from '../lib/planPreferences'
import {
  CalendarIcon,
  SparklesIcon,
  TrophyIcon,
  FlameIcon,
  TargetIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldIcon,
  LeafIcon,
  ChatBubbleIcon,
  UserIcon,
} from '../components/Icons'

function formatDate(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

/* ─── Phase themes (upgraded) ─────────────────────────────────────── */
const PHASE_THEME = {
  reset: {
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
    card: 'border-cyan-400/30',
    accent: 'from-cyan-400 to-sky-400',
    glow: 'shadow-[0_0_24px_rgba(103,214,232,0.18)]',
    dot: 'bg-cyan-400',
    label: 'Làm sạch & Tái thiết lập',
    color: '#67D6E8',
  },
  stabilize: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    card: 'border-emerald-500/30',
    accent: 'from-emerald-400 to-teal-400',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.18)]',
    dot: 'bg-emerald-400',
    label: 'Ổn định & Củng cố',
    color: '#34D399',
  },
  improve: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    card: 'border-amber-500/30',
    accent: 'from-amber-400 to-yellow-300',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.18)]',
    dot: 'bg-amber-400',
    label: 'Cải thiện & Nâng cấp',
    color: '#D8B27A',
  },
  maintain: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    card: 'border-rose-400/30',
    accent: 'from-rose-400 to-pink-400',
    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.18)]',
    dot: 'bg-rose-400',
    label: 'Duy trì & Bảo vệ',
    color: '#FB7185',
  },
}

function getPhaseTheme(phaseKey) {
  return PHASE_THEME[phaseKey] ?? PHASE_THEME.stabilize
}

/* ─── Animated Progress Ring ───────────────────────────────────────── */
function ProgressRing({ percent, size = 80, stroke = 6, color = '#67D6E8' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

/* ─── Animated Glass Progress Bar ─────────────────────────────────── */
function GlassProgressBar({ percent, accent, className = '' }) {
  return (
    <div className={`relative h-2.5 overflow-hidden rounded-full bg-white/5 border border-white/10 ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${accent} relative`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={`absolute inset-0 bg-gradient-to-r ${accent} opacity-60 blur-sm`} />
      </motion.div>
    </div>
  )
}

/* ─── Floating decorative blob ─────────────────────────────────────── */
function FloatingBlob({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ─── Fade + slide entrance ───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ═══════════════════════════════════════════════════════════════════ */
function RoadmapPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [roadmap, setRoadmap] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)

  const savedPlan = useMemo(() => (user ? loadPlanPreferences(user.id) : null), [user])

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient.get('/roadmap/current', { auth: true }).catch((err) => {
        if (err.status === 404) return null
        throw err
      }),
      apiClient.get('/checkin/calendar?days=30', { auth: true }).catch(() => null),
    ])
      .then(([roadmapData, calendarData]) => {
        setCalendar(calendarData)
        if (!roadmapData) {
          setStatus('none')
          return
        }
        setRoadmap(roadmapData)
        const preferredDate = searchParams.get('day')
        const preferredIndex = preferredDate
          ? roadmapData.dailyPlan.findIndex((day) => day.date === preferredDate)
          : -1
        const todayIndex = roadmapData.dailyPlan.findIndex((day) => day.date === todayStr())
        setSelectedDayIndex(preferredIndex >= 0 ? preferredIndex : todayIndex >= 0 ? todayIndex : 0)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user, searchParams])

  async function handleGenerate() {
    setGenerating(true)
    setErrorMessage('')
    try {
      const data = await apiClient.post('/roadmap/generate', {}, { auth: true })
      setRoadmap(data)
      setSelectedDayIndex(0)
      setStatus('ready')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    } finally {
      setGenerating(false)
    }
  }

  function applyTaskDone(taskId, done) {
    setRoadmap((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        dailyPlan: prev.dailyPlan.map((day) => ({
          ...day,
          skincare_tasks: day.skincare_tasks.map((t) => (t.id === taskId ? { ...t, done } : t)),
        })),
      }
    })
  }

  async function toggleTask(taskId, done) {
    if (!roadmap) return
    applyTaskDone(taskId, done)
    try {
      await apiClient.patch(`/roadmap/${roadmap.id}/task/${taskId}`, { done }, { auth: true })
    } catch (err) {
      applyTaskDone(taskId, !done)
      setErrorMessage(err.message)
    }
  }

  /* ── Unauthenticated ──────────────────────────────────────────── */
  if (ready && !user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}>
        <FloatingBlob className="w-96 h-96 bg-cyan-300/20 -top-20 -left-20" />
        <FloatingBlob className="w-80 h-80 bg-teal-200/20 bottom-10 right-0" />
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="relative z-10 max-w-md w-full text-center"
        >
          <div className="rounded-3xl p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.12)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] shadow-[0_0_32px_rgba(103,214,232,0.35)]">
              <ShieldIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17353D]">Yêu cầu đăng nhập</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Đăng nhập để AI tạo và theo dõi lộ trình cải thiện da và sức khỏe cá nhân của bạn.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link to="/login"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.4)] transition"
                style={{
                  backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Đăng nhập ngay →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Profile required ─────────────────────────────────────────── */
  if (!isProfileComplete(profile)) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}>
        <FloatingBlob className="w-96 h-96 bg-teal-300/15 -top-20 right-0" />
        <FloatingBlob className="w-80 h-80 bg-cyan-200/15 bottom-10 -left-10" />
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="relative z-10 max-w-md w-full text-center"
        >
          <div className="rounded-3xl p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.12)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF] shadow-[0_0_24px_rgba(111,157,141,0.3)]">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 mb-3">
              Cần thiết lập hồ sơ
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#17353D]">Chưa có hồ sơ cơ địa</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              AI cần biết loại da, thói quen và mục tiêu của bạn để xây dựng lộ trình cá nhân hoá chính xác nhất.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-left text-xs text-[#64748B]">
              {['Phân tích loại da & cơ địa', 'Xây lộ trình phù hợp ngân sách', 'Gợi ý thực phẩm & thói quen'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-[#2C8E92] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link to="/profile"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.3)] transition"
                style={{
                  backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Điền hồ sơ ngay →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Loading ──────────────────────────────────────────────────── */
  if (status === 'loading') {
    return (
      <div className="relative min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="mx-auto h-12 w-12 rounded-full border-2 border-[#67D6E8] border-t-transparent"
          />
          <p className="text-sm font-medium text-[#64748B]">AI đang tải lộ trình của bạn...</p>
        </div>
      </div>
    )
  }

  /* ── No roadmap ───────────────────────────────────────────────── */
  if (status === 'none') {
    return (
      <div className="relative min-h-screen overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}>
        <FloatingBlob className="w-[600px] h-[600px] bg-cyan-200/20 -top-40 -left-40" />
        <FloatingBlob className="w-[500px] h-[500px] bg-teal-200/15 bottom-0 right-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 pt-32">
          {/* Hero */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-14">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] shadow-[0_0_48px_rgba(103,214,232,0.4)]">
              <SparklesIcon className="h-12 w-12 text-white" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/20 px-4 py-1.5 text-xs font-bold tracking-widest text-[#2C8E92] uppercase mb-4">
              AI Personalized Dashboard
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17353D] leading-tight">
              Bạn chưa có lộ trình nào
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-base leading-relaxed text-[#64748B]">
              Cho AI biết mục tiêu, ngân sách và thói quen của bạn — AI sẽ xây dựng một kế hoạch cải thiện da và sức khoẻ hoàn toàn cá nhân hoá.
            </p>
          </motion.div>

          {/* Three premium option cards */}
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                to: '/roadmap/plan',
                icon: <TargetIcon className="h-7 w-7" />,
                iconBg: 'from-[#2C8E92] to-[#67D6E8]',
                iconGlow: 'rgba(103,214,232,0.35)',
                badge: 'Được khuyên dùng',
                badgeColor: 'bg-[#2C8E92]/10 border-[#2C8E92]/20 text-[#2C8E92]',
                title: 'Lập kế hoạch cải thiện',
                desc: 'AI phỏng vấn mục tiêu, ngân sách và thói quen để tạo lộ trình chi tiết theo từng ngày.',
                isLink: true,
                delay: 0,
              },
              {
                onClick: handleGenerate,
                disabled: generating,
                icon: <SparklesIcon className="h-7 w-7" />,
                iconBg: 'from-[#6F9D8D] to-[#BFD8CF]',
                iconGlow: 'rgba(111,157,141,0.35)',
                badge: 'Nhanh nhất',
                badgeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                title: generating ? 'Đang tạo lộ trình...' : 'Dùng lộ trình tự sinh nhanh',
                desc: 'AI tự động phân tích hồ sơ của bạn và tạo ngay một lộ trình phù hợp trong vài giây.',
                isLink: false,
                delay: 1,
              },
              {
                to: '/roadmap/custom',
                icon: <CalendarIcon className="h-7 w-7" />,
                iconBg: 'from-[#D8B27A] to-[#A87A45]',
                iconGlow: 'rgba(216,178,122,0.35)',
                badge: 'Tự kiểm soát',
                badgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
                title: 'Tự thiết kế thủ công',
                desc: 'Tự chọn nhiệm vụ, thực phẩm và lịch theo phong cách riêng của bạn.',
                isLink: true,
                delay: 2,
              },
            ].map((card, i) => {
              const inner = (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" animate="visible" custom={card.delay}
                  whileHover={{ y: -6, boxShadow: `0 20px 48px ${card.iconGlow}` }}
                  className="group relative rounded-3xl p-7 border border-[#E8ECEE] bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] cursor-pointer transition-all"
                >
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.iconBg} text-white shadow-[0_0_20px_${card.iconGlow}]`}>
                    {card.icon}
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-3 ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <h3 className="text-lg font-bold text-[#17353D] group-hover:text-[#2C8E92] transition-colors">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{card.desc}</p>
                  <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2C8E92]`}>
                    {card.isLink ? 'Bắt đầu ngay' : (card.disabled ? 'Đang xử lý...' : 'Tạo ngay')} →
                  </div>
                </motion.div>
              )
              if (card.isLink) return <Link to={card.to} key={i}>{inner}</Link>
              return (
                <button key={i} type="button" onClick={card.onClick} disabled={card.disabled} className="text-left disabled:opacity-60">
                  {inner}
                </button>
              )
            })}
          </div>

          {errorMessage && (
            <motion.p variants={fadeUp} initial="hidden" animate="visible"
              className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm text-rose-600 text-center">
              {errorMessage}
            </motion.p>
          )}
        </div>
      </div>
    )
  }

  /* ── Error ────────────────────────────────────────────────────── */
  if (status === 'error' || !roadmap) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm font-medium text-rose-600">
          {errorMessage}
        </p>
      </div>
    )
  }

  /* ══════════════════════════ MAIN DASHBOARD ══════════════════════ */
  const totalTasks = roadmap.dailyPlan.reduce((sum, day) => sum + day.skincare_tasks.length, 0)
  const completedTasks = roadmap.dailyPlan.reduce(
    (sum, day) => sum + day.skincare_tasks.filter((task) => task.done).length,
    0,
  )
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const selectedDay = roadmap.dailyPlan[clamp(selectedDayIndex, 0, roadmap.dailyPlan.length - 1)]
  const selectedDoneCount = selectedDay.skincare_tasks.filter((task) => task.done).length
  const selectedProgress = selectedDay.skincare_tasks.length
    ? Math.round((selectedDoneCount / selectedDay.skincare_tasks.length) * 100)
    : 0
  const heroSummary = savedPlan?.summary
  const streak = calendar?.streak ?? 0
  const selectedPhaseTheme = getPhaseTheme(selectedDay.phase_key)

  const achievements = [
    `${completedTasks}/${totalTasks} nhiệm vụ đã hoàn thành`,
    selectedProgress === 100 ? 'Hôm nay bạn đã hoàn tất routine 🎉' : `Hôm nay đang ở mức ${selectedProgress}%`,
    streak > 0 ? `Streak ${streak} ngày liên tiếp 🔥` : 'Điểm danh để bắt đầu chuỗi mới',
  ]
  const hasPreviousDay = selectedDayIndex > 0
  const hasNextDay = selectedDayIndex < roadmap.dailyPlan.length - 1

  function handleSelectDay(index) {
    if (index === selectedDayIndex) return
    setSelectedDayIndex(index)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('day', roadmap.dailyPlan[index].date)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 60%, #F7F3EE 100%)' }}>
      {/* Ambient background blobs */}
      <FloatingBlob className="w-[700px] h-[700px] bg-cyan-200/20 -top-60 -left-40" />
      <FloatingBlob className="w-[500px] h-[500px] bg-teal-200/15 top-1/2 -right-40" />
      <FloatingBlob className="w-[400px] h-[400px] bg-amber-100/20 bottom-20 left-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 pt-28 space-y-8">

        {/* ── Hero Dashboard ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="rounded-3xl p-8 sm:p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.10)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C8E92]/5 via-transparent to-[#D8B27A]/5 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17353D] leading-tight">
                  {getGreeting()}
                </h1>
                <p className="mt-2 text-xl font-semibold text-[#2C8E92]">
                  {savedPlan?.goal || 'Sẵn sàng cho hành trình cải thiện hôm nay?'}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
                  Mỗi ngày chỉ tập trung đúng việc cần làm. AI đồng hành cùng bạn từng bước nhỏ.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.03, backgroundPosition: 'right center' }} whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                      backgroundSize: '200% auto',
                    }}
                    className="rounded-2xl shadow-[0_0_20px_rgba(44,142,146,0.35)]"
                  >
                    <Link to="/checkin" className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white">
                      Điểm danh hôm nay
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/roadmap/plan"
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#2C8E92]/30 bg-white/60 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-[#2C8E92] hover:border-[#2C8E92]/60 transition-colors">
                      Chỉnh kế hoạch
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 lg:gap-5 lg:min-w-[340px]">
                {[
                  { label: 'Tiến độ tổng', value: `${completionRate}%`, sub: 'toàn bộ lộ trình', color: '#67D6E8', bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-200/60' },
                  { label: 'Streak', value: `${streak}`, sub: 'ngày liên tiếp', color: '#D8B27A', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200/60', icon: <FlameIcon className="h-4 w-4 text-amber-500" /> },
                  { label: 'Hôm nay', value: `${selectedProgress}%`, sub: 'ngày đang chọn', color: '#6F9D8D', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200/60' },
                ].map((stat, i) => (
                  <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl p-4 border ${stat.border} bg-gradient-to-br ${stat.bg} text-center shadow-sm`}>
                    {stat.icon && <div className="flex justify-center mb-1">{stat.icon}</div>}
                    <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
                    <p className="mt-0.5 text-[10px] text-[#94A3B8]">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Error banner ─────────────────────────────────────── */}
        {errorMessage && (
          <motion.p variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm text-rose-600 text-center">
            {errorMessage}
          </motion.p>
        )}

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_380px] w-full min-w-0">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="space-y-6 min-w-0 w-full">

            {/* Today's Focus Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(44,142,146,0.10)] overflow-hidden w-full min-w-0">

              {/* Phase header bar */}
              <div className={`relative px-7 pt-7 pb-5`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${selectedPhaseTheme.accent} opacity-[0.06] pointer-events-none`} />
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-[#64748B]">Ngày đang theo dõi</p>
                    {selectedDay.phase_title_vi && (
                      <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${selectedPhaseTheme.badge}`}>
                        <ShieldIcon className="h-3.5 w-3.5" />
                        {selectedDay.phase_title_vi}
                      </span>
                    )}
                    <h2 className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17353D]">
                      Ngày {selectedDay.day_index}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#64748B] capitalize">{formatDate(selectedDay.date)}</p>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Completion ring */}
                    <div className="relative flex-shrink-0">
                      <ProgressRing percent={selectedProgress} size={88} stroke={7} color={selectedPhaseTheme.color} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-[#17353D]">{selectedProgress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[#17353D]">{selectedDoneCount}<span className="text-sm font-semibold text-[#64748B]">/{selectedDay.skincare_tasks.length}</span></p>
                      <p className="text-xs text-[#94A3B8]">việc hoàn thành</p>
                      {/* Navigation */}
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          type="button" onClick={() => handleSelectDay(selectedDayIndex - 1)}
                          disabled={!hasPreviousDay}
                          className="flex items-center gap-1 rounded-xl border border-[#E8ECEE] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:border-[#2C8E92]/40 disabled:opacity-40 transition">
                          <ArrowLeftIcon className="h-3.5 w-3.5" /> Trước
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          type="button" onClick={() => handleSelectDay(selectedDayIndex + 1)}
                          disabled={!hasNextDay}
                          className="flex items-center gap-1 rounded-xl border border-[#E8ECEE] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:border-[#2C8E92]/40 disabled:opacity-40 transition">
                          Sau <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated progress bar */}
                <div className="relative mt-5">
                  <GlassProgressBar percent={selectedProgress} accent={selectedPhaseTheme.accent} />
                  <div className="flex justify-between mt-1.5 text-[10px] text-[#94A3B8]">
                    <span>0%</span>
                    <span className="font-semibold text-[#2C8E92]">{selectedProgress}% hoàn thành</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* AI Coach message */}
              {selectedDay.coach_note && (
                <div className="px-7 pb-5">
                  <div className="rounded-2xl border border-[#BFD8CF]/60 bg-gradient-to-br from-[#F0FAF8] to-[#EBF5F0] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] shadow-[0_0_12px_rgba(103,214,232,0.3)]">
                        <SparklesIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-[#2C8E92]">AI Coach · Gợi ý hôm nay</span>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#17353D]">{selectedDay.coach_note}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className="px-6 sm:px-7 pb-7">
                <p className="text-xs font-bold tracking-widest uppercase text-[#64748B] mb-4">Nhiệm vụ hôm nay</p>
                <div className="grid gap-3 grid-cols-1">
                  <AnimatePresence>
                    {selectedDay.skincare_tasks.map((task, i) => (
                      <motion.label
                        key={task.id}
                        layout
                        variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.5}
                        whileHover={{ y: -2, boxShadow: task.done ? '0 8px 24px rgba(52,211,153,0.15)' : '0 8px 24px rgba(44,142,146,0.1)' }}
                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                          task.done
                            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_0_20px_rgba(52,211,153,0.12)]'
                            : 'border-[#E8ECEE] bg-white/80 hover:border-[#2C8E92]/30 hover:bg-white/90'
                        }`}
                      >
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={(e) => toggleTask(task.id, e.target.checked)}
                            className="sr-only"
                          />
                          <motion.div
                            animate={{ scale: task.done ? [1, 1.2, 1] : 1 }}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              task.done ? 'border-emerald-400 bg-emerald-400' : 'border-[#BFD8CF] bg-white'
                            }`}
                          >
                            {task.done && (
                              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                                viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </motion.svg>
                            )}
                          </motion.div>
                        </div>
                        <span className={`min-w-0 text-sm leading-relaxed transition-all ${task.done ? 'line-through text-[#94A3B8]' : 'text-[#17353D]'}`}>
                          {task.label_vi}
                        </span>
                      </motion.label>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Day Timeline / Navigation */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-6 sm:p-7 w-full min-w-0 overflow-hidden">
              <p className="text-xs font-bold tracking-widest uppercase text-[#64748B] mb-1">Lịch trình theo ngày</p>
              <h3 className="text-base font-bold text-[#17353D] mb-5">Chọn đúng ngày bạn muốn xem</h3>

              <div className="flex gap-3 overflow-x-auto pb-3 pr-1 w-full max-w-full min-w-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#BFD8CF transparent' }}>
                {roadmap.dailyPlan.map((day, index) => {
                  const doneCount = day.skincare_tasks.filter((task) => task.done).length
                  const percent = day.skincare_tasks.length
                    ? Math.round((doneCount / day.skincare_tasks.length) * 100)
                    : 0
                  const isSelected = index === selectedDayIndex
                  const phaseTheme = getPhaseTheme(day.phase_key)
                  const isToday = day.date === todayStr()

                  return (
                    <motion.button
                      key={day.day_index}
                      type="button"
                      onClick={() => handleSelectDay(index)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-shrink-0 min-w-[168px] rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#2C8E92]/50 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-[0_0_20px_rgba(44,142,146,0.2)] ring-1 ring-[#2C8E92]/30'
                          : 'border-[#E8ECEE] bg-white/70 hover:border-[#2C8E92]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#94A3B8]">
                          Ngày {day.day_index}
                        </p>
                        {isToday && (
                          <span className="text-[9px] font-bold rounded-full bg-[#2C8E92]/10 text-[#2C8E92] px-2 py-0.5">
                            HÔM NAY
                          </span>
                        )}
                      </div>
                      {day.phase_title_vi && (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${phaseTheme.badge}`}>
                          {day.phase_title_vi}
                        </span>
                      )}
                      <p className="mt-2 text-xs font-semibold text-[#17353D] capitalize leading-tight">{formatDate(day.date)}</p>
                      <p className="mt-2 text-xs text-[#94A3B8]">{doneCount}/{day.skincare_tasks.length} việc</p>
                      {/* Mini progress */}
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#F0F4F6]">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${phaseTheme.accent}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────── */}
          <aside className="space-y-5 min-w-0 w-full">

            {/* Plan Summary Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8]">
                  <TargetIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#2C8E92]">Tóm tắt kế hoạch AI</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Mục tiêu', value: heroSummary?.focusLabel || 'Ổn định da và thói quen sống', icon: '' },
                  { label: 'Ngân sách', value: heroSummary?.budgetLabel || 'Linh hoạt theo khả năng', icon: '' },
                  { label: 'Nhịp cam kết', value: heroSummary?.commitmentLabel || `${roadmap.durationDays} ngày tập trung`, icon: ' ' },
                ].map((item, i) => (
                  <div key={i} className={`${i < 2 ? 'border-b border-[#F0F4F6]' : ''} pb-3 last:pb-0 last:border-0`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">{item.icon} {item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#17353D]">{item.value}</p>
                  </div>
                ))}
              </div>

              {heroSummary?.watchouts?.length > 0 && (
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2.5">⚠ Nhóm cần lưu ý</p>
                  <div className="flex flex-wrap gap-1.5">
                    {heroSummary.watchouts.map((item) => (
                      <span key={item} className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Phase */}
              {selectedDay.phase_title_vi && (
                <div className={`mt-4 rounded-2xl border p-4 bg-gradient-to-br from-white to-[#F7FBFC] ${selectedPhaseTheme.card}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Bạn đang ở phase</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${selectedPhaseTheme.dot}`} />
                    <p className="text-base font-bold text-[#17353D]">{selectedDay.phase_title_vi}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">{selectedPhaseTheme.label}</p>
                </div>
              )}
            </motion.div>

            {/* Achievements Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300">
                  <TrophyIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-amber-600">Thành tích đang mở</p>
              </div>

              <div className="space-y-3">
                {achievements.map((achievement, i) => (
                  <motion.div key={achievement}
                    variants={fadeUp} initial="hidden" animate="visible" custom={i + 4}
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-[#F0FAF8] to-white border border-[#BFD8CF]/50 px-4 py-3">
                    <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                    </span>
                    <p className="text-sm leading-relaxed text-[#17353D]">{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Nutrition Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF]">
                  <LeafIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#6F9D8D]">Gợi ý dinh dưỡng hôm nay</p>
              </div>

              <div className="space-y-2.5">
                {selectedDay.meal_guidance.map((line, i) => (
                  <motion.div key={line}
                    variants={fadeUp} initial="hidden" animate="visible" custom={i + 5}
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3">
                    <span className="flex-shrink-0 mt-0.5 text-emerald-500 text-sm">🌿</span>
                    <p className="text-sm leading-relaxed text-[#17353D]">{line}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <motion.div whileHover={{ scale: 1.02, backgroundPosition: 'right center' }} whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                    backgroundSize: '200% auto',
                  }}
                  className="rounded-2xl shadow-[0_0_16px_rgba(44,142,146,0.25)]"
                >
                  <Link to="/checkin" className="block text-center py-2.5 text-sm font-bold text-white">
                    Điểm danh ngay
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Link to="/roadmap/custom"
                    className="block text-center py-2.5 rounded-2xl border border-[#E8ECEE] bg-white/60 text-sm font-semibold text-[#64748B] hover:border-[#2C8E92]/30 hover:text-[#2C8E92] transition-colors">
                    Tự nhập lộ trình khác
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* ── Footer back link ─────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="text-center pb-10">
          <Link to="/results"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#94A3B8] hover:text-[#2C8E92] transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại xem kết quả kiểm tra
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default RoadmapPage
