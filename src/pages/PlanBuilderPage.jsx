import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { isProfileComplete, useProfile } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { apiClient } from '../lib/apiClient'
import { buildPersonalizedPlan } from '../lib/planComposer'
import { loadPlanPreferences, savePlanPreferences } from '../lib/planPreferences'
import { SparklesIcon, TargetIcon, WalletIcon, TrophyIcon, CalendarIcon, CheckCircleIcon } from '../components/Icons'

const DEFAULT_FORM = {
  focusArea: 'calm_skin',
  monthlyBudget: 'balanced',
  commitment: 'steady',
  durationDays: 14,
  currentProducts: '',
  currentFoods: '',
  notes: '',
}

function PlanBuilderPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const { skincare, food } = useItems()
  const navigate = useNavigate()

  const initialForm = useMemo(() => {
    if (!user) return DEFAULT_FORM
    const saved = loadPlanPreferences(user.id)
    return saved?.form ? { ...DEFAULT_FORM, ...saved.form } : DEFAULT_FORM
  }, [user])

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setErrorMessage('')

    try {
      const plan = buildPersonalizedPlan(profile, form, skincare, food)
      await apiClient.post(
        '/roadmap/custom',
        {
          goal: plan.goal,
          durationDays: form.durationDays,
          tasks: plan.tasks,
        },
        { auth: true },
      )

      savePlanPreferences(user.id, {
        form,
        summary: plan.summary,
        goal: plan.goal,
        generatedAt: new Date().toISOString(),
      })

      navigate('/roadmap')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

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
            <SparklesIcon className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#2C8E92]/20 bg-[#2C8E92]/8 px-4 py-1.5 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C8E92]">
              AI PLAN BUILDER NETWORK
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#17353D]">
            Cần đăng nhập
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Đăng nhập để lưu kế hoạch cải thiện và để hệ thống AI theo dõi lộ trình riêng của bạn.
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

  // PROFILE REQUIRED STATE
  if (!isProfileComplete(profile)) {
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
            <TargetIcon className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#2C8E92]/20 bg-[#2C8E92]/8 px-4 py-1.5 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C8E92]">
              PROFILE REQUIRED · STEP 1
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#17353D]">
            Chưa có hồ sơ cơ địa
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Hãy hoàn thành hồ sơ cá nhân và xem kết quả kiểm tra trước khi tạo lập kế hoạch cải thiện.
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
                to="/profile"
                className="inline-flex items-center gap-2 px-9 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white cursor-pointer"
              >
                Điền hồ sơ ngay
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#67D6E8]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-10">
        {/* PAGE HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] space-y-4"
        >
          

          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#17353D]">
            Lập Kế Hoạch Cải Thiện
          </h1>

          <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Không chỉ dừng ở việc biết cái gì phù hợp hay nên tránh. Hãy cho hệ thống thêm bối cảnh sinh hoạt thực tế để khởi tạo lộ trình chăm sóc da &amp; dinh dưỡng có thể áp dụng ngay hàng ngày.
          </p>
        </motion.div>

        {/* 2-COLUMN DASHBOARD LAYOUT */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* LEFT FORM: AI INTERVIEW EXPERIENCE */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* SECTION 1: MỤC TIÊU & NGÂN SÁCH */}
            <div className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 sm:p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8ECEE]">
                <SparklesIcon className="h-4 w-4 text-[#2C8E92]" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2C8E92]">
                  1. Mục tiêu &amp; Ngân sách dự kiến
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {/* FOCUS AREA */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#17353D]">
                    <TargetIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                    Mục tiêu ưu tiên
                  </label>
                  <select
                    value={form.focusArea}
                    onChange={(e) => updateField('focusArea', e.target.value)}
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#17353D] focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  >
                    <option value="calm_skin">Làm dịu da, giảm kích ứng</option>
                    <option value="acne_control">Kiểm soát dầu &amp; giảm mụn</option>
                    <option value="glow_up">Da sáng khỏe, đều màu hơn</option>
                    <option value="healthy_eating">Ăn uống ổn định từ bên trong</option>
                  </select>
                </div>

                {/* MONTHLY BUDGET */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#17353D]">
                    <WalletIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                    Ngân sách / tháng
                  </label>
                  <select
                    value={form.monthlyBudget}
                    onChange={(e) => updateField('monthlyBudget', e.target.value)}
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#17353D] focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  >
                    <option value="lean">Tiết kiệm (Dưới 500k)</option>
                    <option value="balanced">Cân bằng (500k - 1.5tr)</option>
                    <option value="premium">Đầu tư sâu (Trên 1.5tr)</option>
                  </select>
                </div>

                {/* COMMITMENT */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#17353D]">
                    <TrophyIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                    Mức cam kết
                  </label>
                  <select
                    value={form.commitment}
                    onChange={(e) => updateField('commitment', e.target.value)}
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#17353D] focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  >
                    <option value="quick">Nhanh gọn (10 phút/ngày)</option>
                    <option value="steady">Vừa phải (20 phút/ngày)</option>
                    <option value="deep">Chăm kỹ (30 phút/ngày)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: ROUTINE & THÓI QUEN HIỆN TẠI */}
            <div className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 sm:p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8ECEE]">
                <SparklesIcon className="h-4 w-4 text-[#2C8E92]" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2C8E92]">
                  2. Thói quen &amp; Sản phẩm đang sử dụng
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#17353D]">
                    Sản phẩm đang dùng
                  </label>
                  <textarea
                    rows={4}
                    value={form.currentProducts}
                    onChange={(e) => updateField('currentProducts', e.target.value)}
                    placeholder="Ví dụ: sữa rửa mặt BHA, serum vitamin C, kem chống nắng kiềm dầu..."
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] p-4 text-xs font-medium text-[#17353D] placeholder-[#64748B]/60 focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#17353D]">
                    Thói quen ăn uống hiện tại
                  </label>
                  <textarea
                    rows={4}
                    value={form.currentFoods}
                    onChange={(e) => updateField('currentFoods', e.target.value)}
                    placeholder="Ví dụ: hay uống cà phê sữa, ăn đồ cay nóng, ít uống nước, ăn ngoài..."
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] p-4 text-xs font-medium text-[#17353D] placeholder-[#64748B]/60 focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: THỜI GIAN & GHI CHÚ BỔ SUNG */}
            <div className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 sm:p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8ECEE]">
                <SparklesIcon className="h-4 w-4 text-[#2C8E92]" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2C8E92]">
                  3. Thời gian tập trung &amp; Ghi chú thêm
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-[0.7fr_1.3fr]">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#17353D]">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                    Số ngày tập trung
                  </label>
                  <select
                    value={form.durationDays}
                    onChange={(e) => updateField('durationDays', Number(e.target.value))}
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#17353D] focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  >
                    <option value={7}>7 ngày tăng tốc</option>
                    <option value={14}>14 ngày ổn định</option>
                    <option value={21}>21 ngày xây thói quen</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#17353D]">
                    Điều bạn muốn AI lưu ý thêm
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Ví dụ: thức khuya học bài, hay đi ngoài đường khói bụi, da nhạy cảm dễ đỏ..."
                    className="w-full rounded-2xl bg-[#F7FBFC] border border-[#E8ECEE] p-4 text-xs font-medium text-[#17353D] placeholder-[#64748B]/60 focus:border-[#2C8E92] focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700 text-center">
                {errorMessage}
              </div>
            )}

            {/* SUBMIT BUTTON & SECONDARY LINK */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={submitting ? {} : { backgroundPosition: 'right center' }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full sm:flex-1 rounded-2xl px-7 py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_8px_25px_rgba(103,214,232,0.35)] transition-all cursor-pointer overflow-hidden disabled:opacity-50"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                  backgroundSize: '200% auto',
                  transition: '0.5s',
                }}
              >
                {submitting ? 'Đang khởi tạo lộ trình AI...' : 'Tạo kế hoạch cải thiện cho tôi →'}
              </motion.button>

              <Link
                to="/roadmap/custom"
                className="w-full sm:w-auto text-center rounded-2xl border border-[#2C8E92]/30 bg-white px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#2C8E92] hover:border-[#2C8E92] hover:bg-[#2C8E92]/5 transition-all shadow-xs"
              >
                Tự nhập việc thủ công
              </Link>
            </div>
          </motion.form>

          {/* RIGHT SIDEBAR & AI ROADMAP PREVIEW */}
          <div className="space-y-8">
            {/* AI ROADMAP PREVIEW MOCKUP CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2C8E92] flex items-center gap-1.5">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Roadmap Preview
                </span>
                <span className="rounded-full bg-[#6F9D8D]/15 text-[#2C8E92] border border-[#6F9D8D]/30 px-3 py-0.5 text-[10px] font-extrabold">
                  Sample Timeline
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-white border border-[#E8EEF0] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2C8E92] text-white text-xs font-black">
                      W1
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#17353D]">Tuần 1: Phục hồi nền da</p>
                      <p className="text-[11px] text-[#64748B]">Tập trung làm dịu &amp; giảm kích ứng</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-[#6F9D8D]" />
                </div>

                <div className="rounded-2xl bg-white border border-[#E8EEF0] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#67D6E8] text-[#17353D] text-xs font-black">
                      W2
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#17353D]">Tuần 2: Ổn định thói quen</p>
                      <p className="text-[11px] text-[#64748B]">Bổ sung dinh dưỡng &amp; chống nắng</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#A87A45]">In Progress</span>
                </div>
              </div>
            </motion.div>

            {/* AI PANEL 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-4"
            >
              <h2 className="font-display text-lg font-extrabold text-[#17353D] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#2C8E92]" />
                Kế hoạch này sẽ làm gì?
              </h2>
              <ul className="space-y-3 text-xs leading-relaxed text-[#64748B]">
                <li className="flex items-start gap-2">
                  <span className="text-[#2C8E92] font-bold">•</span>
                  Biến kết quả kiểm tra thành hành động cụ thể cho từng ngày.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2C8E92] font-bold">•</span>
                  Ưu tiên mục tiêu bạn cần nhất thay vì đưa ra lời khuyên chung chung.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2C8E92] font-bold">•</span>
                  Tự động cân đối theo ngân sách và thời gian cam kết của bạn.
                </li>
              </ul>
            </motion.div>

            {/* AI PANEL 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-7 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-4"
            >
              <h2 className="font-display text-lg font-extrabold text-[#17353D] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6F9D8D]" />
                Sau khi tạo xong
              </h2>
              <p className="text-xs leading-relaxed text-[#64748B]">
                Trang <strong>Lộ trình</strong> sẽ tự động chuyển sang giao diện Dashboard: theo dõi các việc cần làm hôm nay, tiến độ streak, và đo lường mức độ hoàn thành.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanBuilderPage
