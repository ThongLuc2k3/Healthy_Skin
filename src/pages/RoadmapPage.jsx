import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import { loadPlanPreferences } from '../lib/planPreferences'
import {
  CalendarIcon,
  SparklesIcon,
  TrophyIcon,
  FlameIcon,
  TargetIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldIcon,
} from '../components/Icons'

function formatDate(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const PHASE_THEME = {
  reset: {
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    card: 'border-sky-200 bg-sky-50',
    accent: 'from-sky-400 to-cyan-400',
    aurora: {
      a: '#38bdf8',
      b: '#22d3ee',
      c: '#bfdbfe',
    },
  },
  stabilize: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    card: 'border-emerald-200 bg-emerald-50',
    accent: 'from-emerald-400 to-teal-400',
    aurora: {
      a: '#34d399',
      b: '#14b8a6',
      c: '#99f6e4',
    },
  },
  improve: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200 bg-amber-50',
    accent: 'from-amber-400 to-orange-400',
    aurora: {
      a: '#fbbf24',
      b: '#fb923c',
      c: '#fde68a',
    },
  },
  maintain: {
    badge: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    card: 'border-fuchsia-200 bg-fuchsia-50',
    accent: 'from-fuchsia-400 to-pink-400',
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

function RoadmapPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [roadmap, setRoadmap] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [transitionDirection, setTransitionDirection] = useState('forward')

  const savedPlan = useMemo(() => (user ? loadPlanPreferences(user.id) : null), [user])

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient.get('/roadmap/current', { auth: true }).catch((err) => {
        if (err.status === 404) return null
        throw err
      }),
      apiClient.get('/checkin/calendar?days=30', { auth: true }).catch(() => null),
    ])
      .then(([roadmapData, calendarData]) => {
        setCalendar(calendarData)
        if (!roadmapData) {
          setStatus('none')
          return
        }
        setRoadmap(roadmapData)
        const preferredDate = searchParams.get('day')
        const preferredIndex = preferredDate
          ? roadmapData.dailyPlan.findIndex((day) => day.date === preferredDate)
          : -1
        const todayIndex = roadmapData.dailyPlan.findIndex((day) => day.date === todayStr())
        setSelectedDayIndex(preferredIndex >= 0 ? preferredIndex : todayIndex >= 0 ? todayIndex : 0)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user, searchParams])

  async function handleGenerate() {
    setGenerating(true)
    setErrorMessage('')
    try {
      const data = await apiClient.post('/roadmap/generate', {}, { auth: true })
      setRoadmap(data)
      setSelectedDayIndex(0)
      setStatus('ready')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    } finally {
      setGenerating(false)
    }
  }

  function applyTaskDone(taskId, done) {
    setRoadmap((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        dailyPlan: prev.dailyPlan.map((day) => ({
          ...day,
          skincare_tasks: day.skincare_tasks.map((t) => (t.id === taskId ? { ...t, done } : t)),
        })),
      }
    })
  }

  async function toggleTask(taskId, done) {
    if (!roadmap) return
    applyTaskDone(taskId, done)
    try {
      await apiClient.patch(`/roadmap/${roadmap.id}/task/${taskId}`, { done }, { auth: true })
    } catch (err) {
      applyTaskDone(taskId, !done)
      setErrorMessage(err.message)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">
          Đăng nhập để tạo và theo dõi lộ trình cá nhân hoá của bạn.
        </p>
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
        <p className="mt-2 text-sm text-slate-500">Vui lòng khai báo hồ sơ trước khi tạo lộ trình.</p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">Đang tải...</p>
  }

  if (status === 'none') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="motion-rise rounded-[2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.95))] p-8 text-center shadow-[0_20px_70px_-40px_rgba(16,185,129,0.45)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <CalendarIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">Bạn chưa có lộ trình nào</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Sau khi đã có kết quả kiểm tra, hãy đi thêm một bước nữa: cho hệ thống biết ngân sách, nhịp
            sống và những gì bạn đang dùng để tạo ra một kế hoạch cải thiện sát thực tế.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/roadmap/plan"
              className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
            >
              Lập kế hoạch cải thiện
            </Link>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:shadow-sm disabled:opacity-60"
            >
              {generating ? 'Đang tạo...' : 'Dùng lộ trình tự sinh nhanh'}
            </button>
            <Link
              to="/roadmap/custom"
              className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Tự thiết kế thủ công
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || !roadmap) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      </div>
    )
  }

  const totalTasks = roadmap.dailyPlan.reduce((sum, day) => sum + day.skincare_tasks.length, 0)
  const completedTasks = roadmap.dailyPlan.reduce(
    (sum, day) => sum + day.skincare_tasks.filter((task) => task.done).length,
    0,
  )
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const selectedDay = roadmap.dailyPlan[clamp(selectedDayIndex, 0, roadmap.dailyPlan.length - 1)]
  const selectedDoneCount = selectedDay.skincare_tasks.filter((task) => task.done).length
  const selectedProgress = selectedDay.skincare_tasks.length
    ? Math.round((selectedDoneCount / selectedDay.skincare_tasks.length) * 100)
    : 0
  const heroSummary = savedPlan?.summary
  const streak = calendar?.streak ?? 0
  const selectedPhaseTheme = getPhaseTheme(selectedDay.phase_key)
  const selectedPhaseAura = {
    '--aurora-a': selectedPhaseTheme.aurora.a,
    '--aurora-b': selectedPhaseTheme.aurora.b,
    '--aurora-c': selectedPhaseTheme.aurora.c,
    '--blob-a': selectedPhaseTheme.aurora.a,
    '--blob-b': selectedPhaseTheme.aurora.b,
    '--blob-c': selectedPhaseTheme.aurora.c,
  }

  const achievements = [
    `${completedTasks}/${totalTasks} việc đã được đánh dấu hoàn thành`,
    selectedProgress === 100 ? 'Hôm nay bạn đã chốt đủ routine' : `Hôm nay đang ở mức ${selectedProgress}%`,
    streak > 0 ? `Giữ streak ${streak} ngày liên tiếp` : 'Hãy điểm danh để bắt đầu chuỗi mới',
  ]
  const selectedDayMotionClass =
    transitionDirection === 'backward' ? 'motion-swap-backward' : 'motion-swap-forward'
  const hasPreviousDay = selectedDayIndex > 0
  const hasNextDay = selectedDayIndex < roadmap.dailyPlan.length - 1

  function handleSelectDay(index) {
    if (index === selectedDayIndex) return
    setTransitionDirection(index < selectedDayIndex ? 'backward' : 'forward')
    setSelectedDayIndex(index)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('day', roadmap.dailyPlan[index].date)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section
          className="motion-rise aurora-shell overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_70px_-40px_rgba(16,185,129,0.45)]"
          style={selectedPhaseAura}
        >
          <div className="aurora-layer" />
          <div className="phase-blob phase-blob-a" />
          <div className="phase-blob phase-blob-b" />
          <div className="aurora-content">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.20),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,0.99),_rgba(236,253,245,0.96))] px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Dashboard cải thiện cá nhân
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {savedPlan?.goal || 'Lộ trình của bạn'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Mỗi ngày chỉ tập trung đúng việc cần làm cho hôm đó. Không dàn hàng cả mấy tháng, không
                  tạo cảm giác quá tải.
                </p>
              </div>

                <div className="flex flex-wrap gap-2">
                <Link
                  to="/roadmap/plan"
                  className="motion-hover-lift rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
                >
                  Chỉnh kế hoạch
                </Link>
                <Link
                  to="/checkin"
                  className="motion-hover-lift rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
                >
                  Điểm danh hôm nay
                </Link>
              </div>
            </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="motion-rise motion-stagger-1 surface-tint motion-hover-lift rounded-2xl border border-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">Tiến độ</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{completionRate}%</p>
                <p className="mt-1 text-sm text-slate-500">toàn bộ lộ trình đã đi qua</p>
              </div>
                <div className="motion-rise motion-stagger-2 surface-tint motion-hover-lift rounded-2xl border border-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">Streak</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{streak}</p>
                <p className="mt-1 text-sm text-slate-500">ngày giữ nhịp liên tiếp</p>
              </div>
                <div className="motion-rise motion-stagger-3 surface-tint motion-hover-lift rounded-2xl border border-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">Mốc hôm nay</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{selectedProgress}%</p>
                <p className="mt-1 text-sm text-slate-500">việc của ngày đang chọn</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-8">
            {errorMessage && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            <div
              key={selectedDay.date}
              className={`${selectedDayMotionClass} aurora-shell rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm`}
              style={selectedPhaseAura}
            >
              <div className="aurora-layer" />
              <div className="phase-blob phase-blob-a" />
              <div className="phase-blob phase-blob-b" />
              <div className="phase-blob phase-blob-c" />
              <div className="aurora-content">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Ngày đang theo dõi</p>
                    {selectedDay.phase_title_vi && (
                      <span
                        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${selectedPhaseTheme.badge}`}
                      >
                        <ShieldIcon className="h-3.5 w-3.5" />
                        Phase: {selectedDay.phase_title_vi}
                      </span>
                    )}
                    <h2 className="mt-2 text-2xl font-black">
                      Ngày {selectedDay.day_index} — {formatDate(selectedDay.date)}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">
                      {selectedDoneCount}/{selectedDay.skincare_tasks.length} việc đã hoàn thành hôm nay
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDay(selectedDayIndex - 1)}
                        disabled={!hasPreviousDay}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowLeftIcon className="h-3.5 w-3.5" />
                        Ngày trước
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDay(selectedDayIndex + 1)}
                        disabled={!hasNextDay}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Ngày sau
                        <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${selectedPhaseTheme.accent} transition-all`}
                    style={{ width: `${selectedProgress}%` }}
                  />
                </div>

                {selectedDay.coach_note && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Gợi ý theo phase
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{selectedDay.coach_note}</p>
                  </div>
                )}

                <div key={`${selectedDay.date}-tasks`} className="mt-6 grid gap-3 md:grid-cols-2">
                  {selectedDay.skincare_tasks.map((task, index) => (
                    <label
                      key={task.id}
                      className={`${selectedDayMotionClass} flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        task.done
                          ? 'border-emerald-400/40 bg-emerald-400/10'
                          : 'border-white/10 bg-white/5 hover:border-emerald-300/30 hover:bg-white/8'
                      }`}
                      style={{ animationDelay: `${40 + index * 45}ms` }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(e) => toggleTask(task.id, e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/20 text-emerald-500 focus:ring-emerald-400"
                      />
                      <span className="text-sm leading-6 text-slate-100">{task.label_vi}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="motion-rise motion-stagger-3 surface-tint rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nhịp theo ngày</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Chọn đúng ngày bạn muốn xem</h3>
                </div>
                <p className="text-sm text-slate-500">Không cần mở cả lộ trình một lượt</p>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {roadmap.dailyPlan.map((day, index) => {
                  const doneCount = day.skincare_tasks.filter((task) => task.done).length
                  const percent = day.skincare_tasks.length
                    ? Math.round((doneCount / day.skincare_tasks.length) * 100)
                    : 0
                  const isSelected = index === selectedDayIndex
                  const phaseTheme = getPhaseTheme(day.phase_key)

                  return (
                    <button
                      key={day.day_index}
                      type="button"
                      onClick={() => handleSelectDay(index)}
                      className={`motion-rise motion-hover-lift min-w-[170px] rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isSelected
                          ? 'border-emerald-300 bg-white shadow-[0_18px_40px_-28px_rgba(16,185,129,0.7)]'
                          : 'border-slate-200 bg-slate-50/90 hover:border-slate-300 hover:bg-white'
                      }`}
                      style={{ animationDelay: `${90 + index * 45}ms` }}
                      aria-pressed={isSelected}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Ngày {day.day_index}
                      </p>
                      {day.phase_title_vi && (
                        <span
                          className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${phaseTheme.badge}`}
                        >
                          {day.phase_title_vi}
                        </span>
                      )}
                      <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(day.date)}</p>
                      <p className="mt-3 text-xs text-slate-500">{doneCount}/{day.skincare_tasks.length} việc</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${phaseTheme.accent}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="motion-rise motion-stagger-2 surface-tint motion-hover-lift rounded-[2rem] border border-slate-200 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <TargetIcon className="h-4 w-4 text-emerald-600" />
              Tóm tắt kế hoạch
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Mục tiêu:</span>{' '}
                {heroSummary?.focusLabel || 'Ổn định da và thói quen sống'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Ngân sách:</span>{' '}
                {heroSummary?.budgetLabel || 'Linh hoạt theo khả năng'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Nhịp cam kết:</span>{' '}
                {heroSummary?.commitmentLabel || `${roadmap.durationDays} ngày tập trung`}
              </p>
            </div>

            {heroSummary?.watchouts?.length > 0 && (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Nhóm cần lưu ý</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {heroSummary.watchouts.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDay.phase_title_vi && (
              <div className={`mt-4 rounded-2xl border p-4 ${selectedPhaseTheme.card}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bạn đang ở phase</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{selectedDay.phase_title_vi}</p>
                {selectedDay.coach_note && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedDay.coach_note}</p>
                )}
              </div>
            )}
          </div>

          <div className="motion-rise motion-stagger-3 surface-tint motion-hover-lift rounded-[2rem] border border-slate-200 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <TrophyIcon className="h-4 w-4 text-emerald-600" />
              Thành tích đang mở khóa
            </p>
            <div className="mt-4 space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
                    <CheckCircleIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{achievement}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="motion-rise motion-stagger-4 surface-tint motion-hover-lift rounded-[2rem] border border-slate-200 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <FlameIcon className="h-4 w-4 text-rose-500" />
              Gợi ý ăn uống cho ngày đang chọn
            </p>
            <div className="mt-4 space-y-2">
              {selectedDay.meal_guidance.map((line) => (
                <div key={line} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/checkin"
                className="motion-hover-lift inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Điểm danh ngay
              </Link>
              <Link
                to="/roadmap/custom"
                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-emerald-700"
              >
                Tự nhập lộ trình khác
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 text-center">
        <Link to="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại xem kết quả kiểm tra
        </Link>
      </div>
    </div>
  )
}

export default RoadmapPage
