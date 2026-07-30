import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import {
  CameraIcon,
  CheckCircleIcon,
  FlameIcon,
  ShieldIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from '../components/Icons'
import AuthedImage from '../components/AuthedImage'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
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

const PHASE_THEME = {
  reset: {
    badge: 'bg-cyan-500/15 text-cyan-700 border-cyan-400/40',
    card: 'border-cyan-400/30',
    glow: 'from-cyan-400 to-sky-400',
    color: '#67D6E8',
  },
  stabilize: {
    badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40',
    card: 'border-emerald-500/30',
    glow: 'from-emerald-400 to-teal-400',
    color: '#34D399',
  },
  improve: {
    badge: 'bg-amber-500/15 text-amber-700 border-amber-500/40',
    card: 'border-amber-500/30',
    glow: 'from-amber-400 to-yellow-300',
    color: '#D8B27A',
  },
  maintain: {
    badge: 'bg-rose-500/15 text-rose-700 border-rose-500/40',
    card: 'border-rose-400/30',
    glow: 'from-rose-400 to-pink-400',
    color: '#FB7185',
  },
}

function getPhaseTheme(phaseKey) {
  return PHASE_THEME[phaseKey] ?? PHASE_THEME.stabilize
}

function ProgressRing({ percent, size = 96, stroke = 8, color = '#2C8E92' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(44,142,146,0.12)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
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

function PhotoPicker({ label, file, existingUrl, onChange }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  return (
    <label className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#2C8E92]/30 bg-white/60 p-4 text-sm text-[#17353D] hover:border-[#2C8E92]/60 hover:bg-[#2C8E92]/5 transition-all shadow-sm">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt=""
          className="h-16 w-16 rounded-xl object-cover border border-[#2C8E92]/40 shadow-sm"
        />
      ) : existingUrl ? (
        <AuthedImage
          src={existingUrl}
          alt=""
          className="h-16 w-16 rounded-xl object-cover border border-[#2C8E92]/40 shadow-sm"
        />
      ) : (
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2C8E92]/10 to-[#67D6E8]/20 text-[#2C8E92] border border-[#2C8E92]/20">
          <CameraIcon className="h-6 w-6" />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="block font-medium truncate text-[#17353D]">
          {file ? file.name : label}
        </span>
        <span className="block text-xs text-[#94A3B8] mt-0.5">
          {file ? 'Đã chọn ảnh minh chứng' : 'Nhấn hoặc kéo ảnh vào đây (tuỳ chọn)'}
        </span>
      </div>
    </label>
  )
}

function CheckInPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()

  const [roadmapStatus, setRoadmapStatus] = useState('loading')
  const [todayPlan, setTodayPlan] = useState(null)
  const [roadmapId, setRoadmapId] = useState(null)

  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set())
  const [mealDescription, setMealDescription] = useState('')
  const [note, setNote] = useState('')
  const [skincareFile, setSkincareFile] = useState(null)
  const [mealFile, setMealFile] = useState(null)
  const [existingCheckin, setExistingCheckin] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [feedbackPreview, setFeedbackPreview] = useState(null)
  const phaseTheme = todayPlan ? getPhaseTheme(todayPlan.phase_key) : PHASE_THEME.stabilize
  const previewPhaseTheme = feedbackPreview?.phaseKey ? getPhaseTheme(feedbackPreview.phaseKey) : phaseTheme

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient.get('/roadmap/current', { auth: true }).catch((err) => {
        if (err.status === 404) return null
        throw err
      }),
      apiClient.get('/checkin/today', { auth: true }),
    ])
      .then(([roadmap, checkin]) => {
        if (!roadmap) {
          setRoadmapStatus('none')
          return
        }
        const day = roadmap.dailyPlan.find((d) => d.date === todayStr())
        setRoadmapId(roadmap.id)
        if (!day) {
          setRoadmapStatus('expired')
          return
        }
        setTodayPlan(day)
        setRoadmapStatus('ready')

        if (checkin) {
          setExistingCheckin(checkin)
          setSelectedTaskIds(new Set(checkin.skincareTasksCompleted))
          setMealDescription(checkin.mealDescription || '')
          setNote(checkin.note || '')
          setFeedbackPreview(checkin.feedbackPreview || null)
        }
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setRoadmapStatus('error')
      })
  }, [user])

  function toggleTask(taskId) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSavedMessage('')
    try {
      const formData = new FormData()
      formData.append('skincareTasksCompleted', JSON.stringify(Array.from(selectedTaskIds)))
      formData.append('mealDescription', mealDescription)
      formData.append('note', note)
      if (roadmapId) formData.append('roadmapId', String(roadmapId))
      if (skincareFile) formData.append('skincarePhoto', skincareFile)
      if (mealFile) formData.append('mealPhoto', mealFile)

      const result = await apiClient.post('/checkin', formData, { auth: true, isFormData: true })
      setExistingCheckin(result)
      setSkincareFile(null)
      setMealFile(null)
      setSavedMessage('Đã lưu điểm danh hôm nay!')
      setFeedbackPreview(result.feedbackPreview || null)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── 1. Logged Out State ─────────────────────────────────────── */
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
              Đăng nhập để bắt đầu hành trình chăm sóc mỗi ngày
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Điểm danh mỗi ngày giúp AI hiểu tiến trình cải thiện, ghi nhớ thói quen và điều chỉnh lộ trình phù hợp hơn với cơ địa của bạn.
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

  /* ── 2. Profile Not Completed State ───────────────────────────── */
  if (!isProfileComplete(profile)) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 50%, #F7F3EE 100%)' }}
      >
        <FloatingBlob className="w-96 h-96 bg-teal-300/15 -top-20 right-0" />
        <FloatingBlob className="w-80 h-80 bg-cyan-200/15 bottom-10 -left-10" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-lg w-full text-center"
        >
          <div className="rounded-3xl p-10 border border-[#E8ECEE] bg-white/75 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.12)]">
            {/* Horizontal progress step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-semibold text-[#2C8E92]">
                <CheckCircleIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                <span>Đăng nhập</span>
              </div>
              <span className="text-xs text-[#94A3B8]">→</span>
              <div className="flex items-center gap-1 rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/30 px-2.5 py-0.5 text-xs font-bold text-[#2C8E92]">
                <span>Hồ sơ</span>
              </div>
              <span className="text-xs text-[#94A3B8]">→</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#94A3B8]">
                <span>Lộ trình</span>
              </div>
              <span className="text-xs text-[#94A3B8]">→</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#94A3B8]">
                <span>Điểm danh</span>
              </div>
            </div>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF] shadow-[0_0_24px_rgba(111,157,141,0.3)]">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#17353D]">
              AI cần hiểu cơ địa của bạn
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Hoàn thành hồ sơ để AI cá nhân hóa việc điểm danh, theo dõi tiến trình và đưa ra gợi ý phù hợp cho làn da của bạn.
            </p>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                to="/profile"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.35)] transition"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Điền hồ sơ ngay
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── 3. Main Dashboard Layout ─────────────────────────────────── */
  const totalTasks = todayPlan?.skincare_tasks?.length || 0
  const completedCount = selectedTaskIds.size
  const percentDone = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

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
        {/* ── 5. Hero Section ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="rounded-3xl p-8 sm:p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.10)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C8E92]/5 via-transparent to-[#D8B27A]/5 pointer-events-none" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/20 px-4 py-1.5 text-xs font-bold tracking-widest text-[#2C8E92] uppercase">
                  DAILY AI CHECK-IN
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17353D] leading-tight">
                  Điểm danh hôm nay
                </h1>
                <p className="mt-3 text-base leading-relaxed text-[#64748B] max-w-xl">
                  Điểm danh không chỉ giúp theo dõi tiến độ mà còn giúp AI điều chỉnh kế hoạch cho ngày tiếp theo sát với thực tế nhất.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to="/streak"
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#2C8E92]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#2C8E92] hover:border-[#2C8E92]/60 transition"
                  >
                    <FlameIcon className="h-4 w-4 text-rose-500" />
                    Xem lịch theo dõi &amp; streak
                  </Link>
                </div>
              </div>

              {/* Decorative 3D CSS Objects */}
              <div className="relative h-48 w-full flex items-center justify-center lg:justify-end pointer-events-none">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-36 w-36 rounded-3xl bg-gradient-to-br from-white/90 via-cyan-100/50 to-teal-200/40 border border-white/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(103,214,232,0.25)] flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#2C8E92]/30 to-[#67D6E8]/60 border border-white/60 backdrop-blur-md shadow-[0_0_20px_rgba(44,142,146,0.3)]"
                  />
                </motion.div>

                {/* Floating CSS Capsule */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-2 right-12 h-14 w-28 rounded-full bg-gradient-to-r from-[#D8B27A]/40 to-[#BFD8CF]/50 border border-white/70 backdrop-blur-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Status States (Loading, None, Expired, Error) ───────────── */}
        {roadmapStatus === 'loading' && (
          <div className="text-center py-16 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="mx-auto h-10 w-10 rounded-full border-2 border-[#2C8E92] border-t-transparent"
            />
            <p className="text-sm font-medium text-[#64748B]">AI đang tải thông tin điểm danh...</p>
          </div>
        )}

        {/* ── 3. No Roadmap State ──────────────────────────────── */}
        {roadmapStatus === 'none' && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-lg p-8 sm:p-10 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] shadow-[0_0_32px_rgba(103,214,232,0.3)]">
              <CalendarIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#17353D]">Bạn chưa có lộ trình</h2>
            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-[#64748B]">
              Muốn điểm danh hiệu quả, AI cần biết hôm nay bạn nên thực hiện những mục tiêu và chu trình điều gì.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/roadmap"
                  className="inline-block rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                    backgroundSize: '200% auto',
                  }}
                >
                  Tạo lộ trình ngay
                </Link>
              </motion.div>
              <Link
                to="/"
                className="inline-block rounded-2xl border border-[#E8ECEE] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#64748B] hover:border-[#2C8E92]/40 transition"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── 4. Expired Roadmap State ───────────────────────────── */}
        {roadmapStatus === 'expired' && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white/80 to-yellow-50/80 backdrop-blur-xl shadow-lg p-8 sm:p-10 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D8B27A] to-[#A87A45] shadow-[0_0_32px_rgba(216,178,122,0.35)]">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#17353D]">
              Lộ trình hiện tại đã hoàn thành
            </h2>
            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-[#64748B]">
              Chúc mừng bạn đã hoàn thành chặng đường! Đã đến lúc tạo một hành trình mới dựa trên kết quả và cơ địa hiện tại.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                to="/roadmap"
                className="inline-block rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-md transition"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #D8B27A 0%, #A87A45 50%, #D8B27A 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Tạo lộ trình mới
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ── 12. Error Message Toast Card ──────────────────────── */}
        {roadmapStatus === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm font-medium text-rose-600 text-center shadow-sm"
          >
            {errorMessage}
          </motion.p>
        )}

        {/* ── Ready State: Main Form Structure (Divided into 4 Sections) ── */}
        {roadmapStatus === 'ready' && todayPlan && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(44,142,146,0.10)] p-7 sm:p-9 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                 

                  {todayPlan.phase_title_vi && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${phaseTheme.badge}`}
                    >
                      <ShieldIcon className="h-3.5 w-3.5" />
                      Phase hiện tại: {todayPlan.phase_title_vi}
                    </span>
                  )}

                  <h2 className="text-2xl font-extrabold text-[#17353D]">
                    Giai đoạn điểm danh theo Phase
                  </h2>
                  <p className="text-sm leading-relaxed text-[#64748B] max-w-xl">
                    Bạn đang điểm danh trong đúng giai đoạn của lộ trình cải thiện. Những nhiệm vụ hôm nay được thiết kế chuẩn theo phase cơ địa.
                  </p>

                  {todayPlan.coach_note && (
                    <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#F0FAF8] to-[#EBF5F0] border border-[#BFD8CF]/60 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#2C8E92] mb-1">
                        Coach note
                      </p>
                      <p className="text-sm leading-relaxed text-[#17353D]">
                        {todayPlan.coach_note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Ring Visualization */}
                <div className="flex flex-col items-center justify-center flex-shrink-0 self-center">
                  <div className="relative">
                    <ProgressRing percent={percentDone} size={108} stroke={9} color="#2C8E92" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-[#17353D]">
                        {percentDone}%
                      </span>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                        Hôm nay
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#64748B]">
                    {completedCount}/{totalTasks} việc hoàn thành
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ════════════════ SECTION 2: TODAY'S ACTIVITIES ════════════════ */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="space-y-6"
            >
              {/* 7. Skincare Checklist & Upload Card */}
              <div className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] text-white shadow-sm">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#17353D]">Chăm sóc da hôm nay</h3>
                    <p className="text-xs text-[#64748B]">
                      Tích chọn các nhiệm vụ skincare bạn đã hoàn thành
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {todayPlan.skincare_tasks.map((task) => {
                    const isChecked = selectedTaskIds.has(task.id)
                    return (
                      <motion.label
                        key={task.id}
                        whileHover={{ y: -1 }}
                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                          isChecked
                            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm'
                            : 'border-[#E8ECEE] bg-white/80 hover:border-[#2C8E92]/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTask(task.id)}
                          className="sr-only"
                        />
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'border-emerald-400 bg-emerald-400'
                              : 'border-[#BFD8CF] bg-white'
                          }`}
                        >
                          {isChecked && (
                            <svg
                              viewBox="0 0 10 8"
                              className="h-2.5 w-2.5 text-white"
                              fill="none"
                            >
                              <path
                                d="M1 4l2.5 2.5L9 1"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            isChecked ? 'line-through text-[#94A3B8]' : 'text-[#17353D] font-medium'
                          }`}
                        >
                          {task.label_vi}
                        </span>
                      </motion.label>
                    )
                  })}
                </div>

                {/* Skincare Photo Upload Card */}
                <div className="pt-2">
                  <PhotoPicker
                    label="Thêm ảnh minh chứng skincare (tuỳ chọn)"
                    file={skincareFile}
                    existingUrl={existingCheckin?.skincarePhotoUrl}
                    onChange={setSkincareFile}
                  />
                </div>
              </div>

              {/* 9. Meal Section & Upload Card */}
              <div className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF] text-white shadow-sm">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#17353D]">Bữa ăn hôm nay</h3>
                    <p className="text-xs text-[#64748B]">
                      Ghi chép ngắn gọn thực đơn của bạn để AI phân tích dinh dưỡng
                    </p>
                  </div>
                </div>

                <textarea
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Ví dụ: Cơm gà, rau luộc, canh chua..."
                  rows={3}
                  className="w-full rounded-2xl bg-white/90 border border-[#E8ECEE] px-4 py-3.5 text-sm text-[#17353D] placeholder-[#94A3B8] focus:border-[#2C8E92] focus:outline-none focus:ring-2 focus:ring-[#2C8E92]/20 transition"
                />

                {/* Meal Photo Upload Card */}
                <PhotoPicker
                  label="Thêm ảnh bữa ăn (tuỳ chọn)"
                  file={mealFile}
                  existingUrl={existingCheckin?.mealPhotoUrl}
                  onChange={setMealFile}
                />
              </div>
            </motion.div>

            {/* ════════════════ SECTION 3: DAILY REFLECTION ════════════════ */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 space-y-6"
            >
              {/* 10. AI Notes Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">
                    Nếu hôm nay có điều gì đặc biệt, hãy để AI biết.
                  </span>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Da hơi khô vào buổi chiều, thức khuya do công việc..."
                  className="w-full rounded-2xl bg-white/90 border border-[#E8ECEE] px-4 py-3.5 text-sm text-[#17353D] placeholder-[#94A3B8] focus:border-[#2C8E92] focus:outline-none focus:ring-2 focus:ring-[#2C8E92]/20 transition"
                />
              </div>

              {/* 12. Error Message */}
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm font-medium text-rose-600 text-center shadow-sm"
                >
                  {errorMessage}
                </motion.p>
              )}

              {/* 11. Success Message Toast Card (Apple Wallet Style) */}
              {savedMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 text-emerald-800 shadow-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold">{savedMessage}</p>
                </motion.div>
              )}

              {/* 14. Sticky / Primary Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01, backgroundPosition: 'right center' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5 }}
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(44,142,146,0.35)] transition disabled:opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #2C8E92 0%, #67D6E8 50%, #6F9D8D 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                {submitting ? 'Đang lưu...' : 'Lưu điểm danh hôm nay'}
              </motion.button>
            </motion.div>

            {/* ════════════════ SECTION 4: AI FEEDBACK ════════════════ */}
            <AnimatePresence>
              {feedbackPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="rounded-3xl border border-[#2C8E92]/30 bg-white/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_36px_rgba(44,142,146,0.15)] relative"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#2C8E92] via-[#67D6E8] to-[#2C8E92] px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-white" />
                      <span className="text-xs font-extrabold uppercase tracking-widest">
                        Tomorrow&apos;s Focus · Gợi ý ngày mai
                      </span>
                    </div>
                    {feedbackPreview.phaseTitle && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${previewPhaseTheme.badge}`}
                      >
                        <ShieldIcon className="h-3 w-3" />
                        {feedbackPreview.phaseTitle}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-7 space-y-4">
                    <h4 className="text-xl font-extrabold text-[#17353D] leading-snug">
                      {feedbackPreview.adaptiveTask ||
                        feedbackPreview.feedbackText ||
                        'Tiếp tục giữ nhịp thói quen đang ổn.'}
                    </h4>

                    {feedbackPreview.feedbackText && feedbackPreview.adaptiveTask && (
                      <p className="text-sm leading-relaxed text-[#64748B]">
                        {feedbackPreview.feedbackText}
                      </p>
                    )}

                    <div className="pt-3 border-t border-[#E8ECEE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-xs text-[#94A3B8]">
                        Hệ thống đã tự động điều chỉnh ưu tiên ngày mai trong lộ trình của bạn.
                      </p>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          to={`/roadmap?day=${feedbackPreview.nextDate}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2C8E92] to-[#67D6E8] px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
                        >
                          Xem ngày mai trong lộ trình
                          <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        )}
      </div>
    </div>
  )
}

export default CheckInPage
