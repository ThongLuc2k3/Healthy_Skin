import { useEffect, useState } from 'react'
import { expertApiClient, getExpertToken, setExpertToken } from '../../lib/apiClient'
import { SendIcon, StethoscopeIcon, LogOutIcon } from '../../components/Icons'

function ExpertLoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await expertApiClient.post('/expert-portal/login', { email, password })
      setExpertToken(data.token)
      onLoggedIn(data.expert)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-3xl border border-[#E8EEF0] bg-white p-8 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2C8E92]/10 text-[#2C8E92]">
          <StethoscopeIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-[#17353D]">Expert Dashboard</h1>
          <p className="text-xs text-[#64748B]">Đăng nhập tài khoản chuyên gia (demo)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vd: bs_nguyen_van_a@demo-expert.local"
          className="w-full rounded-xl border border-[#E8EEF0] bg-[#F7FBFC] px-4 py-2.5 text-sm text-[#17353D] focus:border-[#2C8E92] focus:outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu demo"
          className="w-full rounded-xl border border-[#E8EEF0] bg-[#F7FBFC] px-4 py-2.5 text-sm text-[#17353D] focus:border-[#2C8E92] focus:outline-none"
        />
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#2C8E92] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17353D] disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-5 rounded-xl bg-[#F7FBFC] border border-[#E8EEF0] p-3 text-[11px] leading-relaxed text-[#64748B]">
        Đây là tài khoản demo tự sinh cho mỗi chuyên gia mẫu: email dạng{' '}
        <code className="text-[#2C8E92]">&lt;id_chuyên_gia&gt;@demo-expert.local</code>, mật khẩu{' '}
        <code className="text-[#2C8E92]">demo1234</code>. Không phải cơ chế đăng nhập đối tác thật.
      </p>
    </div>
  )
}

