import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../lib/apiClient'

export default function WebsiteReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  // 1. Xác định domain gốc Backend (loại bỏ /api ở cuối nếu có)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  const backendHost = apiBaseUrl.replace(/\/api\/?$/, '')

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/reviews`)
      const data = await res.json()
      if (res.ok) setReviews(data.reviews || [])
    } catch (err) {
      console.error('Lỗi kết nối:', err)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

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

    if (!token) {
      alert('Vui lòng đăng nhập để gửi đánh giá!')
      return
    }

    setLoading(true)
    try {
      // Đóng gói FormData
      const formData = new FormData()
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
        setTitle('')
        setContent('')
        setRating(5)
        setImageFile(null)
        setImagePreview(null)
        setShowForm(false)
        fetchReviews()
      } else {
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ')
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đánh Giá Trải Nghiệm Web</h1>
          <p className="text-gray-500 text-sm">Ý kiến của bạn giúp chúng tôi hoàn thiện hơn</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-sm"
        >
          {showForm ? 'Đóng lại' : '+ Viết nhận xét'}
        </button>
      </div>

      {/* Form gửi nhận xét */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Gửi nhận xét của bạn</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Số sao</label>
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
              required
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mb-3">
            <textarea
              required
              rows={3}
              placeholder="Chia sẻ chi tiết trải nghiệm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Ô tải ảnh lên */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Hình ảnh đính kèm (không bắt buộc)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* Hiển thị danh sách nhận xét kèm hình ảnh */}
      <div className="space-y-4">
        {reviews.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gray-800 text-base">{item.title}</h4>
              <span className="text-xs text-gray-400">
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="text-amber-400 text-sm mb-2">
              {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.content}</p>

            {/* Hiển thị hình ảnh nhận xét nếu có */}
            {item.image_path && (
            <div className="mb-3">
                <img
                src={getImageUrl(item.image_path)}
                alt="Review Attachment"
                crossOrigin="anonymous"        // 🟢 Cho phép request ảnh Cross-Origin
                referrerPolicy="no-referrer"   // 🟢 Bỏ qua chính sách Referrer
                className="max-h-60 rounded-xl object-cover border border-gray-100 shadow-sm"
                onError={(e) => {
                    console.error("Lỗi tải ảnh từ URL:", e.target.src)
                }}
                />
            </div>
            )}
            <div className="text-xs text-gray-400 border-t border-gray-50 pt-2">
              Người đánh giá: <span className="font-medium text-gray-600">{item.author_name || 'Người dùng DA DƯỠNG'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}