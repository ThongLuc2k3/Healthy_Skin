import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { FlameIcon } from '../components/Icons'

const STATUS_STYLE = {
  full: 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-glow',
  partial: 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-glow',
  none: 'glass border border-cyan-400/10 text-slate-500 opacity-60',
}

const STATUS_LABEL = {
  full: 'Điểm danh đủ (skincare + bữa ăn)',
  partial: 'Điểm danh thiếu 1 phần',
  none: 'Chưa điểm danh',
}

function formatDayLabel(isoDateStr) {
  const date = new Date(isoDateStr + 'T00:00:00')
  return date.getDate()
}

function StreakCalendarPage() {
  const { user, ready } = useAuth()
  const [status, setStatus] = useState('loading')
  const [calendar, setCalendar] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) return
    apiClient
      .get('/checkin/calendar?days=30', { auth: true })
      .then((data) => {
        setCalendar(data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user])

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">Đăng nhập để xem lịch theo dõi điểm danh của bạn.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Lịch theo dõi &amp; streak</h1>
        <p className="mt-3 text-base text-slate-300/90">30 ngày gần nhất — mỗi ô là một ngày điểm danh.</p>
      </div>

      <div className="mt-8">
        {status === 'loading' && <p className="text-center text-sm text-cyan-300/70">Đang tải...</p>}
        {status === 'error' && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">{errorMessage}</p>
        )}

        {status === 'ready' && calendar && (
          <>
            <div className="flex items-center justify-center gap-3 rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow">
                <FlameIcon className="h-6 w-6 text-amber-400" />
              </span>
              <div className="text-left">
                <p className="text-3xl font-extrabold text-white">{calendar.streak} ngày</p>
                <p className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">streak liên tiếp hiện tại</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-3">
              {calendar.days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date} — ${STATUS_LABEL[day.status]}`}
                  className={`flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition-all hover:scale-105 ${STATUS_STYLE[day.status]}`}
                >
                  {formatDayLabel(day.date)}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500/40 border border-emerald-400" /> Đủ cả hai
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-amber-500/40 border border-amber-400" /> Thiếu một phần
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded glass border border-cyan-400/20" /> Chưa điểm danh
              </span>
            </div>

            <div className="mt-8 text-center">
              <Link to="/checkin" className="text-sm font-semibold text-cyan-300 hover:underline">
                ← Điểm danh hôm nay
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StreakCalendarPage
