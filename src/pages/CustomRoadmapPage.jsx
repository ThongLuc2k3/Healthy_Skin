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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">Đăng nhập để tự thiết kế lộ trình riêng.</p>
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
        <p className="mt-3 text-sm text-slate-300">Vui lòng khai báo hồ sơ trước khi tự thiết kế lộ trình.</p>
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
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Tự thiết kế lộ trình</h1>
        <p className="mt-3 text-base text-slate-300/90">
          Bỏ qua lộ trình tự sinh — tự chọn mục tiêu, số ngày và việc muốn làm mỗi ngày.
        </p>
        <Link to="/roadmap" className="mt-3 inline-block text-sm font-semibold text-cyan-300 hover:underline">
          ← Dùng lộ trình hệ thống tự sinh thay vào đó
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl glass-strong border border-cyan-400/25 p-7 shadow-glow-lg">
        <div>
          <label htmlFor="goal" className="text-sm font-semibold text-slate-200">
            Mục tiêu chính
          </label>
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ví dụ: Giảm mụn trong 2 tuần"
            className="mt-2 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="durationDays" className="text-sm font-semibold text-slate-200">
            Số ngày mong muốn
          </label>
          <input
            id="durationDays"
            type="number"
            min={1}
            max={MAX_DURATION_DAYS}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="mt-2 w-32 rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Việc muốn làm mỗi ngày</p>
          <div className="mt-3 space-y-3">
            {tasks.map((task, index) => {
              const warning = findWarning(task)
              return (
                <div key={index}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder="Ví dụ: Đắp mặt nạ đất sét"
                      className="flex-1 rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="flex items-center justify-center rounded-xl p-2.5 text-rose-400 hover:bg-rose-500/20"
                        aria-label="Xoá việc"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {warning && (
                    <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs text-amber-200">
                      <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
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
            className="mt-3 rounded-xl border border-dashed border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10"
          >
            + Thêm việc
          </button>
        </div>

        {errorMessage && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {submitting ? 'Đang lưu...' : 'Lưu lộ trình riêng của tôi'}
        </button>
      </form>
    </div>
  )
}

export default CustomRoadmapPage
