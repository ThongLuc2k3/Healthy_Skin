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
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    card: 'border-sky-200 bg-sky-50',
    glow: 'from-sky-500 to-cyan-500',
    aurora: {
      a: '#38bdf8',
      b: '#22d3ee',
      c: '#bfdbfe',
    },
  },
  stabilize: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    card: 'border-emerald-200 bg-emerald-50',
    glow: 'from-emerald-500 to-teal-500',
    aurora: {
      a: '#34d399',
      b: '#14b8a6',
      c: '#99f6e4',
    },
  },
  improve: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200 bg-amber-50',
    glow: 'from-amber-500 to-orange-500',
    aurora: {
      a: '#fbbf24',
      b: '#fb923c',
      c: '#fde68a',
    },
  },
  maintain: {
    badge: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    card: 'border-fuchsia-200 bg-fuchsia-50',
    glow: 'from-fuchsia-500 to-pink-500',
    aurora: {
      a: '#e879f9',
      b: '#f472b6',
      c: '#f5d0fe',
    },
  },
}

function getPhaseTheme(phaseKey) {
  return PHASE_THEME[phaseKey] ?? PHASE_THEME.stabilize
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
  const [feedbackPreview, setFeedbackPreview] = useState(null)
  const phaseTheme = todayPlan ? getPhaseTheme(todayPlan.phase_key) : PHASE_THEME.stabilize
  const previewPhaseTheme = feedbackPreview?.phaseKey ? getPhaseTheme(feedbackPreview.phaseKey) : phaseTheme
  const pageAuraStyle = {
    '--aurora-a': phaseTheme.aurora.a,
    '--aurora-b': phaseTheme.aurora.b,
    '--aurora-c': phaseTheme.aurora.c,
    '--blob-a': phaseTheme.aurora.a,
    '--blob-b': phaseTheme.aurora.b,
    '--blob-c': phaseTheme.aurora.c,
  }
  const previewAuraStyle = {
    '--aurora-a': previewPhaseTheme.aurora.a,
    '--aurora-b': previewPhaseTheme.aurora.b,
    '--aurora-c': previewPhaseTheme.aurora.c,
    '--blob-a': previewPhaseTheme.aurora.a,
    '--blob-b': previewPhaseTheme.aurora.b,
    '--blob-c': previewPhaseTheme.aurora.c,
  }

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
    <div className="aurora-shell mx-auto max-w-xl px-4 py-10" style={pageAuraStyle}>
      <div className="aurora-layer rounded-[2rem]" />
      <div className="phase-blob phase-blob-a" />
      <div className="phase-blob phase-blob-b" />
      <div className="phase-blob phase-blob-c" />
      <div className="aurora-content">
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
          <div className="motion-rise surface-tint-strong rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
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
          <div className="motion-rise surface-tint-strong rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
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
            <div className="motion-rise overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.95))] p-5 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                <SparklesIcon className="h-3.5 w-3.5" />
                Hôm nay không chỉ là checklist
              </span>
              <div className="mt-4 flex flex-col gap-3">
                {todayPlan.phase_title_vi && (
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${phaseTheme.badge}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5" />
                    Phase hiện tại: {todayPlan.phase_title_vi}
                  </span>
                )}
                <p className="text-sm leading-6 text-slate-600">
                  Bạn đang điểm danh trong đúng giai đoạn của lộ trình cải thiện, nên những việc hôm nay
                  được giao theo phase chứ không phải lặp máy móc.
                </p>
              </div>

              {todayPlan.coach_note && (
                <div className={`mt-4 rounded-2xl border px-4 py-4 ${phaseTheme.card}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Coach note</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{todayPlan.coach_note}</p>
                </div>
              )}
            </div>

            <div className="motion-rise motion-stagger-1 surface-tint motion-hover-lift rounded-2xl border border-slate-100 p-5 shadow-sm">
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

            <div className="motion-rise motion-stagger-2 surface-tint motion-hover-lift rounded-2xl border border-slate-100 p-5 shadow-sm">
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

            <div className="motion-rise motion-stagger-3 surface-tint motion-hover-lift rounded-2xl border border-slate-100 p-5 shadow-sm">
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
              <p className="motion-rise motion-stagger-4 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircleIcon className="h-4 w-4" />
                {savedMessage}
              </p>
            )}
            {feedbackPreview && (
              <div
                className="motion-glow motion-stagger-5 aurora-shell overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white"
                style={previewAuraStyle}
              >
                <div className="aurora-layer" />
                <div className="phase-blob phase-blob-a" />
                <div className={`bg-gradient-to-r ${previewPhaseTheme.glow} px-4 py-3 text-white`}>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    <CalendarIcon className="h-4 w-4" />
                    Ngày mai tập trung vào...
                  </p>
                </div>
                <div className="aurora-content space-y-3 px-4 py-4">
                  {feedbackPreview.phaseTitle && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                        previewPhaseTheme.badge
                      }`}
                    >
                      <ShieldIcon className="h-3.5 w-3.5" />
                      {feedbackPreview.phaseTitle}
                    </span>
                  )}
                  <p className="text-sm font-semibold leading-6 text-slate-900">
                    {feedbackPreview.adaptiveTask || feedbackPreview.feedbackText || 'Tiếp tục giữ nhịp thói quen đang ổn.'}
                  </p>
                  {feedbackPreview.feedbackText && feedbackPreview.adaptiveTask && (
                    <p className="text-sm leading-6 text-slate-600">{feedbackPreview.feedbackText}</p>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">
                      Hệ thống đã điều chỉnh note và ưu tiên của ngày mai ngay trong roadmap.
                    </p>
                    <Link
                      to={`/roadmap?day=${feedbackPreview.nextDate}`}
                      className="motion-hover-lift inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
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
              className="motion-hover-lift w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : 'Lưu điểm danh hôm nay'}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  )
}

export default CheckInPage