function ThreadPanel({ bookingId, onSent }) {
  const [thread, setThread] = useState(null)
  const [products, setProducts] = useState([])
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [recommendedProductId, setRecommendedProductId] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await expertApiClient.get(`/expert-portal/bookings/${bookingId}/thread`)
      setThread(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    expertApiClient.get('/sponsored/products').then(setProducts).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() && !imageFile) return
    setSending(true)
    setError('')
    try {
      const formData = new FormData()
      if (text.trim()) formData.append('text', text.trim())
      if (recommendedProductId) formData.append('recommendedProductId', recommendedProductId)
      if (imageFile) formData.append('image', imageFile)
      await expertApiClient.post(`/expert-portal/bookings/${bookingId}/thread/messages`, formData, {
        isFormData: true,
      })
      setText('')
      setImageFile(null)
      setRecommendedProductId('')
      await load()
      onSent?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!thread) return <p className="text-sm text-[#64748B]">Đang tải cuộc trò chuyện...</p>

  const profile = thread.profileSnapshot

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E8EEF0] bg-[#F7FBFC] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">Hồ sơ cá nhân người dùng đã gửi</p>
        <div className="mt-2 grid gap-1 text-xs text-[#17353D] sm:grid-cols-2">
          <p><span className="text-[#64748B]">Loại da:</span> {profile?.skinType || 'chưa khai báo'}</p>
          <p><span className="text-[#64748B]">Mục tiêu:</span> {(profile?.goals || []).join(', ') || 'không có'}</p>
          <p><span className="text-[#64748B]">Dị ứng:</span> {(profile?.allergies || []).join(', ') || 'không có'}</p>
          <p><span className="text-[#64748B]">Bệnh lý nền:</span> {(profile?.conditions || []).join(', ') || 'không có'}</p>
        </div>
      </div>

      <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-2xl border border-[#E8EEF0] bg-white p-3">
        {thread.messages.length === 0 && (
          <p className="py-6 text-center text-xs text-[#64748B]">Chưa có tin nhắn nào.</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderType === 'expert' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.senderType === 'expert' ? 'bg-[#2C8E92] text-white' : 'bg-[#F7FBFC] border border-[#E8EEF0] text-[#17353D]'
              }`}
            >
              {m.text && <p className="whitespace-pre-line">{m.text}</p>}
              {m.hasImage && <p className="mt-1 text-[11px] italic opacity-80">[đã gửi 1 ảnh]</p>}
              {m.recommendedProductId && (
                <p className="mt-1 text-[11px] font-semibold opacity-90">
                  Gợi ý sản phẩm liên kết: {products.find((p) => p.id === m.recommendedProductId)?.name || m.recommendedProductId}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập nội dung tư vấn..."
          rows={2}
          className="w-full rounded-xl border border-[#E8EEF0] bg-[#F7FBFC] px-3 py-2 text-sm text-[#17353D] focus:border-[#2C8E92] focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={recommendedProductId}
            onChange={(e) => setRecommendedProductId(e.target.value)}
            className="rounded-lg border border-[#E8EEF0] bg-white px-2.5 py-1.5 text-xs text-[#17353D]"
          >
            <option value="">Không gợi ý sản phẩm</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <label className="cursor-pointer rounded-lg border border-[#E8EEF0] bg-white px-2.5 py-1.5 text-xs text-[#17353D] hover:border-[#2C8E92]">
            {imageFile ? imageFile.name.slice(0, 20) : 'Đính kèm ảnh'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={sending || (!text.trim() && !imageFile)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#2C8E92] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#17353D] disabled:opacity-60"
          >
            <SendIcon className="h-3.5 w-3.5" />
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </form>
    </div>
  )
}

function ExpertDashboardPage() {
  const [expert, setExpert] = useState(null)
  const [loggedIn, setLoggedIn] = useState(Boolean(getExpertToken()))
  const [bookings, setBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  async function loadBookings() {
    try {
      const data = await expertApiClient.get('/expert-portal/bookings')
      setBookings(data)
    } catch {
      setLoggedIn(false)
      setExpertToken(null)
    }
  }

  useEffect(() => {
    if (loggedIn) loadBookings()
  }, [loggedIn])

  function handleLogout() {
    setExpertToken(null)
    setLoggedIn(false)
    setBookings([])
    setSelectedBookingId(null)
  }

  if (!loggedIn) {
    return (
      <ExpertLoginForm
        onLoggedIn={(e) => {
          setExpert(e)
          setLoggedIn(true)
        }}
      />
    )
  }

  return (
    <div className="mx-auto mt-12 max-w-[1000px] px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#17353D]">Expert Dashboard</h1>
          <p className="text-sm text-[#64748B]">{expert?.name || 'Chuyên gia'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl border border-[#E8EEF0] px-3.5 py-2 text-xs font-bold text-[#64748B] hover:text-rose-600 hover:border-rose-300"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {bookings.length === 0 && (
            <p className="text-sm text-[#64748B]">Chưa có lịch hẹn nào.</p>
          )}
          {bookings.map((b) => (
            <button
              key={b.bookingId}
              type="button"
              onClick={() => setSelectedBookingId(b.bookingId)}
              className={`block w-full rounded-xl border px-4 py-3 text-left text-xs font-semibold transition ${
                selectedBookingId === b.bookingId
                  ? 'border-[#2C8E92] bg-[#2C8E92]/10 text-[#2C8E92]'
                  : 'border-[#E8EEF0] bg-white text-[#17353D] hover:border-[#2C8E92]/50'
              }`}
            >
              <p>Khung giờ: {b.slot}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider opacity-70">
                {b.status === 'pending_review' ? 'Chưa xem hồ sơ' : 'Đang trao đổi'}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-[#E8EEF0] bg-white p-6 shadow-xs">
          {selectedBookingId ? (
            <ThreadPanel bookingId={selectedBookingId} onSent={loadBookings} />
          ) : (
            <p className="text-sm text-[#64748B]">Chọn một lịch hẹn bên trái để xem hồ sơ và nhắn tin.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpertDashboardPage
