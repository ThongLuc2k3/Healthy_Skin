import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { ArrowLeftIcon, CheckCircleIcon } from '../components/Icons'

function formatVnd(amount) {
  return (amount || 0).toLocaleString('vi-VN') + 'đ'
}

function ServiceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [venue, setVenue] = useState(null)
  const [vouchers, setVouchers] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedVoucherId, setSelectedVoucherId] = useState('')
  const [status, setStatus] = useState('loading')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  useEffect(() => {
    apiClient
      .get(`/venues/${id}`)
      .then((data) => {
        setVenue(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  useEffect(() => {
    if (!user) return
    apiClient.get('/vouchers/mine?onlyUnused=true', { auth: true }).then(setVouchers).catch(() => {})
  }, [user])

  async function handleBook() {
    if (!selectedServiceId) return
    setBooking(true)
    setError('')
    try {
      const result = await apiClient.post(
        `/venues/services/${selectedServiceId}/book`,
        { userVoucherId: selectedVoucherId || null },
        { auth: true },
      )
      setConfirmedBooking(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (status === 'loading') {
    return <p className="mx-auto mt-24 text-center text-sm text-[#64748B]">Đang tải...</p>
  }
  if (status === 'error' || !venue) {
    return (
      <div className="mx-auto mt-24 max-w-lg px-4 text-center">
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
          Không tìm thấy trung tâm.
        </p>
        <Link to="/dich-vu" className="mt-4 inline-block text-sm font-bold text-[#2C8E92] underline">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  if (confirmedBooking) {
    return (
      <div className="mx-auto mt-16 max-w-lg px-4 py-12">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="text-xl font-bold text-[#17353D]">Đặt dịch vụ thành công (demo)</h1>
          <p className="text-sm text-[#17353D]">
            Mã hoá đơn: <span className="font-mono font-bold">{confirmedBooking.invoiceCode}</span>
          </p>
          <p className="text-2xl font-black text-[#2C8E92]">{formatVnd(confirmedBooking.finalPriceVnd)}</p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Đây là hoá đơn nội bộ của web dùng cho mục đích demo, không phải hoá đơn điện tử hợp lệ.
            Vui lòng đến trực tiếp {venue.name} và xuất trình mã hoá đơn này.
          </p>
          <Link
            to="/dich-vu"
            className="mt-4 inline-block rounded-full bg-[#2C8E92] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#17353D]"
          >
            Quay lại Dịch Vụ Quanh Bạn
          </Link>
        </div>
      </div>
    )
  }

  const selectedService = venue.services.find((s) => s.id === selectedServiceId)
  const selectedVoucher = vouchers.find((v) => v.id === Number(selectedVoucherId))
  const previewPrice = selectedService && selectedVoucher
    ? selectedVoucher.discountType === 'percent'
      ? Math.round(selectedService.priceVnd * (1 - selectedVoucher.discountValue / 100))
      : Math.max(selectedService.priceVnd - selectedVoucher.discountValue, 0)
    : selectedService?.priceVnd

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[800px]">
        <Link to="/dich-vu" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#2C8E92]">
          <ArrowLeftIcon className="h-4 w-4" />
          Dịch Vụ Quanh Bạn
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 rounded-[28px] border border-[#E8EEF0] bg-white p-8 shadow-xs"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2C8E92]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2C8E92]">
            {venue.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-[#17353D]">{venue.name}</h1>
          <p className="mt-1 text-sm text-[#64748B]">{venue.addressVi}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{venue.descriptionVi}</p>

          <div className="mt-6 border-t border-[#E8EEF0] pt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">Chọn dịch vụ</p>
            {venue.services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedServiceId(s.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedServiceId === s.id
                    ? 'border-[#2C8E92] bg-[#2C8E92]/5'
                    : 'border-[#E8EEF0] hover:border-[#2C8E92]/40'
                }`}
              >
                <span>
                  <span className="font-bold text-[#17353D]">{s.nameVi}</span>
                  {s.durationMinutes && <span className="ml-2 text-xs text-[#64748B]">{s.durationMinutes} phút</span>}
                </span>
                <span className="font-bold text-[#2C8E92]">{formatVnd(s.priceVnd)}</span>
              </button>
            ))}
          </div>

          {user ? (
            <>
              {vouchers.length > 0 && (
                <div className="mt-6 border-t border-[#E8EEF0] pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2C8E92]">Áp voucher (không bắt buộc)</p>
                  <select
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#E8EEF0] bg-[#F7FBFC] px-3 py-2.5 text-sm text-[#17353D]"
                  >
                    <option value="">Không dùng voucher</option>
                    {vouchers.map((v) => (
                      <option key={v.id} value={v.id}>{v.titleVi}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedService && (
                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#F7FBFC] border border-[#E8EEF0] px-4 py-3">
                  <span className="text-sm font-semibold text-[#17353D]">Tổng cộng (demo)</span>
                  <span className="text-lg font-black text-[#2C8E92]">{formatVnd(previewPrice)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleBook}
                disabled={!selectedServiceId || booking}
                className="mt-6 w-full rounded-2xl bg-[#2C8E92] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#17353D] disabled:opacity-50"
              >
                {booking ? 'Đang xử lý...' : 'Đặt cọc & xác nhận (demo)'}
              </button>
              {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-2xl bg-[#2C8E92] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white hover:bg-[#17353D]"
            >
              Đăng nhập để đặt dịch vụ
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ServiceDetailPage
