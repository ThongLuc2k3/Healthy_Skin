import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldIcon, SparklesIcon } from '../components/Icons'

function LoginPage() {
  const { login, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="aurora-shell mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl items-center justify-center px-4 py-10"
      style={{
        '--aurora-a': '#34d399',
        '--aurora-b': '#14b8a6',
        '--aurora-c': '#99f6e4',
        '--blob-a': '#34d399',
        '--blob-b': '#14b8a6',
        '--blob-c': '#99f6e4',
      }}
    >
      <div className="aurora-layer rounded-[2rem]" />
      <div className="phase-blob phase-blob-a" />
      <div className="phase-blob phase-blob-b" />
      <div className="phase-blob phase-blob-c" />
      <div className="aurora-content grid w-full max-w-4xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="motion-rise hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            <SparklesIcon className="h-3.5 w-3.5" />
            Khu vực tài khoản
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-slate-900">
            Đăng nhập để giữ trọn hồ sơ và hành trình cải thiện da.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Lưu hồ sơ cơ địa, kết quả quét, streak, lộ trình và các điều chỉnh thích ứng theo từng ngày
            trong một nơi duy nhất.
          </p>
          <div className="mt-6 space-y-3">
            <div className="surface-tint motion-hover-lift flex max-w-md items-start gap-3 rounded-2xl border border-white/80 px-4 py-4 shadow-sm">
              <span className="mt-0.5 rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Lộ trình không bị mất</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Mọi phase, check-in và nhịp cải thiện sẽ được giữ lại để hệ thống tiếp tục cá nhân hóa.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="motion-rise motion-stagger-2 surface-tint-strong mx-auto w-full max-w-md rounded-[2rem] border border-white/80 p-6 shadow-[0_20px_70px_-40px_rgba(16,185,129,0.5)] sm:p-7">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-sm text-slate-500">Đăng nhập để lưu hồ sơ và lịch sử quét của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {sessionExpired && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                Phiên đăng nhập trước đã hết hạn — vui lòng đăng nhập lại. Tài khoản của bạn vẫn được lưu bình thường.
              </p>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="motion-hover-lift w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-emerald-700">
                Đăng ký
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
