import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">Đăng nhập để lưu hồ sơ và lịch sử quét của bạn.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        {sessionExpired && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            Phiên đăng nhập trước đã hết hạn — vui lòng đăng nhập lại. Tài khoản của bạn vẫn được lưu
            bình thường.
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
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
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
    </div>
  )
}

export default LoginPage
