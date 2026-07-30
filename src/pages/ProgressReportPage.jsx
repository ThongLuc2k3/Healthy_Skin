import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiClient, getToken } from '../lib/apiClient'
import MilestoneDiff from '../components/MilestoneDiff'
import AuthedImage from '../components/AuthedImage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default function ProgressReportPage() {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [milestones, setMilestones] = useState([])
  const [selected, setSelected] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [profile, setProfile] = useState(null)

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true)
      const [data, profileData] = await Promise.all([
        apiClient.get('/milestones', { auth: true }),
        apiClient.get('/profile', { auth: true }),
      ])
      setMilestones(data || [])
      setProfile(profileData)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchMilestones()
  }, [user, fetchMilestones])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const formData = new FormData()
      if (imageFile) formData.append('image', imageFile)
      const res = await fetch(`${API_BASE_URL}/milestones`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      setMilestones((prev) => [data, ...prev])
      setSelected(data.id)
      setComparison({ current: data, previous: null, diff: null })
      setImageFile(null)
      setImagePreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá báo cáo này?')) return
    try {
      await apiClient.delete(`/milestones/${id}`, { auth: true })
      setMilestones((prev) => prev.filter((m) => m.id !== id))
      if (selected === id) {
        setSelected(null)
        setComparison(null)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleSelect(id) {
    setSelected(id)
    try {
      const data = await apiClient.get(`/milestones/${id}/compare`, { auth: true })
      setComparison(data)
    } catch {
      const mil = milestones.find((m) => m.id === id)
      if (mil) {
        setComparison({ current: mil, previous: null, diff: null })
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Vui lòng đăng nhập để xem báo cáo tiến độ.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo tiến độ</h1>
          <p className="text-sm text-slate-500">Tải ảnh lên và so sánh kết quả chăm sóc da qua thời gian.</p>
        </div>
      </div>

      {/* Upload khu vực */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Tạo báo cáo mới</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Ảnh hồ sơ hiện tại */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Ảnh hồ sơ hiện tại</p>
            {profile?.facePhotoUrl ? (
              <AuthedImage
                src={profile.facePhotoUrl}
                alt="Face hiện tại"
                className="h-80 w-80 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <div className="h-80 w-80 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-sm">
                Chưa có ảnh
              </div>
            )}
          </div>

          {/* Ảnh mới upload */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Ảnh so sánh (tuỳ chọn)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
            />
            {imagePreview ? (
              <div className="mt-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-80 w-80 rounded-xl object-cover border-2 border-emerald-200 shadow-sm" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="mt-3 h-80 w-80 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-sm">
                Chưa chọn ảnh
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="mt-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition shadow-sm"
        >
          {creating ? 'Đang tạo...' : 'Tạo báo cáo'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-400 mb-2">Chưa có báo cáo nào.</p>
          <p className="text-slate-400 text-sm">Nhấn "Tạo báo cáo" để chụp ảnh nhanh trạng thái hiện tại.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ngày</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Điểm danh</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Quét</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nhiệm vụ</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Streak</th>
                <th className="w-0 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className={`border-b border-slate-50 cursor-pointer transition-colors hover:bg-emerald-50/50 ${
                    selected === m.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.summary.totalCheckins ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{m.summary.totalScans ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{m.summary.totalTasksDone ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {m.summary.streak != null ? `${m.summary.streak} ngày` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(m.id)
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel so sánh */}
      {comparison && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            So sánh
            <span className="text-sm font-normal text-slate-400 ml-2">
              {new Date(comparison.current.createdAt).toLocaleDateString('vi-VN')}
              {comparison.previous && ` vs ${new Date(comparison.previous.createdAt).toLocaleDateString('vi-VN')}`}
            </span>
          </h2>
          <MilestoneDiff
            diff={comparison.diff}
            previous={comparison.previous?.snapshot}
            current={comparison.current.snapshot}
          />
        </div>
      )}
    </div>
  )
}
