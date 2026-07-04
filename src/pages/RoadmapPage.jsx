import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { apiClient } from '../lib/apiClient'
import { CalendarIcon, SparklesIcon } from '../components/Icons'

function formatDate(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

function RoadmapPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const [roadmap, setRoadmap] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!user) return
    apiClient
      .get('/roadmap/current', { auth: true })
      .then((data) => {
        setRoadmap(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.status === 404) {
          setStatus('none')
        } else {
          setErrorMessage(err.message)
          setStatus('error')
        }
      })
  }, [user])

  async function handleGenerate() {
    setGenerating(true)
    setErrorMessage('')
    try {
      const data = await apiClient.post('/roadmap/generate', {}, { auth: true })
      setRoadmap(data)
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lộ trình của bạn</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kế hoạch chăm sóc da &amp; dinh dưỡng theo ngày, sinh tự động từ hồ sơ cơ địa của bạn.
        </p>
      </div>

      <div className="mt-6">
        {status === 'loading' && <p className="text-center text-sm text-slate-400">Đang tải...</p>}

        {status === 'none' && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">Bạn chưa có lộ trình nào</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              Tạo lộ trình 14 ngày dựa trên hồ sơ cơ địa hiện tại — gồm việc chăm sóc da mỗi ngày và
              gợi ý dinh dưỡng cần lưu ý.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="mt-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {generating ? 'Đang tạo...' : 'Tạo lộ trình cho tôi'}
            </button>
            <p className="mt-3 text-sm">
              <Link to="/roadmap/custom" className="font-semibold text-emerald-700">
                Hoặc tự thiết kế lộ trình riêng →
              </Link>
            </p>
            {errorMessage && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        {status === 'ready' && roadmap && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-800">
                Lộ trình {roadmap.durationDays} ngày —{' '}
                {roadmap.source === 'auto_generated' ? 'tự sinh theo hồ sơ' : 'tự thiết kế'}
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/roadmap/custom"
                  className="text-xs font-semibold text-emerald-700 underline decoration-dotted"
                >
                  Tự thiết kế lộ trình
                </Link>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-xs font-semibold text-emerald-700 underline decoration-dotted disabled:opacity-60"
                >
                  {generating ? 'Đang tạo...' : 'Tạo lộ trình mới'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {roadmap.dailyPlan.map((day) => (
              <div key={day.day_index} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  Ngày {day.day_index} — {formatDate(day.date)}
                </h3>

                <div className="mt-3">
                  <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Chăm sóc da</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {day.skincare_tasks.map((task) => (
                      <li key={task.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={(e) => toggleTask(task.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className={task.done ? 'text-slate-400 line-through' : ''}>
                            {task.label_vi}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-slate-400 uppercase">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Dinh dưỡng cần lưu ý
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
                    {day.meal_guidance.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Lộ trình sinh tự động theo quy tắc (rule-based) từ hồ sơ cơ địa — không phải chẩn đoán y khoa,
        chỉ mang tính tham khảo.
      </p>
    </div>
  )
}

export default RoadmapPage
