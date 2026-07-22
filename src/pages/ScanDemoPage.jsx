import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { matchProfile } from '../logic/matchEngine'
import { apiClient } from '../lib/apiClient'
import ResultCard from '../components/ResultCard'
import { SearchIcon, SparklesIcon, CameraIcon } from '../components/Icons'
import skincareData from '../data/skincare_ingredients.json'
import foodData from '../data/food_items.json'

const CATALOG = [
  ...skincareData.map((item) => ({ ...item, groupLabel: 'Mỹ phẩm' })),
  ...foodData.map((item) => ({ ...item, groupLabel: 'Thực phẩm' })),
]

function ScanDemoPage() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle')
  const [scanErrorMessage, setScanErrorMessage] = useState('')
  const [scanErrorIsConfig, setScanErrorIsConfig] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return CATALOG.filter((item) => item.name_vi.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  const manualMatch = selected ? matchProfile(profile, selected) : null

  function handleFileChange(e) {
    const nextFile = e.target.files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
    setScanStatus('idle')
    setScanErrorMessage('')
    setScanResult(null)
  }

  async function handleScanSubmit() {
    if (!file) return
    setScanStatus('loading')
    setScanErrorMessage('')
    setScanResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const data = await apiClient.post('/scan', formData, { auth: true, isFormData: true })
      setScanResult(data)
      setScanStatus('done')
    } catch (err) {
      setScanErrorMessage(err.message)
      setScanErrorIsConfig(err.status === 503)
      setScanStatus('error')
    }
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-3 text-sm text-slate-300">
          Vui lòng khai báo loại da của bạn trước khi dùng tính năng quét thử.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Quét sản phẩm</h1>
        <p className="mt-3 text-base text-slate-300/90 max-w-xl mx-auto">
          Chụp/tải ảnh sản phẩm, bảng thành phần hoặc nhãn dinh dưỡng — AI sẽ đọc và đối chiếu với hồ
          sơ của bạn.
        </p>
      </div>

      <section className="mt-8 rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg sm:p-7">
        <h2 className="flex items-center gap-2.5 text-base font-semibold text-gradient-cyan">
          <CameraIcon className="h-5 w-5 text-cyan-300" />
          Quét ảnh thật (AI)
        </h2>

        {!user ? (
          <p className="mt-4 rounded-2xl glass border border-cyan-400/20 px-4 py-3.5 text-sm text-slate-300 leading-relaxed">
            Cần <Link to="/login" className="font-semibold text-cyan-300 hover:underline">đăng nhập</Link> để dùng
            tính năng quét ảnh thật và lưu lịch sử quét. Bạn vẫn có thể dùng tìm kiếm thủ công bên
            dưới.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl glass border border-cyan-400/30 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400 shadow-glow"
              >
                Chọn ảnh
              </button>
              {file && (
                <button
                  type="button"
                  onClick={handleScanSubmit}
                  disabled={scanStatus === 'loading'}
                  className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
                >
                  {scanStatus === 'loading' ? 'Đang quét...' : 'Quét ảnh'}
                </button>
              )}
            </div>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Ảnh đã chọn"
                className="max-h-60 rounded-2xl border border-cyan-400/30 object-contain shadow-glow"
              />
            )}

            {scanStatus === 'error' && (
              <p
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium ${
                  scanErrorIsConfig
                    ? 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                    : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                <SparklesIcon className="h-4 w-4 shrink-0" />
                {scanErrorMessage}
              </p>
            )}

            {scanResult && (
              <>
                <ResultCard
                  item={{ id: 'ai-scan-result', name_vi: scanResult.productName }}
                  result={scanResult.result}
                  reason={scanResult.reason}
                />
                <p className="text-xs text-slate-400">
                  Kết quả do AI tự động đọc ảnh và suy luận — chỉ mang tính tham khảo, có thể chưa
                  hoàn toàn chính xác.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      <div className="my-8 flex items-center gap-4 text-xs font-mono font-semibold tracking-wider text-cyan-300/60 uppercase">
        <span className="h-px flex-1 bg-cyan-400/15" />
        Hoặc tìm thủ công
        <span className="h-px flex-1 bg-cyan-400/15" />
      </div>

      <section className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg sm:p-7">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
            placeholder="Nhập tên sản phẩm hoặc thực phẩm, ví dụ: dầu dừa, tôm..."
            className="w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 py-3.5 pr-4 pl-11 text-sm text-white placeholder-slate-500 shadow-sm transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
          />

          {filtered.length > 0 && !selected && (
            <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl glass-strong border border-cyan-400/30 shadow-glow-lg">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item)
                      setQuery(item.name_vi)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:bg-cyan-500/15 hover:text-white"
                  >
                    <span>{item.name_vi}</span>
                    <span className="rounded-full glass border border-cyan-400/20 px-2.5 py-0.5 text-xs text-cyan-300">
                      {item.groupLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {manualMatch && (
          <div className="mt-5">
            <ResultCard item={selected} result={manualMatch.result} reason={manualMatch.reason} />
          </div>
        )}
      </section>
    </div>
  )
}

export default ScanDemoPage
