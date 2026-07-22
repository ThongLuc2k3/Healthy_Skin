import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon } from '../components/Icons'

function ExpertCard({ expert }) {
  const hasUnverified = expert.certifications.some((c) => !c.verified)
  return (
    <Link
      to={`/experts/${expert.id}`}
      className="block rounded-3xl glass-strong border border-cyan-400/20 p-6 shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-glow">
          <StethoscopeIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gradient-cyan">{expert.name}</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {expert.specialty} · {expert.clinic_name}
          </p>
          <p className="mt-1 text-xs text-cyan-300/70 font-mono">{expert.area_vi}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <StarIcon className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-white">{expert.rating_avg.toFixed(1)}</span>
            <span className="text-slate-400">({expert.reviews.length} đánh giá)</span>
          </div>
          {hasUnverified && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-[11px] font-medium text-amber-300">
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
  }, [area])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Kết nối chuyên gia</h1>
        <p className="mt-3 text-base text-slate-300/90">Đặt lịch tư vấn 1-1 với chuyên gia da liễu/dinh dưỡng.</p>
      </div>

      <div className="mt-6 rounded-2xl glass border border-amber-500/30 px-5 py-3.5 text-center text-xs text-amber-200 leading-relaxed shadow-glow">
        Danh sách chuyên gia, đánh giá và chứng chỉ dưới đây là <strong className="text-amber-300">dữ liệu mẫu cho mục đích demo</strong>,
        không phải mạng lưới đối tác y tế đã ký kết thật.
      </div>

      {status === 'ready' && areas.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <label htmlFor="areaFilter" className="text-sm font-medium text-slate-300">
            Khu vực:
          </label>
          <select
            id="areaFilter"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-xl bg-slate-900 border border-cyan-400/20 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
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

      <div className="mt-8 space-y-4">
        {status === 'loading' && <p className="text-center text-sm text-cyan-300/70">Đang tải...</p>}
        {status === 'error' && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
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
