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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-2 text-sm text-slate-500">
          Vui lòng khai báo loại da của bạn trước khi dùng tính năng quét thử.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Quét sản phẩm</h1>
        <p className="mt-2 text-sm text-slate-500">
          Chụp/tải ảnh sản phẩm, bảng thành phần hoặc nhãn dinh dưỡng — AI sẽ đọc và đối chiếu với hồ
          sơ của bạn.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CameraIcon className="h-4 w-4 text-emerald-600" />
          Quét ảnh thật (AI)
        </h2>

        {!user ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Cần <Link to="/login" className="font-semibold text-emerald-700">đăng nhập</Link> để dùng
            tính năng quét ảnh thật và lưu lịch sử quét. Bạn vẫn có thể dùng tìm kiếm thủ công bên
            dưới.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
              >
                Chọn ảnh
              </button>
              {file && (
                <button
                  type="button"
                  onClick={handleScanSubmit}
                  disabled={scanStatus === 'loading'}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {scanStatus === 'loading' ? 'Đang quét...' : 'Quét ảnh'}
                </button>
              )}
            </div>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Ảnh đã chọn"
                className="max-h-56 rounded-xl border border-slate-200 object-contain"
              />
            )}

            {scanStatus === 'error' && (
              <p
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                  scanErrorIsConfig
                    ? 'border border-blue-100 bg-blue-50 text-blue-700'
                    : 'border border-red-100 bg-red-50 text-red-700'
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

      <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Hoặc tìm thủ công
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
            placeholder="Nhập tên sản phẩm hoặc thực phẩm, ví dụ: dầu dừa, tôm..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />

          {filtered.length > 0 && !selected && (
            <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item)
                      setQuery(item.name_vi)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50"
                  >
                    <span>{item.name_vi}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {item.groupLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {manualMatch && (
          <div className="mt-4">
            <ResultCard item={selected} result={manualMatch.result} reason={manualMatch.reason} />
          </div>
        )}
      </section>
    </div>
  )
}

export default ScanDemoPage
