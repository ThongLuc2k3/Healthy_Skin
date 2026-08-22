import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../lib/apiClient'
import { formatDate } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function WebsiteReviews() {
  useDocumentTitle('Đánh giá trải nghiệm')
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // 1. Xác định domain gốc Backend (loại bỏ /api ở cuối nếu có)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendHost = apiBaseUrl.replace(/\/api\/?$/, '')

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/reviews`)
      const data = await res.json()
      if (res.ok) setReviews(data.reviews || [])
    } catch (err) {
      console.error('Lỗi kết nối:', err)
    }
  }, [apiBaseUrl])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Xử lý chọn ảnh & preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Gửi đánh giá mới bằng FormData
  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = getToken()
    setFormError('')

    if (!token) {
      setFormError('Vui lòng đăng nhập để gửi đánh giá.')
      return
    }

    setLoading(true)
    try {
      // Đóng gói FormData
      const formData = new FormData()
      if (authorName.trim()) formData.append('authorName', authorName.trim())
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      formData.append('rating', rating)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await fetch(`${apiBaseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Không set Content-Type để browser tự thêm boundary multipart
        },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setAuthorName('')
        setTitle('')
        setContent('')
        setRating(5)
        setImageFile(null)
        setImagePreview(null)
        setShowForm(false)
        fetchReviews()
      } else {
        setFormError(data.error || 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch {
      setFormError('Không thể kết nối đến máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  // Hàm xử lý đường dẫn ảnh an toàn
  const getImageUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    // Đảm bảo path có dấu / ở đầu
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${backendHost}${cleanPath}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pt-28">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0e3b33]">Đánh Giá Trải Nghiệm Web</h1>
          <p className="text-[#64748B] text-sm">Ý kiến của bạn giúp chúng tôi hoàn thiện hơn</p>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2fa98c] hover:bg-[#0e3b33] text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-sm"
          >
            {showForm ? 'Đóng lại' : '+ Viết nhận xét'}
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-[#2fa98c] hover:bg-[#0e3b33] text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-sm"
          >
            Đăng nhập để viết nhận xét
          </Link>
        )}
      </div>

      {/* Form gửi nhận xét */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#c5e7dd] rounded-2xl p-5 mb-8 shadow-xs">
          <h3 className="font-bold text-[#0e3b33] mb-3">Gửi nhận xét của bạn</h3>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Số sao</label>
            <div className="flex gap-1 text-2xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={star <= rating ? 'text-amber-400' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Tên hiển thị (không bắt buộc)..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-[#c5e7dd] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2fa98c]"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              required
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#c5e7dd] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2fa98c]"
            />
          </div>

          <div className="mb-3">
            <textarea
              required
              rows={3}
              placeholder="Chia sẻ chi tiết trải nghiệm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-[#c5e7dd] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2fa98c]"
            />
          </div>

          {/* Ô tải ảnh lên */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Hình ảnh đính kèm (không bắt buộc)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2fa98c]/10 file:text-[#2fa98c] hover:file:bg-[#2fa98c]/20 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-[#c5e7dd]">
                <img src={imagePreview} alt="Ảnh xem trước" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  aria-label="Bỏ ảnh đã chọn"
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {formError && (
            <p className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#2fa98c] hover:bg-[#0e3b33] text-white text-sm font-semibold px-5 py-2 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* Hiển thị danh sách nhận xét kèm hình ảnh */}
      {reviews.length === 0 ? (
        <p className="text-center text-sm text-[#64748B] py-10">Chưa có đánh giá nào, hãy là người đầu tiên chia sẻ trải nghiệm của bạn.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => (
            <div key={item.id} className="bg-white border border-[#c5e7dd] rounded-2xl p-4 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#0e3b33] text-base">{item.title}</h4>
                <span className="text-xs text-[#64748B]">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div className="text-amber-400 text-sm mb-2">
                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
              </div>
              <p className="text-[#0e3b33] text-sm leading-relaxed mb-3">{item.content}</p>

              {/* Hiển thị hình ảnh nhận xét nếu có */}
              {item.image_path && (
              <div className="mb-3">
                  <img
                  src={getImageUrl(item.image_path)}
                  alt={`Ảnh đính kèm đánh giá của ${item.author_name || 'người dùng'}`}
                  crossOrigin="anonymous"        // 🟢 Cho phép request ảnh Cross-Origin
                  referrerPolicy="no-referrer"   // 🟢 Bỏ qua chính sách Referrer
                  className="max-h-60 rounded-xl object-cover border border-[#c5e7dd] shadow-xs"
                  onError={(e) => {
                      console.error("Lỗi tải ảnh từ URL:", e.target.src)
                  }}
                  />
              </div>
              )}
              <div className="text-xs text-[#64748B] border-t border-[#eaf7f1] pt-2">
                Người đánh giá: <span className="font-medium text-[#0e3b33]">{item.author_name || 'Người dùng HEALTHY SKIN'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
