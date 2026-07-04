import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { CheckCircleIcon, WarningIcon, XCircleIcon } from '../components/Icons'
import { RESULT } from '../logic/matchEngine'

const THEME = {
  [RESULT.SUITABLE]: { badge: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
  [RESULT.CAUTION]: { badge: 'bg-amber-100 text-amber-700', icon: WarningIcon },
  [RESULT.AVOID]: { badge: 'bg-red-100 text-red-700', icon: XCircleIcon },
}

function formatDate(sqliteUtcString) {
  const date = new Date(sqliteUtcString.replace(' ', 'T') + 'Z')
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

function ScanHistoryPage() {
  const { user, ready } = useAuth()
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    apiClient
      .get('/scan/history', { auth: true })
      .then(setHistory)
      .catch((err) => setError(err.message))
  }, [user])

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">
          Đăng nhập để xem lịch sử các lần quét ảnh của bạn.
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lịch sử quét</h1>
        <p className="mt-2 text-sm text-slate-500">Các lần bạn đã quét ảnh thật, mới nhất trước.</p>
      </div>

      <div className="mt-6 space-y-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        {!error && history === null && (
          <p className="text-center text-sm text-slate-400">Đang tải...</p>
        )}

        {history?.length === 0 && (
          <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            Bạn chưa quét ảnh nào. Vào{' '}
            <Link to="/scan" className="font-semibold text-emerald-700">
              Quét thử
            </Link>{' '}
            để bắt đầu.
          </p>
        )}

        {history?.map((entry) => {
          const theme = entry.result ? THEME[entry.result] : null
          const Icon = theme?.icon

          return (
            <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">{formatDate(entry.createdAt)}</span>
                {entry.result && (
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${theme.badge}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {entry.result}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-sm font-semibold text-slate-900">
                {entry.matchedItemName || entry.productName || 'Không nhận diện được sản phẩm'}
              </h2>
              {entry.reason && <p className="mt-1 text-sm leading-relaxed text-slate-500">{entry.reason}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScanHistoryPage
