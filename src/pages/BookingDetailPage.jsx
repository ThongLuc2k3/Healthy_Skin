import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient, openAuthedFile, fetchAuthedBlobUrl } from '../lib/apiClient'
import { ArrowLeftIcon, DocumentIcon, CheckCircleIcon, SendIcon } from '../components/Icons'

function ConsultationThread({ bookingId }) {
  const [thread, setThread] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [productNames, setProductNames] = useState({})
  const [imageUrls, setImageUrls] = useState({})

  async function loadThread() {
    try {
      const data = await apiClient.get(`/experts/bookings/${bookingId}/thread`, { auth: true })
      setThread(data)
    } catch {
      // Chưa có thread (chưa đồng ý gửi hồ sơ khi đặt lịch) — bỏ qua, không hiện khung chat.
    }
  }

  useEffect(() => {
    loadThread()
    apiClient.get('/sponsored/products').then((products) => {
      setProductNames(Object.fromEntries(products.map((p) => [p.id, p.name])))
    }).catch(() => {})
    const interval = setInterval(loadThread, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  useEffect(() => {
    const imageMessages = thread?.messages?.filter((m) => m.hasImage) || []
    imageMessages.forEach((m) => {
      if (imageUrls[m.id]) return
      fetchAuthedBlobUrl(m.imageUrl).then((url) => {
        setImageUrls((prev) => ({ ...prev, [m.id]: url }))
      }).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread])

  async function handleSend(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    setError('')
    try {
      await apiClient.post(`/experts/bookings/${bookingId}/thread/messages`, { text: value }, { auth: true })
      setText('')
      await loadThread()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!thread) return null

  return (
    <div className="mt-6 border-t border-cyan-400/20 pt-6">
      <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
        Trò chuyện với chuyên gia
      </p>
      <p className="mt-1.5 text-xs text-slate-400">
        {thread.status === 'pending_review'
          ? 'Chuyên gia đang xem hồ sơ bạn đã gửi, chưa có tin nhắn mới.'
          : 'Cập nhật lại mỗi 15 giây.'}
      </p>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-xl glass border border-cyan-400/15 p-3">
        {thread.messages.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">Chưa có tin nhắn nào.</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.senderType === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium'
                  : 'glass border border-cyan-400/15 text-slate-200'
              }`}
            >
              {m.text && <p className="whitespace-pre-line">{m.text}</p>}
              {m.hasImage && imageUrls[m.id] && (
                <img src={imageUrls[m.id]} alt="Ảnh chuyên gia gửi" className="mt-2 max-h-56 rounded-lg" />
              )}
              {m.recommendedProductId && (
                <p className="mt-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
                  Gợi ý sản phẩm: {productNames[m.recommendedProductId] || m.recommendedProductId}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn tin cho chuyên gia..."
          className="flex-1 rounded-xl glass border border-cyan-400/20 px-3 py-2 text-sm text-slate-100 placeholder-white/30 focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>
      )}
    </div>
  )
}

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
      <div className="mx-auto mt-12 max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <Link to="/login" className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300">
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="mx-auto mt-12 max-w-2xl px-4 py-20 text-center text-sm text-slate-400">Đang tải...</p>
  }
  if (status === 'error' || !booking) {
    return (
      <div className="mx-auto mt-12 max-w-lg px-4 py-20 text-center">
        <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage || 'Không tìm thấy lịch hẹn.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-12 max-w-xl px-4 py-12">
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

        <p className="mt-4 rounded-xl glass border border-amber-500/30 px-4 py-3 text-xs text-amber-800">
          Đây là lịch hẹn mô phỏng cho mục đích demo, không phải cuộc gọi video/tư vấn y tế thật.
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
                Sau khi tư vấn (mô phỏng) xong, tải lên kết quả/báo cáo bác sĩ cung cấp, sẽ được lưu vào hồ sơ mở
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
            <p className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>
          )}
        </div>

        <ConsultationThread bookingId={booking.id} />
      </div>
    </div>
  )
}

export default BookingDetailPage
