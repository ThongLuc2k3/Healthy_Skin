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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-emerald-700">
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-slate-400">Đang tải...</p>
  }
  if (status === 'error' || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {errorMessage || 'Không tìm thấy lịch hẹn.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link
        to={`/experts/${booking.expert?.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {booking.expert?.name}
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Chi tiết lịch hẹn</h1>
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>
            <span className="text-slate-400">Chuyên gia:</span> {booking.expert?.name} ({booking.expert?.specialty})
          </p>
          <p>
            <span className="text-slate-400">Khung giờ:</span> {booking.slot}
          </p>
          <p>
            <span className="text-slate-400">Trạng thái:</span>{' '}
            <span className={booking.status === 'completed' ? 'font-semibold text-emerald-600' : 'text-slate-500'}>
              {booking.status === 'completed' ? 'Đã hoàn tất tư vấn (mô phỏng)' : 'Đã đặt lịch (mô phỏng)'}
            </span>
          </p>
        </div>

        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Đây là lịch hẹn mô phỏng cho mục đích demo — không phải cuộc gọi video/tư vấn y tế thật.
        </p>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Kết quả tư vấn</p>

          {booking.consultationReport ? (
            <button
              type="button"
              onClick={() => openAuthedFile(booking.consultationReport.fileUrl)}
              className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {booking.consultationReport.originalName || 'Xem kết quả tư vấn'}
            </button>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-500">
                Sau khi tư vấn (mô phỏng) xong, tải lên kết quả/báo cáo bác sĩ cung cấp — sẽ được lưu vào hồ sơ mở
                rộng của bạn.
              </p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleUploadReport(e.target.files[0])}
                />
                <DocumentIcon className="h-4 w-4" />
                {uploading ? 'Đang tải lên...' : 'Tải lên kết quả tư vấn'}
              </label>
            </>
          )}

          {errorMessage && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailPage
