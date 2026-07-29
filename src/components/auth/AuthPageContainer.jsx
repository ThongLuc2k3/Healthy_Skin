import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Scan,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { FloatingInput, GlassButton } from './AuthFields'
import { blur } from 'three/tsl'

export default function AuthPageContainer({ initialMode = 'login' }) {
  const { login, register, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)

  // Form states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  const isRegister = mode === 'register'

  function switchMode(next) {
    if (next === mode) return
    setLoginError('')
    setRegError('')
    setMode(next)
    navigate(next === 'register' ? '/register' : '/login', { replace: true })
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate('/profile')
    } catch (err) {
      setLoginError(err.message || 'Đăng nhập không thành công.')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setRegError('')
    setRegLoading(true)
    try {
      await register(regEmail, regPassword)
      navigate('/profile')
    } catch (err) {
      setRegError(err.message || 'Đăng ký không thành công.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#02040b] noise py-10 flex flex-col items-center justify-center pt-25">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#0a1a2e_0%,#050b18_50%,#02040b_100%)]" />

      {/* Floating animated blobs */}
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-[90px] animate-blob1" />
      <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[100px] animate-blob2" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-500/15 blur-[90px] animate-blob3" />
      <div className="absolute right-1/4 bottom-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px] animate-blob1" />

      {/* Moving grid & scanline */}
      <div className="absolute inset-0 grid-bg animate-gridPan opacity-25 pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400/40 to-transparent animate-scanline" />
      </div>

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-[920px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full overflow-hidden rounded-[28px] bg-[#061122]/90 backdrop-blur-2xl border border-cyan-400/30 shadow-glow-lg"
          style={{ minHeight: 540 }}
        >
          {/* DESKTOP LAYOUT (>= md screens): 2-track grid with sliding overlay */}
          <div className="hidden md:flex relative min-h-[540px]">
            {/* LOGIN FORM (Left 50%) */}
            <div className="w-1/2 p-10 flex flex-col justify-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-500 via-cyan-500 to-cyan-200 bg-clip-text text-transparent">Chào mừng trở lại</h2>
                <p className="mt-2 text-sm text-[#cbd5e1]">
                  Đăng nhập để xem hồ sơ cơ địa và hành trình cải thiện da của bạn.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {sessionExpired && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 text-xs text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Phiên làm việc hết hạn — vui lòng đăng nhập lại.</span>
                  </div>
                )}

                <FloatingInput
                  id="desktop-login-email"
                  label="Email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                <FloatingInput
                  id="desktop-login-password"
                  label="Mật khẩu"
                  isPassword
                  icon={<Lock className="h-4 w-4" />}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                  required
                />

                {loginError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex justify-center w-full pt-2">
                  <GlassButton type="submit" loading={loginLoading}>
                    Đăng nhập
                    {!loginLoading && <ArrowRight className="h-4 w-4" />}
                  </GlassButton>
                </div>
              </form>
            </div>

            {/* REGISTER FORM (Right 50%) */}
            <div className="w-1/2 p-10 flex flex-col justify-center">
              <div className="mb-6 text-right">
                <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Tạo tài khoản mới</h2>
                <p className="mt-2 text-sm text-[#cbd5e1]">
                  Lưu trữ kết quả kiểm tra da và thiết lập lộ trình dài hạn.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <FloatingInput
                  id="desktop-reg-email"
                  label="Email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                <FloatingInput
                  id="desktop-reg-password"
                  label="Mật khẩu (tối thiểu 6 ký tự)"
                  isPassword
                  icon={<Lock className="h-4 w-4" />}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                {regError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="flex justify-center w-full pt-2">
                  <GlassButton type="submit" loading={regLoading}>
                    Tạo tài khoản
                    {!regLoading && <ArrowRight className="h-4 w-4" />}
                  </GlassButton>
                </div>
              </form>
            </div>

            {/* SLIDING OVERLAY PANEL (Top layer) */}
            <motion.div
              className={`absolute top-0 bottom-0 z-20 w-1/2 overflow-hidden transition-all duration-500 ${
                isRegister ? 'rounded-l-[28px]' : 'rounded-r-[28px]'
              }`}
              initial={false}
              animate={{ left: isRegister ? '0%' : '50%' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Dynamic Image Background from public directory with blur filter */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isRegister ? 'bg-reg' : 'bg-login'}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-cover bg-center blur-[2px]"
                  style={{
                    backgroundImage: isRegister
                      ? `url("/Registerv2.jpg")`
                      : `url("/Login page.jpg")`,
                  }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 border-x border-cyan-400/30" />

              {/* Decorative background blobs inside overlay */}
              <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl animate-blob1" />
              <div className="absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl animate-blob2" />

              {/* Content tracks */}
              <div className="relative flex h-full items-center justify-center p-8 text-center">
                <AnimatePresence mode="wait">
                  {!isRegister ? (
                    <motion.div
                      key="overlay-login"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center"
                    >
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-900 border border-sky-600/20 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        Chưa có tài khoản?
                      </span>
                      <h3 className="mt-4 text-2xl font-extrabold text-sky-800 tracking-tight">
                        Phân tích da với AI
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#51647c] max-w-xs">
                        Tạo tài khoản để biến kết quả kiểm tra thành hành trình theo dõi và cá nhân hóa dài hạn.
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => switchMode('register')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-white bg-sky-900 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-sky-600/30 hover:text-slate-950 hover:border-sky-200 shadow-glow"
                      >
                        Đăng ký tài khoản
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="overlay-register"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center"
                    >
                      <span className="inline-flex items-center gap-2 rounded-full bg-sky-900 border border-sky-900/30 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-white">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Đã có tài khoản?
                      </span>
                      <h3 className="mt-4 text-xl font-extrabold bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                        Chào mừng trở lại
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#074645] max-w-xs">
                        Đăng nhập để xem lại kết quả quét, lịch sử điểm danh streak và các gợi ý cải thiện.
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => switchMode('login')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-900/30 bg-sky-900 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-sky-600/30 hover:text-slate-950 shadow-glow"
                      >
                        Đăng nhập ngay
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* MOBILE LAYOUT (< md screens): Single responsive column filled with background image */}
          <div className="md:hidden relative min-h-[540px] h-full p-6 sm:p-8 overflow-hidden flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegister ? 'mob-bg-reg' : 'mob-bg-login'}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.05 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-cover bg-center blur-[2px]"
                style={{
                  backgroundImage: isRegister
                    ? `url("/Registerv1.jpg")`
                    : `url("/Login page.jpg")`,
                }}
              />
            </AnimatePresence>



            <div className="relative z-10">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-900 border border-slate px-3.5 py-1 text-xs font-mono font-semibold text-white uppercase tracking-wider backdrop-blur-md shadow-glow">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-sky-900">
                  {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
                </h2>
                <p className="mt-1.5 text-xs text-[#0a2444]">
                  {isRegister
                    ? 'Lưu trữ hồ sơ cơ địa và hành trình cải thiện làn da.'
                    : 'Đăng nhập để lưu hồ sơ và xem lịch sử quét.'}
                </p>
              </div>

            <AnimatePresence mode="wait">
              {!isRegister ? (
                <motion.form
                  key="mobile-login-form"
                  onSubmit={handleLoginSubmit}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  {sessionExpired && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 text-xs text-amber-300">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Phiên làm việc hết hạn — vui lòng đăng nhập lại.</span>
                    </div>
                  )}

                  <FloatingInput
                    id="mobile-login-email"
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <FloatingInput
                    id="mobile-login-password"
                    label="Mật khẩu"
                    isPassword
                    icon={<Lock className="h-4 w-4" />}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />

                  {loginError && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="flex justify-center w-full pt-2">
                    <GlassButton type="submit" loading={loginLoading}>
                      Đăng nhập
                      {!loginLoading && <ArrowRight className="h-4 w-4" />}
                    </GlassButton>
                  </div>

                  <p className="text-center text-xs text-[#304564] mt-4">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-[#2f425e] hover:underline ml-1"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="mobile-reg-form"
                  onSubmit={handleRegisterSubmit}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <FloatingInput
                    id="mobile-reg-email"
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <FloatingInput
                    id="mobile-reg-password"
                    label="Mật khẩu (tối thiểu 6 ký tự)"
                    isPassword
                    icon={<Lock className="h-4 w-4" />}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  {regError && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="flex justify-center w-full pt-2">
                    <GlassButton type="submit" loading={regLoading}>
                      Tạo tài khoản
                      {!regLoading && <ArrowRight className="h-4 w-4" />}
                    </GlassButton>
                  </div>

                  <p className="text-center text-xs text-[#2f425e] mt-4">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#2f425e] hover:underline ml-1"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trust bar at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-[#94a3b8]"
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          Bảo mật thông tin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          AI-Powered Skin Intelligence
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Phiên kết nối an toàn
        </span>
      </motion.div>
    </section>
  )
}
