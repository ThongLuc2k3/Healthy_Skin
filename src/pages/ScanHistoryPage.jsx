import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { CheckCircleIcon, WarningIcon, XCircleIcon } from '../components/Icons'
import { RESULT } from '../logic/matchEngine'

const THEME = {
  [RESULT.SUITABLE]: { badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', icon: CheckCircleIcon },
  [RESULT.CAUTION]: { badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', icon: WarningIcon },
  [RESULT.AVOID]: { badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40', icon: XCircleIcon },
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">
          Đăng nhập để xem lịch sử các lần quét ảnh của bạn.
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">Lịch sử quét</h1>
        <p className="mt-3 text-base text-slate-300/90">Các lần bạn đã quét ảnh thật, mới nhất trước.</p>
      </div>

      <div className="mt-8 space-y-4">
        {error && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300">{error}</p>
        )}

        {!error && history === null && (
          <p className="text-center text-sm text-cyan-300/70">Đang tải...</p>
        )}

        {history?.length === 0 && (
          <p className="rounded-3xl glass-strong border border-cyan-400/25 p-8 text-center text-sm text-slate-300 shadow-glow">
            Bạn chưa quét ảnh nào. Vào{' '}
            <Link to="/scan" className="font-semibold text-cyan-300 hover:underline">
              Quét thử
            </Link>{' '}
            để bắt đầu.
          </p>
        )}

        {history?.map((entry) => {
          const theme = entry.result ? THEME[entry.result] : null
          const Icon = theme?.icon

          return (
            <div key={entry.id} className="rounded-2xl glass-strong border border-cyan-400/20 p-5 shadow-glow">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-cyan-300/70">{formatDate(entry.createdAt)}</span>
                {entry.result && (
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {entry.result}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-base font-bold text-gradient-cyan">
                {entry.matchedItemName || entry.productName || 'Không nhận diện được sản phẩm'}
              </h2>
              {entry.reason && <p className="mt-2 text-sm leading-relaxed text-slate-300/80">{entry.reason}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScanHistoryPage
