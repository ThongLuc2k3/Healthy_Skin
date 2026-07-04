import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { getRecommendations, RESULT } from '../logic/matchEngine'
import { apiClient } from '../lib/apiClient'
import { WarningIcon, TrashIcon } from '../components/Icons'

const MAX_DURATION_DAYS = 60

function CustomRoadmapPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const { skincare, food } = useItems()
  const navigate = useNavigate()

  const [goal, setGoal] = useState('')
  const [durationDays, setDurationDays] = useState(14)
  const [tasks, setTasks] = useState([''])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Danh sách "nên tránh" theo hồ sơ hiện tại — dùng để cảnh báo mềm khi việc tự nhập
  // trùng ý với một item bị gắn cờ nên tránh. KHÔNG chặn lưu, chỉ nhắc nhở.
  const avoidItems = useMemo(() => {
    if (!isProfileComplete(profile)) return []
    const skincareAvoid = getRecommendations(profile, skincare)[RESULT.AVOID]
    const foodAvoid = getRecommendations(profile, food)[RESULT.AVOID]
    return [...skincareAvoid, ...foodAvoid]
  }, [profile, skincare, food])

  function findWarning(taskText) {
    const normalized = taskText.trim().toLowerCase()
    if (!normalized) return null
    const match = avoidItems.find((item) => normalized.includes(item.name_vi.toLowerCase()))
    if (!match) return null
    return `Mục này có thể không phù hợp với hồ sơ của bạn (${match.name_vi} — ${match.reason}) — vẫn muốn thêm vào lộ trình?`
  }

  function updateTask(index, value) {
    setTasks((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  function addTask() {
    setTasks((prev) => [...prev, ''])
  }

  function removeTask(index) {
    setTasks((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanTasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0)
    if (cleanTasks.length === 0) {
      setErrorMessage('Vui lòng nhập ít nhất một việc muốn làm mỗi ngày.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      await apiClient.post(
        '/roadmap/custom',
        { goal, durationDays, tasks: cleanTasks },
        { auth: true },
      )
      navigate('/roadmap')
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
        <p className="mt-2 text-sm text-slate-500">Đăng nhập để tự thiết kế lộ trình riêng.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
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
        <p className="mt-2 text-sm text-slate-500">Vui lòng khai báo hồ sơ trước khi tự thiết kế lộ trình.</p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tự thiết kế lộ trình</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bỏ qua lộ trình tự sinh — tự chọn mục tiêu, số ngày và việc muốn làm mỗi ngày.
        </p>
        <Link to="/roadmap" className="mt-2 inline-block text-sm font-semibold text-emerald-700">
          ← Dùng lộ trình hệ thống tự sinh thay vào đó
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="goal" className="text-sm font-medium text-slate-700">
            Mục tiêu chính
          </label>
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ví dụ: Giảm mụn trong 2 tuần"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="durationDays" className="text-sm font-medium text-slate-700">
            Số ngày mong muốn
          </label>
          <input
            id="durationDays"
            type="number"
            min={1}
            max={MAX_DURATION_DAYS}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="mt-1 w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Việc muốn làm mỗi ngày</p>
          <div className="mt-2 space-y-2">
            {tasks.map((task, index) => {
              const warning = findWarning(task)
              return (
                <div key={index}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder="Ví dụ: Đắp mặt nạ đất sét"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="flex items-center justify-center rounded-lg px-2 py-2 text-red-500 hover:bg-red-50"
                        aria-label="Xoá việc"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {warning && (
                    <p className="mt-1 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                      <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {warning}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={addTask}
            className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
          >
            + Thêm việc
          </button>
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {submitting ? 'Đang lưu...' : 'Lưu lộ trình riêng của tôi'}
        </button>
      </form>
    </div>
  )
}

export default CustomRoadmapPage
