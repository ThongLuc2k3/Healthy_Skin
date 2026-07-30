import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { StarIcon, StethoscopeIcon, ArrowLeftIcon, SparklesIcon, CalendarIcon } from '../components/Icons'

function CertificationRow({ cert }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-[#FCFDFC] border border-[#E8EEF0] px-5 py-3.5 shadow-xs transition-all hover:border-[#2C8E92]/40">
      <span className="font-display text-sm font-bold text-[#17353D]">
        {cert.title_vi}
      </span>
      {cert.verified ? (
        <span className="rounded-full bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 px-3 py-1 text-xs font-bold text-[#2C8E92] shrink-0">
          Đã xác thực y khoa
        </span>
      ) : (
        <span className="rounded-full bg-[#D8B27A]/15 border border-[#D8B27A]/30 px-3 py-1 text-xs font-bold text-[#A87A45] shrink-0">
          Chờ xác thực chứng chỉ
        </span>
      )}
    </li>
  )
}

function ExpertDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [expert, setExpert] = useState(null)
  const [myBookings, setMyBookings] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    apiClient
      .get(`/experts/${id}`)
      .then((data) => {
        setExpert(data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [id])

  useEffect(() => {
    if (!user) return
    apiClient
      .get(`/experts/${id}/my-bookings`, { auth: true })
      .then(setMyBookings)
      .catch(() => {})
  }, [id, user])

  async function handleBook() {
    if (!selectedSlot) return
    setBooking(true)
    setErrorMessage('')
    try {
      const created = await apiClient.post(`/experts/${id}/book`, { slot: selectedSlot }, { auth: true })
      navigate(`/my-bookings/${created.id}`)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2C8E92] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2C8E92]">Đang tải thông tin chuyên gia...</p>
      </div>
    )
  }

  if (status === 'error' || !expert) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC]">
        <div className="mx-auto max-w-lg rounded-[28px] border border-rose-200 bg-rose-50/80 p-8 text-center shadow-xs">
          <p className="text-sm font-bold text-rose-700">
            {errorMessage || 'Không tìm thấy chuyên gia.'}
          </p>
          <Link
            to="/experts"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#17353D] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#2C8E92]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-10">
        {/* BACK BUTTON */}
        <div>
          <Link
            to="/experts"
            className="inline-flex items-center gap-2 rounded-full bg-[#FCFDFC] border border-[#E8ECEE] px-5 py-2 text-xs font-bold text-[#64748B] hover:text-[#2C8E92] hover:border-[#2C8E92] transition-all shadow-xs"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Danh sách chuyên gia
          </Link>
        </div>

        {/* PROFILE HERO & AI MATCHING SCORE BOX */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-center">
            {/* Left Doctor Info */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative shrink-0">
                <span className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2C8E92] via-[#67D6E8] to-[#6F9D8D] text-white shadow-[0_10px_30px_rgba(44,142,146,0.3)]">
                  <StethoscopeIcon className="h-12 w-12" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2C8E92]/20 bg-[#2C8E92]/8 px-3.5 py-1 text-xs font-bold text-[#2C8E92]">
                  <SparklesIcon className="h-3.5 w-3.5 text-[#2C8E92]" />
                  Chuyên Gia Da Liễu / Dinh Dưỡng
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#17353D]">
                  {expert.name}
                </h1>

                <p className="text-base font-semibold text-[#2C8E92]">
                  {expert.specialty} · {expert.clinic_name}
                </p>

                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Khu vực: {expert.area_vi}
                </p>

                <div className="pt-1 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <StarIcon className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    <span className="font-display text-lg font-black text-[#17353D]">
                      {expert.rating_avg.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">
                    ({expert.reviews.length} đánh giá từ người dùng)
                  </span>
                </div>
              </div>
            </div>

            {/* Right AI Matching Score summary badge card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#2C8E92]/10 via-[#FCFDFC] to-[#67D6E8]/10 border border-[#2C8E92]/25 p-6 space-y-4 shadow-xs text-center lg:text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#2C8E92]">
                  AI MATCHING SCORE
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#67D6E8]/20 text-[#2C8E92]">
                  <SparklesIcon className="h-4.5 w-4.5" />
                </span>
              </div>
              <div>
                <p className="font-display text-5xl font-black text-[#17353D]">96%</p>
                <p className="mt-1 text-xs font-bold text-[#2C8E92]">
                  Phù hợp với hồ sơ cơ địa của bạn
                </p>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Được AI đối chiếu kinh nghiệm và chuyên môn phù hợp nhất với các chỉ số da bạn đã khai báo.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2-COLUMN DASHBOARD GRID */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* LEFT COLUMN: KINH NGHIỆM & CHỨNG CHỈ */}
          <div className="space-y-10">
            {/* KINH NGHIỆM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-4"
            >
              <h2 className="font-display text-xl font-extrabold text-[#17353D] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2C8E92]" />
                Kinh nghiệm &amp; Chuyên môn
              </h2>
              <p className="text-sm leading-relaxed text-[#64748B] font-normal">
                {expert.bio_vi}
              </p>
            </motion.div>

            {/* CHỨNG CHỈ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-5"
            >
              <h2 className="font-display text-xl font-extrabold text-[#17353D] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6F9D8D]" />
                Chứng chỉ y khoa
              </h2>
              <ul className="space-y-3">
                {expert.certifications.map((cert, idx) => (
                  <CertificationRow key={idx} cert={cert} />
                ))}
              </ul>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: LỊCH TƯ VẤN & ĐÁNH GIÁ */}
          <div className="space-y-10">
            {/* LỊCH TƯ VẤN (BOOKING PANEL) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-[#17353D] flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#2C8E92]" />
                  Lịch tư vấn 1-1 (Demo)
                </h2>
                <span className="rounded-full bg-[#2C8E92]/10 border border-[#2C8E92]/20 px-3 py-1 text-[11px] font-bold text-[#2C8E92]">
                  Mô phỏng
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Đây là lịch hẹn mô phỏng cho mục đích demo — không phải cuộc gọi video/tư vấn y tế thật.
              </p>

              <div className="flex flex-wrap gap-3">
                {expert.available_slots.map((slot) => {
                  const isSelected = selectedSlot === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C8E92] text-white shadow-md ring-2 ring-[#67D6E8]'
                          : 'bg-[#F7FBFC] border border-[#E8ECEE] text-[#17353D] hover:border-[#2C8E92]'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>

              <div>
                {user ? (
                  <motion.button
                    type="button"
                    disabled={!selectedSlot || booking}
                    onClick={handleBook}
                    whileHover={
                      !selectedSlot || booking
                        ? {}
                        : { backgroundPosition: 'right center' }
                    }
                    whileTap={{ scale: !selectedSlot || booking ? 1 : 0.97 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_8px_25px_rgba(103,214,232,0.35)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                    }}
                  >
                    {booking ? 'Đang đặt lịch...' : 'Đặt lịch tư vấn (Demo)'}
                  </motion.button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-2xl bg-[#2C8E92] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#17353D]"
                  >
                    Đăng nhập để đặt lịch
                  </Link>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 text-center">
                  {errorMessage}
                </div>
              )}

              {myBookings.length > 0 && (
                <div className="pt-6 border-t border-[#E8ECEE] space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">
                    Lịch hẹn của bạn với chuyên gia này
                  </p>
                  <ul className="space-y-2">
                    {myBookings.map((b) => (
                      <li key={b.id}>
                        <Link
                          to={`/my-bookings/${b.id}`}
                          className="flex items-center justify-between rounded-xl bg-[#F7FBFC] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#17353D] hover:border-[#2C8E92] transition-colors"
                        >
                          <span>Khung giờ: {b.slot}</span>
                          <span className={b.status === 'completed' ? 'text-[#2C8E92]' : 'text-[#64748B]'}>
                            {b.status === 'completed' ? 'Đã hoàn tất' : 'Đã đặt lịch'}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* ĐÁNH GIÁ TỪ NGƯỜI DÙNG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(44,142,146,0.04)] space-y-5"
            >
              <h2 className="font-display text-xl font-extrabold text-[#17353D] flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-amber-500 fill-amber-400" />
                Đánh giá thực tế từ bệnh nhân
              </h2>

              <ul className="space-y-4">
                {expert.reviews.map((review, idx) => (
                  <li
                    key={idx}
                    className="rounded-2xl bg-white border border-[#E8EEF0] p-5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-display text-sm font-black text-[#17353D]">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#64748B]">
                        {review.user_display}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#17353D] font-normal">
                      "{review.comment_vi}"
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpertDetailPage
