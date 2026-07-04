import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon } from '../components/Icons'

function ExpertCard({ expert }) {
  const hasUnverified = expert.certifications.some((c) => !c.verified)
  return (
    <Link
      to={`/experts/${expert.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <StethoscopeIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">{expert.name}</h3>
          <p className="text-xs text-slate-500">
            {expert.specialty} · {expert.clinic_name}
          </p>
          <p className="mt-1 text-xs text-slate-400">{expert.area_vi}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-slate-700">{expert.rating_avg.toFixed(1)}</span>
            <span className="text-slate-400">({expert.reviews.length} đánh giá)</span>
          </div>
          {hasUnverified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              <WarningIcon className="h-3 w-3" />
              Chưa xác thực chứng chỉ
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ExpertListPage() {
  const [experts, setExperts] = useState([])
  const [areas, setAreas] = useState([])
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (status !== 'ready') return
    const path = area ? `/experts?area=${encodeURIComponent(area)}` : '/experts'
    apiClient.get(path).then(setExperts).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Kết nối chuyên gia</h1>
        <p className="mt-2 text-sm text-slate-500">Đặt lịch tư vấn 1-1 với chuyên gia da liễu/dinh dưỡng.</p>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-800">
        Danh sách chuyên gia, đánh giá và chứng chỉ dưới đây là <strong>dữ liệu mẫu cho mục đích demo</strong>,
        không phải mạng lưới đối tác y tế đã ký kết thật.
      </div>

      {status === 'ready' && areas.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <label htmlFor="areaFilter" className="text-sm text-slate-500">
            Khu vực:
          </label>
          <select
            id="areaFilter"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          >
            <option value="">Tất cả khu vực</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {status === 'loading' && <p className="text-center text-sm text-slate-400">Đang tải...</p>}
        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}
        {status === 'ready' && experts.length === 0 && (
          <p className="text-center text-sm text-slate-400">Không có chuyên gia nào ở khu vực này.</p>
        )}
        {experts.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
    </div>
  )
}

export default ExpertListPage
