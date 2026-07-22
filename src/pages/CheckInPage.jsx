import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import {
  CameraIcon,
  CheckCircleIcon,
  FlameIcon,
  ShieldIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from '../components/Icons'
import AuthedImage from '../components/AuthedImage'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const PHASE_THEME = {
  reset: {
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40',
    card: 'border-cyan-400/30 glass',
    glow: 'from-cyan-500 to-blue-500',
  },
  stabilize: {
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    card: 'border-emerald-500/30 glass',
    glow: 'from-emerald-500 to-teal-500',
  },
  improve: {
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    card: 'border-amber-500/30 glass',
    glow: 'from-amber-500 to-orange-500',
  },
  maintain: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40',
    card: 'border-fuchsia-500/30 glass',
    glow: 'from-fuchsia-500 to-pink-500',
  },
}

function getPhaseTheme(phaseKey) {
  return PHASE_THEME[phaseKey] ?? PHASE_THEME.stabilize
}

function PhotoPicker({ label, file, existingUrl, onChange }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  return (
    <label className="flex cursor-pointer items-center gap-3.5 rounded-2xl glass border border-dashed border-cyan-400/30 p-3.5 text-sm text-cyan-200 hover:border-cyan-400 hover:bg-cyan-500/10">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-cyan-400/40" />
      ) : existingUrl ? (
        <AuthedImage src={existingUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-cyan-400/40" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-400 border border-cyan-400/20">
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
  const [feedbackPreview, setFeedbackPreview] = useState(null)
  const phaseTheme = todayPlan ? getPhaseTheme(todayPlan.phase_key) : PHASE_THEME.stabilize
  const previewPhaseTheme = feedbackPreview?.phaseKey ? getPhaseTheme(feedbackPreview.phaseKey) : phaseTheme

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
          setFeedbackPreview(checkin.feedbackPreview || null)
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
      setFeedbackPreview(result.feedbackPreview || null)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">Đăng nhập để điểm danh chăm sóc da &amp; bữa ăn mỗi ngày.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-3 text-sm text-slate-300">Vui lòng khai báo hồ sơ trước khi điểm danh.</p>
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
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Điểm danh hôm nay</h1>
        <p className="mt-3 text-base text-slate-300/90">
          Ghi lại việc chăm sóc da và bữa ăn hôm nay — ảnh minh chứng là tuỳ chọn, không bắt buộc.
        </p>
        <Link to="/streak" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:underline">
          <FlameIcon className="h-4 w-4 text-rose-400" />
          Xem lịch theo dõi &amp; streak
        </Link>
      </div>

      <div className="mt-8">
        {roadmapStatus === 'loading' && <p className="text-center text-sm text-cyan-300/70">Đang tải...</p>}

        {roadmapStatus === 'none' && (
          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-8 text-center shadow-glow">
            <p className="text-sm text-slate-300">Bạn cần có lộ trình để điểm danh theo từng việc mỗi ngày.</p>
            <Link
              to="/roadmap"
              className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
            >
              Tạo lộ trình ngay
            </Link>
          </div>
        )}

        {roadmapStatus === 'expired' && (
          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-8 text-center shadow-glow">
            <p className="text-sm text-slate-300">Lộ trình hiện tại đã kết thúc. Hãy tạo lộ trình mới để tiếp tục điểm danh.</p>
            <Link
              to="/roadmap"
              className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
            >
              Tạo lộ trình mới
            </Link>
          </div>
        )}

        {roadmapStatus === 'error' && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
        )}

        {roadmapStatus === 'ready' && todayPlan && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow">
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
                <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
                <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                  Hôm nay không chỉ là checklist
                </span>
              </span>
              <div className="mt-4 flex flex-col gap-3">
                {todayPlan.phase_title_vi && (
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${phaseTheme.badge}`}>
                    <ShieldIcon className="h-3.5 w-3.5" />
                    Phase hiện tại: {todayPlan.phase_title_vi}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-slate-300">
                  Bạn đang điểm danh trong đúng giai đoạn của lộ trình cải thiện, nên những việc hôm nay
                  được giao theo phase chứ không phải lặp máy móc.
                </p>
              </div>

              {todayPlan.coach_note && (
                <div className={`mt-4 rounded-2xl p-4 ${phaseTheme.card}`}>
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">Coach note</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{todayPlan.coach_note}</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow space-y-4">
              <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Chăm sóc da hôm nay</p>
              <ul className="space-y-2">
                {todayPlan.skincare_tasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200 glass p-3 rounded-xl border border-cyan-400/15 hover:border-cyan-400/40">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4 rounded border-cyan-400/40 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                      />
                      {task.label_vi}
                    </label>
                  </li>
                ))}
              </ul>
              <PhotoPicker
                label="Thêm ảnh minh chứng skincare (tuỳ chọn)"
                file={skincareFile}
                existingUrl={existingCheckin?.skincarePhotoUrl}
                onChange={setSkincareFile}
              />
            </div>

            <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow space-y-4">
              <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Bữa ăn hôm nay</p>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="Ví dụ: Cơm gà, rau luộc, canh chua..."
                rows={3}
                className="w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <PhotoPicker
                label="Thêm ảnh bữa ăn (tuỳ chọn)"
                file={mealFile}
                existingUrl={existingCheckin?.mealPhotoUrl}
                onChange={setMealFile}
              />
            </div>

            <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow space-y-3">
              <p className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">Ghi chú (tuỳ chọn)</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú thêm cho AI..."
                className="w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
            )}
            {savedMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-300 shadow-glow">
                <CheckCircleIcon className="h-4 w-4" />
                {savedMessage}
              </p>
            )}
            {feedbackPreview && (
              <div className="rounded-3xl glass-strong border border-cyan-400/30 overflow-hidden shadow-glow-lg">
                <div className="bg-gradient-to-r from-cyan-900/80 to-slate-900/90 border-b border-cyan-400/20 px-5 py-3.5 text-white">
                  <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                    <CalendarIcon className="h-4 w-4 text-cyan-300" />
                    Ngày mai tập trung vào...
                  </p>
                </div>
                <div className="space-y-3 p-5 text-slate-200">
                  {feedbackPreview.phaseTitle && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${previewPhaseTheme.badge}`}>
                      <ShieldIcon className="h-3.5 w-3.5" />
                      {feedbackPreview.phaseTitle}
                    </span>
                  )}
                  <p className="text-base font-bold text-gradient-cyan leading-relaxed">
                    {feedbackPreview.adaptiveTask || feedbackPreview.feedbackText || 'Tiếp tục giữ nhịp thói quen đang ổn.'}
                  </p>
                  {feedbackPreview.feedbackText && feedbackPreview.adaptiveTask && (
                    <p className="text-sm leading-relaxed text-slate-300">{feedbackPreview.feedbackText}</p>
                  )}
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Hệ thống đã điều chỉnh note và ưu tiên của ngày mai ngay trong roadmap.
                    </p>
                    <Link
                      to={`/roadmap?day=${feedbackPreview.nextDate}`}
                      className="inline-flex items-center gap-2 rounded-xl glass border border-cyan-400/30 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400"
                    >
                      Xem ngày mai trong lộ trình
                      <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
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
