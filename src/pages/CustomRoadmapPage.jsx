import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { getRecommendations, RESULT } from '../logic/matchEngine'
import { apiClient } from '../lib/apiClient'
import {
  WarningIcon,
  TrashIcon,
  SparklesIcon,
  CalendarIcon,
  TargetIcon,
  ShieldIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '../components/Icons'

const MAX_DURATION_DAYS = 60

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

function CustomRoadmapPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const { skincare, food } = useItems()
  const navigate = useNavigate()

  const [goal, setGoal] = useState('')
  const [durationDays, setDurationDays] = useState(14)
  const [tasks, setTasks] = useState([''])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const avoidItems = useMemo(() => {
    if (!isProfileComplete(profile)) return []
    const skincareAvoid = getRecommendations(profile, skincare)[RESULT.AVOID]
    const foodAvoid = getRecommendations(profile, food)[RESULT.AVOID]
    return [...skincareAvoid, ...foodAvoid]
  }, [profile, skincare, food])

  function findWarning(taskText) {
    const normalized = taskText.trim().toLowerCase()
    if (!normalized) return null
    const match = avoidItems.find((item) => normalized.includes(item.name_vi.toLowerCase()))
    if (!match) return null
    return `Mục này có thể không phù hợp với hồ sơ của bạn (${match.name_vi}: ${match.reason}). Vẫn muốn thêm vào lộ trình?`
  }

  function updateTask(index, value) {
    setTasks((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  function addTask() {
    setTasks((prev) => [...prev, ''])
  }

  function removeTask(index) {
    setTasks((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanTasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0)
    if (cleanTasks.length === 0) {
      setErrorMessage('Vui lòng nhập ít nhất một việc muốn làm mỗi ngày.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      await apiClient.post(
        '/roadmap/custom',
        { goal, durationDays, tasks: cleanTasks },
        { auth: true },
      )
      navigate('/roadmap')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

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
              Đăng nhập để tạo lộ trình riêng
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Hệ thống cần tài khoản của bạn để lưu kế hoạch cá nhân, đồng bộ tiến trình và giúp bạn theo dõi quá trình cải thiện mỗi ngày.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                to="/login"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.4)] transition"
                style={{
                  backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
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
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C8E92]">
                <CheckCircleIcon className="h-4 w-4 text-[#2C8E92]" />
                <span>Đăng nhập</span>
              </div>
              <span className="text-xs text-[#94A3B8]">→</span>
              <div className="flex items-center gap-1.5 rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/30 px-3 py-1 text-xs font-bold text-[#2C8E92]">
                <span>Hồ sơ</span>
              </div>
              <span className="text-xs text-[#94A3B8]">→</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
                <span>Tạo lộ trình</span>
              </div>
            </div>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF] shadow-[0_0_24px_rgba(111,157,141,0.3)]">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#17353D]">
              Hãy hoàn thành hồ sơ trước
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              AI cần hiểu cơ địa, loại da và thói quen sinh hoạt của bạn trước khi hỗ trợ tự tạo lộ trình cải thiện cá nhân.
            </p>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                to="/profile"
                className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(44,142,146,0.35)] transition"
                style={{
                  backgroundImage: 'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Điền hồ sơ
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
        {/* ── Hero Section ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="rounded-3xl p-8 sm:p-10 border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(44,142,146,0.10)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C8E92]/5 via-transparent to-[#D8B27A]/5 pointer-events-none" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/20 px-4 py-1.5 text-xs font-bold tracking-widest text-[#2C8E92] uppercase">
                  CUSTOM ROADMAP
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17353D] leading-tight">
                  Tự thiết kế lộ trình
                </h1>
                <p className="mt-3 text-base leading-relaxed text-[#64748B] max-w-xl">
                  Người dùng có toàn quyền tự xây dựng routine theo nhu cầu cá nhân. Tự chọn mục tiêu, số ngày và từng công việc thực hiện mỗi ngày.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to="/roadmap"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C8E92] hover:underline"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Dùng lộ trình hệ thống tự sinh thay vào đó
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

                {/* Glass Rectangle */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-2 right-4 h-10 w-10 rounded-xl bg-white/80 border border-white backdrop-blur-md shadow-md"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main Form Layout ─────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Goal Section */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 hover:shadow-[0_8px_32px_rgba(44,142,146,0.12)] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] to-[#67D6E8] text-white shadow-sm">
                <TargetIcon className="h-5 w-5" />
              </div>
              <div>
                <label htmlFor="goal" className="text-lg font-bold text-[#17353D]">
                  Mục tiêu chính
                </label>
                <p className="text-xs text-[#64748B]">
                  Xác định kết quả hoặc mong muốn ưu tiên cao nhất của bạn
                </p>
              </div>
            </div>

            <div className="mt-4">
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ví dụ: Giảm mụn trong 2 tuần"
                className="w-full rounded-2xl bg-white/90 border border-[#E8ECEE] px-5 py-4 text-base text-[#17353D] placeholder-[#94A3B8] shadow-inner focus:border-[#2C8E92] focus:outline-none focus:ring-2 focus:ring-[#2C8E92]/20 transition"
              />
            </div>
          </motion.div>

          {/* Card 2: Duration Section */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 hover:shadow-[0_8px_32px_rgba(44,142,146,0.12)] transition-all"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9D8D] to-[#BFD8CF] text-white shadow-sm">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <label htmlFor="durationDays" className="text-lg font-bold text-[#17353D]">
                    Số ngày mong muốn
                  </label>
                  <p className="text-xs text-[#64748B]">
                    Khoảng thời gian tập trung thực hiện (tối đa {MAX_DURATION_DAYS} ngày)
                  </p>
                </div>
              </div>

              {/* Apple Health Metric Display */}
              <div className="flex items-baseline gap-2 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-[#2C8E92]/20 px-5 py-3">
                <span className="text-3xl font-extrabold text-[#2C8E92]">{durationDays || 0}</span>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  ngày
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <input
                id="durationDays"
                type="number"
                min={1}
                max={MAX_DURATION_DAYS}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-40 rounded-2xl bg-white/90 border border-[#E8ECEE] px-5 py-3 text-base font-bold text-[#17353D] focus:border-[#2C8E92] focus:outline-none focus:ring-2 focus:ring-[#2C8E92]/20 transition"
              />
              <span className="text-xs text-[#64748B]">
                Gợi ý: Khai báo từ 7 - 30 ngày để theo dõi hiệu quả rõ rệt nhất.
              </span>
            </div>
          </motion.div>

          {/* Card 3: Daily Tasks Section */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8 hover:shadow-[0_8px_32px_rgba(44,142,146,0.12)] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D8B27A] to-[#A87A45] text-white shadow-sm">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#17353D]">Việc muốn làm mỗi ngày</p>
                <p className="text-xs text-[#64748B]">
                  Tạo danh sách các thói quen, chu trình skincare hoặc dinh dưỡng
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <AnimatePresence>
                {tasks.map((task, index) => {
                  const warning = findWarning(task)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="group flex items-center gap-3 rounded-2xl border border-[#E8ECEE] bg-white/90 p-3.5 shadow-sm hover:border-[#2C8E92]/40 hover:shadow-md transition-all">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2C8E92]/10 text-xs font-extrabold text-[#2C8E92]">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => updateTask(index, e.target.value)}
                          placeholder="Ví dụ: Đắp mặt nạ đất sét"
                          className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[#17353D] placeholder-[#94A3B8] focus:outline-none"
                        />
                        {tasks.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeTask(index)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600 transition"
                            aria-label="Xoá việc"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </motion.button>
                        )}
                      </div>

                      {/* AI Warning Card */}
                      {warning && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-2xl bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/80 p-4 shadow-[0_4px_20px_rgba(245,158,11,0.12)] backdrop-blur-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                              <WarningIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-800">
                                Có thể không phù hợp
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                                {warning}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={addTask}
              className="mt-5 w-full rounded-2xl border border-dashed border-[#2C8E92]/30 bg-[#2C8E92]/5 py-3 text-sm font-semibold text-[#2C8E92] hover:border-[#2C8E92]/60 hover:bg-[#2C8E92]/10 transition"
            >
              + Thêm việc
            </motion.button>
          </motion.div>

          {/* Error Message */}
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm font-medium text-rose-600 text-center"
            >
              {errorMessage}
            </motion.p>
          )}

          {/* Card 4: Submit Card Footer */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="rounded-3xl border border-[#E8ECEE] bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,142,146,0.08)] p-7 sm:p-8"
          >
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
              {submitting ? 'Đang lưu...' : 'Lưu lộ trình riêng của tôi'}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default CustomRoadmapPage
