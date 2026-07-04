import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import { CameraIcon, CheckCircleIcon, FlameIcon } from '../components/Icons'
import AuthedImage from '../components/AuthedImage'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function PhotoPicker({ label, file, existingUrl, onChange }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/40">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
      ) : existingUrl ? (
        <AuthedImage src={existingUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
          <CameraIcon className="h-5 w-5" />
        </span>
      )}
      <span>{file ? file.name : label}</span>
    </label>
  )
}

function CheckInPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()

  const [roadmapStatus, setRoadmapStatus] = useState('loading')
  const [todayPlan, setTodayPlan] = useState(null)
  const [roadmapId, setRoadmapId] = useState(null)

  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set())
  const [mealDescription, setMealDescription] = useState('')
  const [note, setNote] = useState('')
  const [skincareFile, setSkincareFile] = useState(null)
  const [mealFile, setMealFile] = useState(null)
  const [existingCheckin, setExistingCheckin] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient.get('/roadmap/current', { auth: true }).catch((err) => {
        if (err.status === 404) return null
        throw err
      }),
      apiClient.get('/checkin/today', { auth: true }),
    ])
      .then(([roadmap, checkin]) => {
        if (!roadmap) {
          setRoadmapStatus('none')
          return
        }
        const day = roadmap.dailyPlan.find((d) => d.date === todayStr())
        setRoadmapId(roadmap.id)
        if (!day) {
          setRoadmapStatus('expired')
          return
        }
        setTodayPlan(day)
        setRoadmapStatus('ready')

        if (checkin) {
          setExistingCheckin(checkin)
          setSelectedTaskIds(new Set(checkin.skincareTasksCompleted))
          setMealDescription(checkin.mealDescription || '')
          setNote(checkin.note || '')
        }
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setRoadmapStatus('error')
      })
  }, [user])

  function toggleTask(taskId) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSavedMessage('')
    try {
      const formData = new FormData()
      formData.append('skincareTasksCompleted', JSON.stringify(Array.from(selectedTaskIds)))
      formData.append('mealDescription', mealDescription)
      formData.append('note', note)
      if (roadmapId) formData.append('roadmapId', String(roadmapId))
      if (skincareFile) formData.append('skincarePhoto', skincareFile)
      if (mealFile) formData.append('mealPhoto', mealFile)

      const result = await apiClient.post('/checkin', formData, { auth: true, isFormData: true })
      setExistingCheckin(result)
      setSkincareFile(null)
      setMealFile(null)
      setSavedMessage('Đã lưu điểm danh hôm nay!')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">Đăng nhập để điểm danh chăm sóc da &amp; bữa ăn mỗi ngày.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-2 text-sm text-slate-500">Vui lòng khai báo hồ sơ trước khi điểm danh.</p>
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
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Điểm danh hôm nay</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ghi lại việc chăm sóc da và bữa ăn hôm nay — ảnh minh chứng là tuỳ chọn, không bắt buộc.
        </p>
        <Link to="/streak" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <FlameIcon className="h-4 w-4" />
          Xem lịch theo dõi &amp; streak
        </Link>
      </div>

      <div className="mt-6">
        {roadmapStatus === 'loading' && <p className="text-center text-sm text-slate-400">Đang tải...</p>}

        {roadmapStatus === 'none' && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Bạn cần có lộ trình để điểm danh theo từng việc mỗi ngày.</p>
            <Link
              to="/roadmap"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
            >
              Tạo lộ trình ngay
            </Link>
          </div>
        )}

        {roadmapStatus === 'expired' && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Lộ trình hiện tại đã kết thúc. Hãy tạo lộ trình mới để tiếp tục điểm danh.</p>
            <Link
              to="/roadmap"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
            >
              Tạo lộ trình mới
            </Link>
          </div>
        )}

        {roadmapStatus === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        {roadmapStatus === 'ready' && todayPlan && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Chăm sóc da hôm nay</p>
              <ul className="mt-2 space-y-1.5">
                {todayPlan.skincare_tasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      {task.label_vi}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <PhotoPicker
                  label="Thêm ảnh minh chứng skincare (tuỳ chọn)"
                  file={skincareFile}
                  existingUrl={existingCheckin?.skincarePhotoUrl}
                  onChange={setSkincareFile}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Bữa ăn hôm nay</p>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="Ví dụ: Cơm gà, rau luộc, canh chua..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
              <div className="mt-3">
                <PhotoPicker
                  label="Thêm ảnh bữa ăn (tuỳ chọn)"
                  file={mealFile}
                  existingUrl={existingCheckin?.mealPhotoUrl}
                  onChange={setMealFile}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Ghi chú (tuỳ chọn)</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
            )}
            {savedMessage && (
              <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircleIcon className="h-4 w-4" />
                {savedMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : 'Lưu điểm danh hôm nay'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CheckInPage
