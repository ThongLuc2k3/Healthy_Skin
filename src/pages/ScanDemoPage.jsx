import { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

const SCAN_MESSAGES = [
  'Đang nhận diện sản phẩm...',
  'Đang phân tích bảng thành phần...',
  'Đang đối chiếu với hồ sơ cơ địa...',
  'Đang tổng hợp đánh giá AI...',
]

function ScanDemoPage() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle')
  const [scanErrorMessage, setScanErrorMessage] = useState('')
  const [scanErrorIsConfig, setScanErrorIsConfig] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  // Upload options dropdown state
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  // Scanning text carousel index
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (scanStatus !== 'loading') return
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % SCAN_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [scanStatus])

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
    setShowUploadMenu(false)
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
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-lg rounded-[28px] border border-[#E8EEF0] bg-[#FCFDFC] p-8 text-center shadow-[0_12px_36px_rgba(44,142,146,0.06)]"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92] border border-[#2C8E92]/20">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#17353D]">Chưa có hồ sơ cơ địa</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            Vui lòng khai báo loại da của bạn trước khi sử dụng tính năng AI Scan Studio.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2C8E92] via-[#67D6E8] to-[#6F9D8D] px-8 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,214,232,0.3)] transition-all hover:scale-105"
          >
            Điền hồ sơ ngay
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Background Soft Ambient Light Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 left-0 h-[400px] w-[400px] rounded-full bg-[#67D6E8]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px]">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
          

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17353D]">
            Quét sản phẩm
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Chụp hoặc tải ảnh sản phẩm, bảng thành phần hoặc nhãn dinh dưỡng. AI sẽ phân tích và đối chiếu với hồ sơ của bạn để đưa ra đánh giá cá nhân hóa.
          </p>
        </motion.div>

        {/* MAIN UPLOAD CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 rounded-[32px] border border-[#E8EEF0] bg-[#FCFDFC]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)]"
        >
          <div className="flex items-center justify-between border-b border-[#E8EEF0] pb-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C8E92]/15 to-[#67D6E8]/20 text-[#2C8E92] border border-[#2C8E92]/25 shadow-xs">
                <CameraIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#17353D]">Quét ảnh thật (AI)</h2>
                <p className="text-xs text-[#64748B]">Tự động đọc nhãn &amp; phân tích thành phần</p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#67D6E8]/10 border border-[#2C8E92]/20 px-3.5 py-1 text-xs font-bold text-[#2C8E92]">
              <SparklesIcon className="h-3.5 w-3.5" /> 60 FPS Computer Vision
            </span>
          </div>

          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#2C8E92]/20 bg-gradient-to-r from-[#67D6E8]/10 via-[#FCFDFC] to-[#BFD8CF]/15 p-6 backdrop-blur-md shadow-xs text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#17353D]">Đăng nhập để mở khóa AI Scan</h3>
                <p className="text-sm text-[#64748B]">
                  Cần <Link to="/login" className="font-bold text-[#2C8E92] hover:underline">đăng nhập</Link> để dùng tính năng quét ảnh thật và lưu lịch sử quét. Bạn vẫn có thể dùng tìm kiếm thủ công bên dưới.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-4 sm:mt-0 shrink-0 inline-flex items-center gap-2 rounded-full bg-[#2C8E92] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#17353D] hover:scale-105"
              >
                Đăng nhập ngay
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Hidden input elements */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* DROPZONE / PREVIEW AREA */}
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#BFD8CF] bg-[#F7FBFC] p-12 text-center transition-all duration-300 hover:border-[#2C8E92] hover:bg-white hover:shadow-[0_8px_30px_rgba(103,214,232,0.12)] cursor-pointer"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_8px_20px_rgba(23,53,61,0.06)] border border-[#E8EEF0] group-hover:scale-110 transition-transform">
                    <CameraIcon className="h-9 w-9 text-[#2C8E92]" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#17353D]">
                    Tải ảnh sản phẩm hoặc kéo thả vào đây
                  </h3>
                  <p className="mt-1.5 text-sm text-[#64748B] max-w-md">
                    Hỗ trợ định dạng JPG, PNG hoặc WEBP. AI đọc tốt nhất trên ảnh chụp rõ chữ nhãn thành phần.
                  </p>

                  {/* Primary Trigger Glass Button with Dropdown */}
                  <div className="relative mt-6" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      type="button"
                      whileHover={{ backgroundPosition: 'right center' }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => setShowUploadMenu((v) => !v)}
                      className="group relative inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-[0_8px_25px_rgba(103,214,232,0.35)] transition-colors cursor-pointer overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                        backgroundSize: '200% auto',
                        transition: '0.5s',
                      }}
                    >
                      <span className="relative z-10">Chọn phương thức chụp / tải ảnh</span>
                      <span className="relative z-10 text-xs transition-transform duration-200">▼</span>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUploadMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 -translate-x-1/2 mt-3 z-30 w-64 overflow-hidden rounded-2xl bg-white border border-[#E8EEF0] shadow-2xl p-2"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              cameraInputRef.current?.click()
                              setShowUploadMenu(false)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#17353D] hover:bg-[#67D6E8]/10 hover:text-[#2C8E92] transition-colors"
                          >
                            <CameraIcon className="h-4.5 w-4.5 text-[#2C8E92]" />
                            Chụp ảnh trực tiếp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              fileInputRef.current?.click()
                              setShowUploadMenu(false)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#17353D] hover:bg-[#67D6E8]/10 hover:text-[#2C8E92] transition-colors"
                          >
                            <SparklesIcon className="h-4.5 w-4.5 text-[#67D6E8]" />
                            Tải ảnh từ thiết bị
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                /* PREVIEW CONTAINER WITH SCAN ANIMATION */
                <div className="space-y-6">
                  <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-[#E8EEF0] bg-[#FCFDFC] p-3 shadow-2xl">
                    <img
                      src={previewUrl}
                      alt="Ảnh sản phẩm"
                      className="w-full max-h-[380px] rounded-2xl object-contain bg-[#F7FBFC]"
                    />

                    {/* CINEMATIC SCAN ANIMATION OVERLAY */}
                    {scanStatus === 'loading' && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 bg-[#17353D]/40 backdrop-blur-xs rounded-3xl overflow-hidden">
                        {/* Moving Scanning Light Beam */}
                        <motion.div
                          animate={{ y: ['0%', '350%', '0%'] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-full h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#67D6E8] to-transparent shadow-[0_0_20px_#67D6E8]"
                        />

                        <div className="rounded-full bg-[#17353D]/85 backdrop-blur-md px-5 py-2 border border-[#67D6E8]/40 shadow-xl">
                          <motion.p
                            key={msgIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs font-bold text-[#67D6E8] tracking-wide"
                          >
                            {SCAN_MESSAGES[msgIndex]}
                          </motion.p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS FOR PREVIEW */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-[#2C8E92]/40 bg-[#F7FBFC] px-6 py-3 text-sm font-bold text-[#2C8E92] transition hover:bg-[#67D6E8]/10 cursor-pointer"
                    >
                      Đổi ảnh khác
                    </button>
                    {file && (
                      <motion.button
                        type="button"
                        whileHover={
                          {
                            backgroundPosition: 'right center',
                          }
                        }
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        onClick={handleScanSubmit}
                        disabled={scanStatus === 'loading'}
                        className="group relative inline-flex w-full sm:w-auto min-w-[300px] items-center justify-center gap-2 overflow-hidden rounded-full text-lg font-bold text-white transition-colors cursor-pointer"
                        style={{
                          padding: '16px 40px',
                          backgroundImage:
                            'linear-gradient(to right, #2C8E92 0%, #67D6E8 51%, #2C8E92 100%)',
                          backgroundSize: '200% auto',
                          border: 'none',
                          outline: 'none',
                          boxShadow: '0 10px 30px rgba(44,142,146,0.3)',
                          transition: '0.5s',
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {scanStatus === 'loading' ? (
                            <>
                              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              Đang phân tích...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-4.5 w-4.5 text-white" />
                              Quét ngay với AI
                            </>
                          )}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* ERROR STATE BANNER */}
              {scanStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ${
                    scanErrorIsConfig
                      ? 'border border-[#2C8E92]/30 bg-[#67D6E8]/10 text-[#2C8E92]'
                      : 'border border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <SparklesIcon className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{scanErrorMessage}</span>
                </motion.div>
              )}

              {/* SCAN RESULT CARD */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-3 pt-4 border-t border-[#E8EEF0]"
                >
                  <ResultCard
                    item={{ id: 'ai-scan-result', name_vi: scanResult.productName }}
                    result={scanResult.result}
                    reason={scanResult.reason}
                  />
                  <p className="text-xs text-[#64748B] text-center italic">
                    Kết quả do AI tự động đọc ảnh và suy luận — chỉ mang tính tham khảo, có thể chưa hoàn toàn chính xác.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* SEPARATOR */}
        <div className="my-14 flex items-center gap-4 text-xs font-bold tracking-widest text-[#2C8E92] uppercase">
          <span className="h-px flex-1 bg-[#E8EEF0]" />
          Hoặc tìm thủ công trong thư viện
          <span className="h-px flex-1 bg-[#E8EEF0]" />
        </div>

        {/* MANUAL SEARCH SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="rounded-[32px] border border-[#E8EEF0] bg-[#FCFDFC] p-8 sm:p-10 shadow-[0_10px_35px_rgba(44,142,146,0.04)]"
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-[#2C8E92]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
              placeholder="Nhập tên sản phẩm hoặc thực phẩm, ví dụ: dầu dừa, tôm, retinol..."
              className="w-full rounded-full bg-[#F7FBFC] border border-[#E8EEF0] py-4 pr-6 pl-14 text-base text-[#17353D] placeholder-[#64748B]/70 shadow-xs transition-all duration-200 focus:border-[#2C8E92] focus:bg-white focus:ring-2 focus:ring-[#67D6E8]/30 focus:outline-none"
            />

            {filtered.length > 0 && !selected && (
              <motion.ul
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-30 mt-3 w-full overflow-hidden rounded-2xl border border-[#E8EEF0] bg-white shadow-2xl"
              >
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item)
                        setQuery(item.name_vi)
                      }}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-semibold text-[#17353D] transition-colors hover:bg-[#67D6E8]/10 hover:text-[#2C8E92]"
                    >
                      <span>{item.name_vi}</span>
                      <span className="rounded-full bg-[#F7FBFC] border border-[#E8EEF0] px-3 py-1 text-xs font-bold text-[#2C8E92]">
                        {item.groupLabel}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {manualMatch && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <ResultCard item={selected} result={manualMatch.result} reason={manualMatch.reason} />
            </motion.div>
          )}
        </motion.section>

        {/* INFORMATION CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          <div className="rounded-3xl border border-[#E8EEF0] bg-[#FCFDFC] p-6 shadow-xs">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92] mb-4">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#17353D]">AI Vision Transformer</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
              Tự động nhận diện văn bản từ ảnh chụp nhãn sản phẩm và trích xuất danh sách thành phần hoạt tính.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8EEF0] bg-[#FCFDFC] p-6 shadow-xs">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#2C8E92]/15 text-[#2C8E92] mb-4">
              <CameraIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#17353D]">Quét Đa Dạng</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
              Đọc cả mỹ phẩm skincare lẫn thực phẩm dinh dưỡng để đưa ra cảnh báo dị ứng hoặc chất kích ứng da.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8EEF0] bg-[#FCFDFC] p-6 shadow-xs">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#6F9D8D]/15 text-[#6F9D8D] mb-4">
              <SearchIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#17353D]">Minh Bạch Lý Do</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
              Mọi kết quả được phân loại Phù hợp / Cần cân nhắc / Nên tránh kèm lý do chi tiết theo hồ sơ cơ địa.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ScanDemoPage
