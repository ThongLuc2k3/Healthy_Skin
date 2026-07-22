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
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
              Khu vực tài khoản
            </span>
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
            Đăng nhập để giữ trọn hồ sơ và hành trình cải thiện da.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300/90">
            Lưu hồ sơ cơ địa, kết quả quét, streak, lộ trình và các điều chỉnh thích ứng theo từng ngày
            trong một nơi duy nhất.
          </p>
          <div className="mt-8 space-y-4">
            <div className="glass rounded-2xl p-5 border border-cyan-400/20 shadow-glow flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Lộ trình không bị mất</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300/80">
                  Mọi phase, check-in và nhịp cải thiện sẽ được giữ lại để hệ thống tiếp tục cá nhân hóa.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-strong mx-auto w-full max-w-md rounded-3xl border border-cyan-400/25 p-7 shadow-glow-lg sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gradient-cyan">Đăng nhập</h2>
            <p className="mt-2 text-sm text-slate-400">Đăng nhập để lưu hồ sơ và lịch sử quét của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {sessionExpired && (
              <p className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-sm font-medium text-amber-300">
                Phiên đăng nhập trước đã hết hạn — vui lòng đăng nhập lại. Tài khoản của bạn vẫn được lưu bình thường.
              </p>
            )}
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="login-password">
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            {error && <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <p className="text-center text-sm text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-cyan-300 hover:underline">
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
