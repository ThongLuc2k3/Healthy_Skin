import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon, SparklesIcon, CheckCircleIcon } from '../components/Icons'

function MapPinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21s-7-5.33-7-11.5a7 7 0 0114 0C19 15.67 12 21 12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ExpertCard({ expert, index }) {
  const hasUnverified = expert.certifications?.some((c) => !c.verified) ?? false
  const isAiRecommended = expert.rating_avg >= 4.8

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/experts/${expert.id}`}
        className="group relative flex flex-col justify-between h-full rounded-[28px] border border-[#E7ECEE] bg-[#FCFDFC] p-7 shadow-[0_12px_40px_rgba(44,142,146,0.06)] transition-all duration-300 hover:border-[#2C8E92] hover:shadow-[0_20px_50px_rgba(44,142,146,0.12)] overflow-hidden"
      >
        {/* Subtle Ambient Radial Lighting overlay */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#67D6E8]/20 via-[#BFD8CF]/20 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500" />

        <div className="relative z-10 space-y-5">
          {/* HEADER AVATAR & AI BADGE */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92] via-[#67D6E8] to-[#6F9D8D] text-white shadow-[0_6px_20px_rgba(44,142,146,0.3)] group-hover:scale-105 transition-transform duration-300">
                <StethoscopeIcon className="h-8 w-8" />
              </span>
            </div>

            {isAiRecommended ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2C8E92]/30 bg-[#2C8E92]/10 px-3 py-1 text-[11px] font-extrabold text-[#2C8E92] backdrop-blur-md">
                <SparklesIcon className="h-3 w-3 text-[#2C8E92]" />
                AI Recommended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7ECEE] bg-[#F7FBFC] px-3 py-1 text-[11px] font-bold text-[#64748B]">
                <MapPinIcon className="h-3 w-3 text-[#2C8E92]" />
                {expert.area_vi}
              </span>
            )}
          </div>

          {/* DOCTOR NAME & CLINIC */}
          <div>
            <h3 className="font-display text-xl font-black text-[#17353D] group-hover:text-[#2C8E92] transition-colors leading-snug">
              {expert.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#64748B]">
              {expert.specialty}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]/80 font-normal">
              {expert.clinic_name}
            </p>
          </div>

          {/* RATING & REVIEWS */}
          <div className="flex items-center gap-2 rounded-xl bg-[#F7FBFC] p-3 border border-[#E7ECEE]">
            <div className="flex items-center gap-1 text-amber-500">
              <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-display text-base font-black text-[#17353D]">
                {expert.rating_avg.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-[#64748B] font-normal">
              ({expert.reviews.length} đánh giá thực tế)
            </span>
          </div>

          {/* CERTIFICATION STATUS BADGE */}
          <div>
            {hasUnverified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D8B27A]/15 border border-[#D8B27A]/30 px-3 py-1 text-[11px] font-bold text-[#A87A45]">
                <WarningIcon className="h-3.5 w-3.5 text-[#A87A45]" />
                Chờ xác thực chứng chỉ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 px-3 py-1 text-[11px] font-bold text-[#2C8E92]">
                <CheckCircleIcon className="h-3.5 w-3.5 text-[#6F9D8D]" />
                Đã xác thực y khoa
              </span>
            )}
          </div>
        </div>

        {/* PRIMARY CTA GLASS BUTTON */}
        <div className="relative z-10 pt-6 mt-4 border-t border-[#E7ECEE]">
          <motion.div
            whileHover={{ backgroundPosition: 'right center' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(44,142,146,0.25)] transition-colors cursor-pointer overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
              backgroundSize: '200% auto',
              transition: '0.5s',
            }}
          >
            <span>Đặt lịch tư vấn 1-1</span>
            <span>→</span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

function ExpertListPage() {
  const { user } = useAuth()
  const [experts, setExperts] = useState([])
  const [areas, setAreas] = useState([])
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([apiClient.get('/experts'), apiClient.get('/experts/areas')])
      .then(([expertsList, areasList]) => {
        setExperts(expertsList)
        setAreas(areasList)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user])

  useEffect(() => {
    if (!user || status !== 'ready') return
    const path = area ? `/experts?area=${encodeURIComponent(area)}` : '/experts'
    apiClient.get(path).then(setExperts).catch(() => {})
  }, [area, user, status])

  if (!user) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] mt-12">
        {/* Soft Ambient Radial Lighting Circles */}
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
            <StethoscopeIcon className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#17353D]">
            Yêu cầu đăng nhập
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Vui lòng đăng nhập để truy cập mạng lưới tư vấn 1-1 với bác sĩ da liễu, đối chiếu hồ sơ cơ địa cá nhân và đặt lịch hẹn.
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#67D6E8]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-12">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E7ECEE] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] text-center space-y-4"
        >

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17353D]">
            Kết Nối Chuyên Gia
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Đặt lịch tư vấn 1-1 trực tiếp với các chuyên gia hàng đầu về da liễu và dinh dưỡng được đối chiếu phù hợp nhất với hồ sơ cá nhân của bạn.
          </p>

          <div className="mx-auto max-w-xl rounded-2xl bg-[#D8B27A]/10 border border-[#D8B27A]/30 p-4 text-center text-xs text-[#A87A45] leading-relaxed backdrop-blur-xs font-medium">
            Danh sách chuyên gia, đánh giá và chứng chỉ dưới đây là <strong className="font-bold text-[#17353D]">dữ liệu mẫu cho mục đích demo</strong>, không phải mạng lưới đối tác y tế đã ký kết thật.
          </div>
        </motion.div>

        {/* SEARCH & GLASS FILTER BAR */}
        {status === 'ready' && areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto max-w-md rounded-2xl bg-[#FCFDFC] p-3 border border-[#E7ECEE] shadow-lg backdrop-blur-xl flex items-center justify-between gap-3"
          >
            <label htmlFor="areaFilter" className="pl-3 text-xs font-bold uppercase tracking-wider text-[#2C8E92] shrink-0">
              Khu vực:
            </label>
            <select
              id="areaFilter"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl bg-[#F7FBFC] border border-[#E7ECEE] px-4 py-2.5 text-sm font-bold text-[#17353D] focus:border-[#2C8E92] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">Tất cả khu vực</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* EXPERTS LIST GRID */}
        <div className="space-y-6">
          {status === 'loading' && (
            <div className="py-20 text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#2C8E92] border-t-transparent" />
              <p className="text-sm font-bold text-[#2C8E92]">Đang đối chiếu dữ liệu chuyên gia từ AI...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mx-auto max-w-md rounded-2xl bg-rose-50 border border-rose-200 p-5 text-center text-sm font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {status === 'ready' && experts.length === 0 && (
            <div className="py-16 text-center text-sm font-medium text-[#64748B] rounded-3xl border border-dashed border-[#BFD8CF] bg-[#FCFDFC]">
              Không tìm thấy chuyên gia nào thuộc khu vực đã chọn.
            </div>
          )}

          {status === 'ready' && experts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {experts.map((expert, index) => (
                <ExpertCard key={expert.id} expert={expert} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpertListPage
