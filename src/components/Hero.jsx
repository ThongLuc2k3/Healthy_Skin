import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SparklesIcon, CameraIcon } from './Icons'
import ParticleField from './ParticleField'
import { useAuth } from '../context/AuthContext'

const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero() {
  const { user } = useAuth()

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden noise bg-[#02040b]">
      {/* Background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#0a1a2e_0%,#050b18_45%,#02040b_100%)]" />
      <div className="absolute inset-0 grid-bg animate-gridPan opacity-60 mask-fade-b" />
      <div className="absolute left-1/2 top-1/3 h-[65vh] w-[65vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/12 blur-[130px] animate-pulseGlow" />
      <div className="absolute right-[15%] top-[55%] h-[35vh] w-[35vh] rounded-full bg-blue-600/12 blur-[110px] animate-pulseGlow" />

      {/* Sparkle particle field filling 100% of Hero background */}
      <ParticleField density={180} />

      {/* Enlarged 3D Centered Sphere Scene */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Centered Hero Content */}
      <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-end px-6 pb-[10vh] text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow border border-cyan-400/25"
        >
          <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-200 font-semibold">
            DA DƯỠNG · NỀN TẢNG CÁ NHÂN HÓA
          </span>
        </motion.div>

        {/* Centered Title */}
        <motion.h1
          initial={{ opacity: 0, y: -25, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-[2.7rem] leading-[1.05] sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow"
        >
          Đúng da, đúng dưỡng chất.
          <br />
          Từ trong ra ngoài.
        </motion.h1>

        {/* Centered Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-base sm:text-lg text-slate-300/90 leading-relaxed font-medium"
        >
          Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên một hồ sơ cơ địa dùng chung, giúp bạn biết ngay sản phẩm hay thực phẩm nào phù hợp với chính mình.
        </motion.p>

        {/* Centered Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-glow-lg transition-all hover:bg-cyan-300 hover:scale-[1.03]"
          >
            Bắt đầu khai báo hồ sơ
          </Link>
          <Link
            to="/scan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl glass border border-cyan-400/25 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-cyan-400/60 hover:shadow-glow"
          >
            <CameraIcon className="h-4 w-4 text-cyan-300" />
            Thử quét sản phẩm
          </Link>
        </motion.div>

        {/* Non-logged in User Camera Callout Banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl glass-strong p-5 text-left border border-cyan-400/25 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <CameraIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-gradient-cyan">
                  Tạo tài khoản để lưu hồ sơ &amp; quét ảnh thật bằng AI
                </p>
                <p className="text-xs text-slate-300">
                  Đồng bộ hồ sơ trên mọi thiết bị, xem lại lịch sử quét — miễn phí.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2.5 sm:w-auto shrink-0">
              <Link
                to="/register"
                className="flex-1 rounded-xl bg-cyan-400 px-5 py-2 text-center text-xs font-bold text-slate-950 shadow-glow transition hover:bg-cyan-300 sm:flex-none"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="flex-1 rounded-xl glass border border-cyan-400/30 px-5 py-2 text-center text-xs font-bold text-cyan-200 transition hover:border-cyan-400 sm:flex-none"
              >
                Đăng nhập
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
