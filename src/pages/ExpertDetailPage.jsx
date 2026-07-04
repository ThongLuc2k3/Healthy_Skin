import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon, ArrowLeftIcon } from '../components/Icons'

function CertificationRow({ cert }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm">
      <span className="text-slate-700">{cert.title_vi}</span>
      {cert.verified ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Đã xác thực
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
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
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-slate-400">Đang tải...</p>
  }
  if (status === 'error' || !expert) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {errorMessage || 'Không tìm thấy chuyên gia.'}
        </p>
        <Link to="/experts" className="mt-4 inline-block text-sm font-semibold text-emerald-700">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/experts" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <ArrowLeftIcon className="h-4 w-4" />
        Danh sách chuyên gia
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <StethoscopeIcon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{expert.name}</h1>
            <p className="text-sm text-slate-500">
              {expert.specialty} · {expert.clinic_name}
            </p>
            <p className="text-xs text-slate-400">{expert.area_vi}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm">
              <StarIcon className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-slate-700">{expert.rating_avg.toFixed(1)}</span>
              <span className="text-slate-400">({expert.reviews.length} đánh giá)</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{expert.bio_vi}</p>

        <div className="mt-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Chứng chỉ</p>
          <ul className="mt-2 space-y-1.5">
            {expert.certifications.map((cert, idx) => (
              <CertificationRow key={idx} cert={cert} />
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Đánh giá từ người dùng</p>
          <ul className="mt-2 space-y-2">
            {expert.reviews.map((review, idx) => (
              <li key={idx} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-semibold text-slate-700">{review.rating}/5</span>
                  <span className="text-slate-400">— {review.user_display}</span>
                </div>
                <p className="mt-1 text-slate-600">{review.comment_vi}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Đặt lịch tư vấn (demo)</p>
          <p className="mt-1 text-xs text-slate-400">
            Đây là lịch hẹn mô phỏng cho mục đích demo — không phải cuộc gọi video/tư vấn y tế thật.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {expert.available_slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  selectedSlot === slot
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-200'
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
              className="mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {booking ? 'Đang đặt lịch...' : 'Đặt lịch (demo)'}
            </button>
          ) : (
            <Link
              to="/login"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
            >
              Đăng nhập để đặt lịch
            </Link>
          )}

          {errorMessage && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
          )}
        </div>

        {myBookings.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Lịch hẹn của bạn với chuyên gia này</p>
            <ul className="mt-2 space-y-1.5">
              {myBookings.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/my-bookings/${b.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="text-slate-700">{b.slot}</span>
                    <span className={b.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}>
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
