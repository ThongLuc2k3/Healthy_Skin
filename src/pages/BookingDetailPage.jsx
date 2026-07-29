import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient, openAuthedFile } from '../lib/apiClient'
import { ArrowLeftIcon, DocumentIcon, CheckCircleIcon } from '../components/Icons'

function BookingDetailPage() {
  const { id } = useParams()
  const { user, ready } = useAuth()

  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    apiClient
      .get(`/experts/bookings/${id}`, { auth: true })
      .then((data) => {
        setBooking(data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [id, user])

  async function handleUploadReport(file) {
    setUploading(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('report', file)
      const report = await apiClient.post('/profile/expert-report', formData, { auth: true, isFormData: true })
      const updated = await apiClient.patch(
        `/experts/bookings/${id}/link-report`,
        { reportId: report.id },
        { auth: true },
      )
      setBooking(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <Link to="/login" className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300">
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-cyan-300/70">Đang tải...</p>
  }
  if (status === 'error' || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">
          {errorMessage || 'Không tìm thấy lịch hẹn.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Link
        to={`/experts/${booking.expert?.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {booking.expert?.name}
      </Link>

      <div className="mt-6 rounded-3xl glass-strong border border-cyan-400/25 p-7 shadow-glow-lg">
        <h1 className="text-2xl font-bold text-gradient-cyan">Chi tiết lịch hẹn</h1>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>
            <span className="text-slate-400">Chuyên gia:</span> {booking.expert?.name} ({booking.expert?.specialty})
          </p>
          <p>
            <span className="text-slate-400">Khung giờ:</span> <span className="font-mono text-cyan-300">{booking.slot}</span>
          </p>
          <p>
            <span className="text-slate-400">Trạng thái:</span>{' '}
            <span className={booking.status === 'completed' ? 'font-semibold text-emerald-300' : 'text-cyan-300'}>
              {booking.status === 'completed' ? 'Đã hoàn tất tư vấn (mô phỏng)' : 'Đã đặt lịch (mô phỏng)'}
            </span>
          </p>
        </div>

        <p className="mt-4 rounded-xl glass border border-amber-500/30 px-4 py-3 text-xs text-amber-200">
          Đây là lịch hẹn mô phỏng cho mục đích demo — không phải cuộc gọi video/tư vấn y tế thật.
        </p>

        <div className="mt-6 border-t border-cyan-400/20 pt-6">
          <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Kết quả tư vấn</p>

          {booking.consultationReport ? (
            <button
              type="button"
              onClick={() => openAuthedFile(booking.consultationReport.fileUrl)}
              className="mt-3 flex items-center gap-2 rounded-xl glass border border-emerald-500/30 px-4 py-2.5 text-sm font-medium text-emerald-300 shadow-glow"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {booking.consultationReport.originalName || 'Xem kết quả tư vấn'}
            </button>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
                Sau khi tư vấn (mô phỏng) xong, tải lên kết quả/báo cáo bác sĩ cung cấp — sẽ được lưu vào hồ sơ mở
                rộng của bạn.
              </p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl glass border border-cyan-400/30 px-5 py-2.5 text-sm font-semibold text-cyan-200 hover:border-cyan-400">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleUploadReport(e.target.files[0])}
                />
                <DocumentIcon className="h-4 w-4 text-cyan-400" />
                {uploading ? 'Đang tải lên...' : 'Tải lên kết quả tư vấn'}
              </label>
            </>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailPage
