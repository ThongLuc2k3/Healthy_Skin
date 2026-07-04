import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { FlameIcon } from '../components/Icons'

const STATUS_STYLE = {
  full: 'bg-emerald-500 text-white',
  partial: 'bg-amber-300 text-amber-900',
  none: 'bg-slate-100 text-slate-300',
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">Đăng nhập để xem lịch theo dõi điểm danh của bạn.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lịch theo dõi &amp; streak</h1>
        <p className="mt-2 text-sm text-slate-500">30 ngày gần nhất — mỗi ô là một ngày điểm danh.</p>
      </div>

      <div className="mt-6">
        {status === 'loading' && <p className="text-center text-sm text-slate-400">Đang tải...</p>}
        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        {status === 'ready' && calendar && (
          <>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <FlameIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-emerald-800">{calendar.streak} ngày</p>
                <p className="text-xs font-medium text-emerald-700">streak liên tiếp hiện tại</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendar.days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date} — ${STATUS_LABEL[day.status]}`}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${STATUS_STYLE[day.status]}`}
                >
                  {formatDayLabel(day.date)}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500" /> Đủ cả hai
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-300" /> Thiếu một phần
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-slate-100" /> Chưa điểm danh
              </span>
            </div>

            <div className="mt-6 text-center">
              <Link to="/checkin" className="text-sm font-semibold text-emerald-700">
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
