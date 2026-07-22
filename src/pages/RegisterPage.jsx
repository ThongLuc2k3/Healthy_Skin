import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldIcon, SparklesIcon } from '../components/Icons'

function RegisterPage() {
  const { register } = useAuth()
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
      await register(email, password)
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
              Bắt đầu hệ sinh thái
            </span>
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
            Tạo tài khoản để biến kết quả kiểm tra thành hành trình theo dõi dài hạn.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300/90">
            Khi có tài khoản, bạn giữ được hồ sơ cơ địa, dữ liệu scan, streak, roadmap thích ứng và toàn bộ tiến trình chăm da.
          </p>
          <div className="mt-8 space-y-4">
            <div className="glass rounded-2xl p-5 border border-cyan-400/20 shadow-glow flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Lộ trình và streak đồng bộ</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300/80">
                  Mỗi lần điểm danh và điều chỉnh ngày mai sẽ bám theo tài khoản của bạn, không bị reset ngẫu nhiên.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-strong mx-auto w-full max-w-md rounded-3xl border border-cyan-400/25 p-7 shadow-glow-lg sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gradient-cyan">Tạo tài khoản</h2>
            <p className="mt-2 text-sm text-slate-400">Lưu hồ sơ cơ địa vĩnh viễn và dùng tính năng quét ảnh thật.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="register-password">
                Mật khẩu
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Ít nhất 6 ký tự.</p>
            </div>

            {error && <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>

            <p className="text-center text-sm text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage
