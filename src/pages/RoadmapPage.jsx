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
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    card: 'border-cyan-400/30 glass',
    accent: 'from-cyan-400 to-blue-500',
  },
  stabilize: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    card: 'border-emerald-500/30 glass',
    accent: 'from-emerald-400 to-teal-400',
  },
  improve: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    card: 'border-amber-500/30 glass',
    accent: 'from-amber-400 to-orange-400',
  },
  maintain: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    card: 'border-fuchsia-500/30 glass',
    accent: 'from-fuchsia-400 to-pink-400',
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">
          Đăng nhập để tạo và theo dõi lộ trình cá nhân hoá của bạn.
        </p>
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
        <p className="mt-3 text-sm text-slate-300">Vui lòng khai báo hồ sơ trước khi tạo lộ trình.</p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-cyan-300/70">Đang tải...</p>
  }

  if (status === 'none') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl glass-strong border border-cyan-400/25 p-8 text-center shadow-glow-lg sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-glow">
            <CalendarIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow">Bạn chưa có lộ trình nào</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-300/90">
            Sau khi đã có kết quả kiểm tra, hãy đi thêm một bước nữa: cho hệ thống biết ngân sách, nhịp
            sống và những gì bạn đang dùng để tạo ra một kế hoạch cải thiện sát thực tế.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/roadmap/plan"
              className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
            >
              Lập kế hoạch cải thiện
            </Link>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-xl glass border border-cyan-400/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-400 disabled:opacity-60"
            >
              {generating ? 'Đang tạo...' : 'Dùng lộ trình tự sinh nhanh'}
            </button>
            <Link
              to="/roadmap/custom"
              className="rounded-xl border border-dashed border-cyan-400/30 glass px-6 py-3.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400"
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
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">
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

  const achievements = [
    `${completedTasks}/${totalTasks} việc đã được đánh dấu hoàn thành`,
    selectedProgress === 100 ? 'Hôm nay bạn đã chốt đủ routine' : `Hôm nay đang ở mức ${selectedProgress}%`,
    streak > 0 ? `Giữ streak ${streak} ngày liên tiếp` : 'Hãy điểm danh để bắt đầu chuỗi mới',
  ]
  const hasPreviousDay = selectedDayIndex > 0
  const hasNextDay = selectedDayIndex < roadmap.dailyPlan.length - 1

  function handleSelectDay(index) {
    if (index === selectedDayIndex) return
    setSelectedDayIndex(index)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('day', roadmap.dailyPlan[index].date)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl glass-strong border border-cyan-400/25 shadow-glow-lg overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-cyan-400/20 bg-slate-950/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
                  <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                    Dashboard cải thiện cá nhân
                  </span>
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
                  {savedPlan?.goal || 'Lộ trình của bạn'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/90">
                  Mỗi ngày chỉ tập trung đúng việc cần làm cho hôm đó. Không dàn hàng cả mấy tháng, không
                  tạo cảm giác quá tải.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/roadmap/plan"
                  className="rounded-xl glass border border-cyan-400/30 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400"
                >
                  Chỉnh kế hoạch
                </Link>
                <Link
                  to="/checkin"
                  className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
                >
                  Điểm danh hôm nay
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl glass p-4 border border-cyan-400/20 shadow-glow">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Tiến độ</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{completionRate}%</p>
                <p className="mt-1 text-xs text-slate-400">toàn bộ lộ trình đã đi qua</p>
              </div>
              <div className="rounded-2xl glass p-4 border border-amber-500/30 shadow-glow">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">Streak</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{streak}</p>
                <p className="mt-1 text-xs text-slate-400">ngày giữ nhịp liên tiếp</p>
              </div>
              <div className="rounded-2xl glass p-4 border border-cyan-400/20 shadow-glow">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">Mốc hôm nay</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{selectedProgress}%</p>
                <p className="mt-1 text-xs text-slate-400">việc của ngày đang chọn</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">
                {errorMessage}
              </p>
            )}

            <div className="rounded-2xl glass border border-cyan-400/30 p-6 shadow-glow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Ngày đang theo dõi</p>
                  {selectedDay.phase_title_vi && (
                    <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${selectedPhaseTheme.badge}`}>
                      <ShieldIcon className="h-3.5 w-3.5" />
                      Phase: {selectedDay.phase_title_vi}
                    </span>
                  )}
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Ngày {selectedDay.day_index} — {formatDate(selectedDay.date)}
                  </h2>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="rounded-xl glass border border-cyan-400/20 px-4 py-2 text-sm text-cyan-200">
                    {selectedDoneCount}/{selectedDay.skincare_tasks.length} việc đã hoàn thành
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDay(selectedDayIndex - 1)}
                      disabled={!hasPreviousDay}
                      className="inline-flex items-center gap-1.5 rounded-xl glass border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-400 disabled:opacity-40"
                    >
                      <ArrowLeftIcon className="h-3.5 w-3.5" />
                      Ngày trước
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDay(selectedDayIndex + 1)}
                      disabled={!hasNextDay}
                      className="inline-flex items-center gap-1.5 rounded-xl glass border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-400 disabled:opacity-40"
                    >
                      Ngày sau
                      <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-900 border border-cyan-400/20">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${selectedPhaseTheme.accent} shadow-glow`}
                  style={{ width: `${selectedProgress}%` }}
                />
              </div>

              {selectedDay.coach_note && (
                <div className="mt-5 rounded-xl glass border border-cyan-400/20 px-4 py-3.5">
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                    Gợi ý theo phase
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{selectedDay.coach_note}</p>
                </div>
              )}

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {selectedDay.skincare_tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      task.done
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 shadow-glow'
                        : 'border-cyan-400/20 glass text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-cyan-400/40 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className="text-sm leading-relaxed">{task.label_vi}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl glass p-5 border border-cyan-400/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Nhịp theo ngày</p>
                  <h3 className="mt-1 text-base font-bold text-white">Chọn đúng ngày bạn muốn xem</h3>
                </div>
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
                      className={`min-w-[170px] rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-glow ring-1 ring-cyan-400'
                          : 'border-cyan-400/15 glass text-slate-300 hover:border-cyan-400/40'
                      }`}
                    >
                      <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300/80">
                        Ngày {day.day_index}
                      </p>
                      {day.phase_title_vi && (
                        <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${phaseTheme.badge}`}>
                          {day.phase_title_vi}
                        </span>
                      )}
                      <p className="mt-2 text-sm font-semibold text-white">{formatDate(day.date)}</p>
                      <p className="mt-2 text-xs text-slate-400">{doneCount}/{day.skincare_tasks.length} việc</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
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
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <TargetIcon className="h-4 w-4 text-cyan-300" />
              Tóm tắt kế hoạch
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Mục tiêu:</span>{' '}
                {heroSummary?.focusLabel || 'Ổn định da và thói quen sống'}
              </p>
              <p>
                <span className="font-semibold text-white">Ngân sách:</span>{' '}
                {heroSummary?.budgetLabel || 'Linh hoạt theo khả năng'}
              </p>
              <p>
                <span className="font-semibold text-white">Nhịp cam kết:</span>{' '}
                {heroSummary?.commitmentLabel || `${roadmap.durationDays} ngày tập trung`}
              </p>
            </div>

            {heroSummary?.watchouts?.length > 0 && (
              <div className="mt-4 rounded-2xl glass border border-amber-500/30 p-4">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">Nhóm cần lưu ý</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {heroSummary.watchouts.map((item) => (
                    <span key={item} className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-medium text-amber-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDay.phase_title_vi && (
              <div className={`mt-4 rounded-2xl border p-4 ${selectedPhaseTheme.card}`}>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">Bạn đang ở phase</p>
                <p className="mt-1.5 text-lg font-bold text-white">{selectedDay.phase_title_vi}</p>
                {selectedDay.coach_note && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedDay.coach_note}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <TrophyIcon className="h-4 w-4 text-cyan-300" />
              Thành tích đang mở khóa
            </p>
            <div className="mt-4 space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement} className="flex items-start gap-3 rounded-2xl glass border border-cyan-400/20 px-4 py-3">
                  <span className="mt-0.5 rounded-full bg-emerald-500/20 p-1 text-emerald-300 border border-emerald-500/40">
                    <CheckCircleIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-200">{achievement}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <FlameIcon className="h-4 w-4 text-rose-400" />
              Gợi ý ăn uống cho ngày đang chọn
            </p>
            <div className="mt-4 space-y-2.5">
              {selectedDay.meal_guidance.map((line) => (
                <div key={line} className="rounded-2xl glass border border-cyan-400/20 px-4 py-3 text-sm leading-relaxed text-slate-200">
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/checkin"
                className="inline-flex items-center gap-2 rounded-xl glass border border-cyan-400/30 px-3.5 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400 shadow-glow"
              >
                Điểm danh ngay
              </Link>
              <Link
                to="/roadmap/custom"
                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-cyan-300 hover:underline"
              >
                Tự nhập lộ trình khác
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-10 text-center">
        <Link to="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại xem kết quả kiểm tra
        </Link>
      </div>
    </div>
  )
}

export default RoadmapPage
