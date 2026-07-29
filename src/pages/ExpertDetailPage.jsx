import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon, ArrowLeftIcon } from '../components/Icons'

function CertificationRow({ cert }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl glass border border-cyan-400/20 px-3.5 py-2.5 text-sm">
      <span className="text-slate-200">{cert.title_vi}</span>
      {cert.verified ? (
        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          Đã xác thực
        </span>
      ) : (
        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
          <WarningIcon className="h-3 w-3" />
          Chưa xác thực
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
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-cyan-300/70">Đang tải...</p>
  }
  if (status === 'error' || !expert) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">
          {errorMessage || 'Không tìm thấy chuyên gia.'}
        </p>
        <Link to="/experts" className="mt-4 inline-block text-sm font-semibold text-cyan-300 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/experts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300">
        <ArrowLeftIcon className="h-4 w-4" />
        Danh sách chuyên gia
      </Link>

      <div className="mt-6 rounded-3xl glass-strong border border-cyan-400/25 p-7 shadow-glow-lg">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-glow">
            <StethoscopeIcon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gradient-cyan">{expert.name}</h1>
            <p className="text-sm text-slate-300 mt-0.5">
              {expert.specialty} · {expert.clinic_name}
            </p>
            <p className="text-xs font-mono text-cyan-300/70 mt-1">{expert.area_vi}</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <StarIcon className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-white">{expert.rating_avg.toFixed(1)}</span>
              <span className="text-slate-400">({expert.reviews.length} đánh giá)</span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-300/90">{expert.bio_vi}</p>

        <div className="mt-6">
          <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Chứng chỉ</p>
          <ul className="mt-2.5 space-y-2">
            {expert.certifications.map((cert, idx) => (
              <CertificationRow key={idx} cert={cert} />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Đánh giá từ người dùng</p>
          <ul className="mt-2.5 space-y-2.5">
            {expert.reviews.map((review, idx) => (
              <li key={idx} className="rounded-2xl glass border border-cyan-400/15 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-semibold text-white">{review.rating}/5</span>
                  <span className="text-slate-400">— {review.user_display}</span>
                </div>
                <p className="mt-1.5 text-slate-300 leading-relaxed">{review.comment_vi}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border-t border-cyan-400/20 pt-6">
          <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Đặt lịch tư vấn (demo)</p>
          <p className="mt-1.5 text-xs text-slate-400">
            Đây là lịch hẹn mô phỏng cho mục đích demo — không phải cuộc gọi video/tư vấn y tế thật.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {expert.available_slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                  selectedSlot === slot
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-glow ring-1 ring-cyan-400'
                    : 'border-cyan-400/20 glass text-slate-300 hover:border-cyan-400/50 hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {user ? (
            <button
              type="button"
              disabled={!selectedSlot || booking}
              onClick={handleBook}
              className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {booking ? 'Đang đặt lịch...' : 'Đặt lịch (demo)'}
            </button>
          ) : (
            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
            >
              Đăng nhập để đặt lịch
            </Link>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
          )}
        </div>

        {myBookings.length > 0 && (
          <div className="mt-8 border-t border-cyan-400/20 pt-6">
            <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Lịch hẹn của bạn với chuyên gia này</p>
            <ul className="mt-3 space-y-2">
              {myBookings.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/my-bookings/${b.id}`}
                    className="flex items-center justify-between rounded-xl glass border border-cyan-400/20 px-4 py-3 text-sm hover:border-cyan-400"
                  >
                    <span className="text-slate-200">{b.slot}</span>
                    <span className={b.status === 'completed' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                      {b.status === 'completed' ? 'Đã hoàn tất' : 'Đã đặt lịch'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpertDetailPage
