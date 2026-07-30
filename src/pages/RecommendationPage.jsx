import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { getRecommendations, RESULT } from '../logic/matchEngine'
import ResultGroup from '../components/ResultGroup'
import { CheckCircleIcon, WarningIcon, XCircleIcon, ArrowLeftIcon, SparklesIcon, CalendarIcon } from '../components/Icons'

function RecommendationPage() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('skincare')
  const { skincare, food } = useItems()

  const TABS = useMemo(
    () => [
      { id: 'skincare', label: 'Chăm sóc da', data: skincare },
      { id: 'food', label: 'Dinh dưỡng', data: food },
    ],
    [skincare, food],
  )

  const resultsByTab = useMemo(() => {
    if (!isProfileComplete(profile)) return null
    return Object.fromEntries(TABS.map((tab) => [tab.id, getRecommendations(profile, tab.data)]))
  }, [profile, TABS])

  if (!resultsByTab) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-lg rounded-[28px] border border-[#E8EEF0] bg-[#FCFDFC] p-8 text-center shadow-[0_12px_36px_rgba(44,142,146,0.06)]"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92] border border-[#2C8E92]/20">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#17353D]">Chưa có hồ sơ cơ địa</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            Vui lòng khai báo loại da của bạn trước để xem gợi ý cá nhân hóa.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2C8E92] via-[#67D6E8] to-[#6F9D8D] px-8 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,214,232,0.3)] transition-all hover:scale-105"
          >
            Điền hồ sơ ngay
          </Link>
        </motion.div>
      </div>
    )
  }

  const results = resultsByTab[activeTab]
  const suitableCount = results[RESULT.SUITABLE].length
  const cautionCount = results[RESULT.CAUTION].length
  const avoidCount = results[RESULT.AVOID].length

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-10">
        {/* AI HERO SUMMARY CARD */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8EEF0] bg-[#FCFDFC]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] text-center"
        >

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17353D]">
            Gợi ý dành riêng cho bạn
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed font-normal">
            Dựa trên hồ sơ cơ địa bạn đã khai báo. Bấm vào từng mục để xem phân tích AI chuyên sâu.
          </p>

          {/* DASHBOARD STATISTICS CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 grid gap-5 sm:grid-cols-3 text-left"
          >
            <div className="group rounded-2xl bg-white border border-[#E8EEF0] p-6 shadow-xs transition-all hover:border-[#6F9D8D] hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">Phù hợp</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6F9D8D]/15 text-[#2C8E92]">
                  <CheckCircleIcon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 font-display text-4xl font-black text-[#17353D] group-hover:text-[#2C8E92] transition-colors">
                {suitableCount}
              </p>
              <p className="mt-1 text-xs text-[#64748B]">Tương thích hoàn toàn với cơ địa</p>
            </div>

            <div className="group rounded-2xl bg-white border border-[#E8EEF0] p-6 shadow-xs transition-all hover:border-[#D8B27A] hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#A87A45]">Cần cân nhắc</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D8B27A]/15 text-[#A87A45]">
                  <WarningIcon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 font-display text-4xl font-black text-[#17353D] group-hover:text-[#A87A45] transition-colors">
                {cautionCount}
              </p>
              <p className="mt-1 text-xs text-[#64748B]">Chú ý liều lượng &amp; tần suất</p>
            </div>

            <div className="group rounded-2xl bg-white border border-[#E8EEF0] p-6 shadow-xs transition-all hover:border-rose-400 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Nên tránh</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700">
                  <XCircleIcon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 font-display text-4xl font-black text-[#17353D] group-hover:text-rose-700 transition-colors">
                {avoidCount}
              </p>
              <p className="mt-1 text-xs text-[#64748B]">Nguy cơ dị ứng hoặc kích ứng</p>
            </div>
          </motion.div>

          {/* NEXT STEP CTA GLASS CARD */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#2C8E92]/10 via-[#FCFDFC] to-[#67D6E8]/10 border border-[#2C8E92]/25 p-6 text-left shadow-xs sm:flex sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#17353D]">
                Bước tiếp theo: biến kết quả này thành kế hoạch cải thiện
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Hệ thống sẽ hỏi thêm ngân sách, mức cam kết, sản phẩm đang dùng và thói quen ăn uống để sinh ra lộ trình thực tế hơn cho chính bạn.
              </p>
            </div>
            <motion.div
              whileHover={{ backgroundPosition: 'right center' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 sm:mt-0 inline-flex shrink-0 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(103,214,232,0.3)] cursor-pointer overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                backgroundSize: '200% auto',
                transition: '0.5s',
              }}
            >
              <Link
                to="/roadmap/plan"
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white cursor-pointer"
              >
                <CalendarIcon className="h-4 w-4 text-white" />
                Lập kế hoạch cải thiện
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* APPLE-INSPIRED SEGMENTED CONTROL TABS */}
        <div className="sticky top-20 z-30 mx-auto max-w-md">
          <div className="flex rounded-full bg-[#FCFDFC] p-1.5 border border-[#E8EEF0] shadow-lg backdrop-blur-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 rounded-full py-3 text-sm font-bold transition-all duration-300 cursor-pointer ${
                    isActive ? 'text-white shadow-md' : 'text-[#64748B] hover:text-[#17353D]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-full bg-[#2C8E92]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* RESULT GROUPS BY CATEGORY */}
        <div className="space-y-8">
          <ResultGroup
            title="Phù hợp"
            resultValue={RESULT.SUITABLE}
            color="green"
            icon={<CheckCircleIcon className="h-5 w-5 text-[#2C8E92]" />}
            items={results[RESULT.SUITABLE]}
          />
          <ResultGroup
            title="Cần cân nhắc"
            resultValue={RESULT.CAUTION}
            color="yellow"
            icon={<WarningIcon className="h-5 w-5 text-[#A87A45]" />}
            items={results[RESULT.CAUTION]}
          />
          <ResultGroup
            title="Nên tránh"
            resultValue={RESULT.AVOID}
            color="red"
            icon={<XCircleIcon className="h-5 w-5 text-rose-600" />}
            items={results[RESULT.AVOID]}
          />
        </div>

        {/* BACK TO PROFILE BUTTON */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8EEF0] bg-[#FCFDFC] px-8 py-3.5 text-sm font-bold text-[#17353D] shadow-xs transition-all hover:bg-white hover:border-[#2C8E92] hover:shadow-md cursor-pointer"
          >
            <ArrowLeftIcon className="h-4 w-4 text-[#17353D]" />
            Quay lại chỉnh hồ sơ
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecommendationPage
