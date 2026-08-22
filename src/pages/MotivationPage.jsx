import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, SparklesIcon, HeartIcon, UploadIcon, TrashIcon } from '../components/Icons'
import { MOTIVATION_CATEGORIES } from '../data/motivationContent'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatDate } from '../lib/format'

// Video tự tải lên được backend trả về dạng đường dẫn tương đối ("/uploads/motivation_videos/...").
// Trình duyệt cần URL tuyệt đối trỏ đúng cổng backend (Vite dev proxy chỉ xử lý /api và /ws, không
// xử lý /uploads) — cùng cách WebsiteReviews.jsx đang suy ra backendHost từ VITE_API_BASE_URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const BACKEND_HOST = API_BASE_URL.replace(/\/api\/?$/, '')

function toFileUrl(path) {
  return path ? `${BACKEND_HOST}${path}` : ''
}

const THEME = {
  emerald: {
    badge: 'bg-[#6F9D8D]/15 text-[#2fa98c] border border-[#6F9D8D]/30',
    pillBg: 'bg-[#6F9D8D]/10',
    accent: '#6F9D8D',
    gradient: 'from-[#0e3b33] via-[#2fa98c] to-[#70c4af]',
  },
  amber: {
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    pillBg: 'bg-[#D8B27A]/10',
    accent: '#D8B27A',
    gradient: 'from-[#0e3b33] via-[#A87A45] to-[#D8B27A]',
  },
  teal: {
    badge: 'bg-[#70c4af]/15 text-[#2fa98c] border border-[#2fa98c]/30',
    pillBg: 'bg-[#70c4af]/10',
    accent: '#70c4af',
    gradient: 'from-[#0e3b33] via-[#6F9D8D] to-[#70c4af]',
  },
}

function ThumbnailArtwork({ themeKey, title }) {
  const theme = THEME[themeKey] || THEME.emerald

  return (
    <div
      role="img"
      aria-label={`Ảnh minh hoạ cho video ${title}`}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-tr ${theme.gradient} flex items-center justify-center`}
    >
      {/* Ambient Lighting Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#70c4af]/30 blur-xl animate-pulse" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#BFD8CF]/30 blur-xl" />

      {/* Procedural AI Skincare Graphic */}
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl">
        <div
          className="h-10 w-10 rounded-2xl opacity-80 transition-transform duration-700 group-hover:scale-125"
          style={{ backgroundColor: theme.accent }}
        />
      </div>
    </div>
  )
}

function PostComposer({ onCreated, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('link')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (mode === 'link') {
        formData.append('videoUrl', videoUrl)
      } else if (videoFile) {
        formData.append('video', videoFile)
      }
      const created = await apiClient.post('/motivation/posts', formData, { auth: true, isFormData: true })
      onCreated(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-[#c5e7dd] bg-white p-6 sm:p-7 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0e3b33]">Đăng video truyền động lực</h3>
        <button type="button" onClick={onClose} className="text-xs font-bold text-[#64748B] hover:text-[#2fa98c]">
          Đóng
        </button>
      </div>

      <input
        type="text"
        required
        placeholder="Tiêu đề video"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
      />
      <textarea
        rows={2}
        placeholder="Mô tả ngắn (không bắt buộc)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
      />

      <div className="flex gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`rounded-full px-4 py-2 transition ${mode === 'link' ? 'bg-[#2fa98c] text-white' : 'bg-[#eaf7f1] text-[#64748B]'}`}
        >
          Dán link video
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`rounded-full px-4 py-2 transition ${mode === 'file' ? 'bg-[#2fa98c] text-white' : 'bg-[#eaf7f1] text-[#64748B]'}`}
        >
          Tải file video lên
        </button>
      </div>

      {mode === 'link' ? (
        <input
          type="url"
          required
          placeholder="https://youtube.com/..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
        />
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#2fa98c]/40 bg-[#eaf7f1] px-4 py-3 text-sm font-semibold text-[#2fa98c] hover:border-[#2fa98c]">
          <UploadIcon className="h-4 w-4" />
          {videoFile ? videoFile.name : 'Chọn file video (tối đa 60MB)'}
          <input
            type="file"
            accept="video/*"
            required
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>
      )}

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#2fa98c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e3b33] disabled:opacity-60"
      >
        {submitting ? 'Đang đăng...' : 'Đăng bài'}
      </button>
    </motion.form>
  )
}

function CommunityPostCard({ post, currentUserId, onLikeToggle, onDelete }) {
  const [viewed, setViewed] = useState(false)

  function trackView() {
    if (viewed) return
    setViewed(true)
    apiClient.post(`/motivation/posts/${post.id}/view`, {}, { auth: true }).catch(() => {})
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#c5e7dd] bg-white shadow-xs flex flex-col">
      {post.videoFileUrl ? (
        <video
          controls
          onPlay={trackView}
          className="h-52 w-full bg-black object-contain"
          src={toFileUrl(post.videoFileUrl)}
        />
      ) : (
        <a
          href={post.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackView}
          className="group relative flex h-52 w-full items-center justify-center bg-gradient-to-br from-[#0e3b33] via-[#2fa98c] to-[#70c4af]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#2fa98c] shadow-xl transition-transform group-hover:scale-110">
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          </span>
        </a>
      )}

      <div className="flex flex-1 flex-col p-5 space-y-1.5">
        <h4 className="font-bold text-[#0e3b33] leading-snug">{post.title}</h4>
        {post.description && <p className="text-xs text-[#64748B] leading-relaxed">{post.description}</p>}
        <p className="text-[11px] text-[#64748B]">
          {post.authorName} · {formatDate(post.createdAt)}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onLikeToggle(post)}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              post.likedByMe ? 'text-rose-500' : 'text-[#64748B] hover:text-rose-500'
            }`}
          >
            <HeartIcon className="h-4 w-4" filled={post.likedByMe} />
            {post.likeCount}
          </button>
          <span className="text-xs text-[#64748B]">{post.viewCount} lượt xem</span>
          {currentUserId === post.userId && (
            <button
              type="button"
              onClick={() => onDelete(post)}
              className="text-rose-400 hover:text-rose-600"
              aria-label="Xoá bài đăng"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MotivationPage() {
  useDocumentTitle('Góc truyền động lực')
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [showComposer, setShowComposer] = useState(false)

  function loadPosts() {
    apiClient.get('/motivation/posts', { auth: true }).then(setPosts).catch(() => {})
  }

  useEffect(loadPosts, [user])

  async function handleLikeToggle(post) {
    try {
      const result = await apiClient.post(`/motivation/posts/${post.id}/like`, {}, { auth: true })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p)))
    } catch {
      // im lặng bỏ qua — nút tim không quan trọng tới mức phải chặn UI bằng thông báo lỗi
    }
  }

  async function handleDelete(post) {
    try {
      await apiClient.delete(`/motivation/posts/${post.id}`, { auth: true })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch {
      // im lặng bỏ qua, tương tự handleLikeToggle
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eaf7f1] via-[#FCFDFC] to-[#eaf7f1] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#70c4af]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -left-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -right-20 h-[400px] w-[400px] rounded-full bg-[#70c4af]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-16">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#c5e7dd] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] text-center space-y-4"
        >

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0e3b33]">
            Góc Truyền Động Lực
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Video &amp; nội dung ngắn chọn lọc giúp bạn duy trì thói quen chăm sóc da, dinh dưỡng và lối sống lành mạnh mỗi ngày bên cạnh hồ sơ cá nhân.
          </p>
        </motion.div>

        {/* VIDEO TỪ CỘNG ĐỒNG — người dùng tự đăng, tích điểm theo lượt xem/tim */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#0e3b33]">Video từ cộng đồng</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Tự đăng video của bạn. Lượt xem &amp; lượt tim từ người khác sẽ cộng điểm tích luỹ, dùng đổi voucher ở Kho Voucher.
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => setShowComposer((v) => !v)}
                className="shrink-0 rounded-full bg-[#2fa98c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e3b33]"
              >
                {showComposer ? 'Đóng' : '+ Đăng bài'}
              </button>
            )}
          </div>

          {showComposer && (
            <PostComposer
              onCreated={(created) => {
                setPosts((prev) => [created, ...prev])
                setShowComposer(false)
              }}
              onClose={() => setShowComposer(false)}
            />
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-[#64748B]">Chưa có video nào từ cộng đồng, hãy là người đăng đầu tiên.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLikeToggle={handleLikeToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* MOTIVATION CATEGORIES GRID */}
        <div className="space-y-16">
          {MOTIVATION_CATEGORIES.map((category, catIdx) => {
            const theme = THEME[category.color] || THEME.emerald
            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                className="space-y-6"
              >
                {/* FLOATING GLASS PILL CATEGORY HEADER */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold shadow-xs backdrop-blur-md border ${theme.badge}`}>
                    <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
                    {category.label}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#c5e7dd]" />
                </div>

                {/* VIDEO CARDS */}
                <div className="grid gap-8 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <motion.a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="group overflow-hidden rounded-[28px] border border-[#c5e7dd] bg-[#FCFDFC] shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] transition-all duration-300 hover:border-[#2fa98c] hover:shadow-[0_20px_50px_rgba(47, 169, 140,0.12)] flex flex-col justify-between"
                    >
                      <div>
                        {/* BROWSER-STYLE WINDOW FRAME TOP BAR */}
                        <div className="flex items-center justify-between border-b border-[#c5e7dd] bg-[#eaf7f1] px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                          </div>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                            motivation.ai/video
                          </span>
                        </div>

                        {/* MOCKUP THUMBNAIL AREA */}
                        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                          <ThumbnailArtwork themeKey={category.color} title={item.title} />

                          {/* Curated Badge */}
                          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-[#c5e7dd] px-3 py-1 text-[11px] font-extrabold text-[#0e3b33] shadow-xs backdrop-blur-md">
                            <SparklesIcon className="h-3 w-3 text-[#2fa98c]" />
                            Đề xuất cho bạn
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                            4:30 MIN
                          </div>

                          {/* Floating Glass Play Button Overlay */}
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2fa98c] shadow-xl border border-white/60 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2fa98c] group-hover:text-white">
                              <PlayIcon className="h-7 w-7 translate-x-0.5" />
                            </span>
                          </div>
                        </div>

                        {/* CARD CONTENT */}
                        <div className="p-6 sm:p-7 space-y-2">
                          <h3 className="font-display text-xl font-extrabold text-[#0e3b33] group-hover:text-[#2fa98c] transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* CARD FOOTER */}
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 flex items-center justify-between text-xs font-bold text-[#2fa98c]">
                        <span className="group-hover:underline">Xem video trên YouTube</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#64748B] pt-4 font-normal">
          Bấm vào thẻ để mở kết quả tìm kiếm liên quan trên YouTube.
        </p>
      </div>
    </div>
  )
}

export default MotivationPage
