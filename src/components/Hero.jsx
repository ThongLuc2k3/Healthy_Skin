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
      {/* Dark Background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#0a1a2e_0%,#050b18_45%,#02040b_100%)]" />
      <div className="absolute inset-0 grid-bg animate-gridPan opacity-60 mask-fade-b" />
      <div className="absolute left-1/2 top-1/3 h-[65vh] w-[65vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/12 blur-[130px] animate-pulseGlow" />
      <div className="absolute right-[15%] top-[55%] h-[35vh] w-[35vh] rounded-full bg-blue-600/12 blur-[110px] animate-pulseGlow" />

      {/* Sparkle particle field filling 100% of Hero background */}
      <ParticleField density={180} />

      {/* 3D Centered Sphere Scene */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Centered Hero Content */}
      <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-end px-6 pt-28 pb-10 sm:pb-[10vh] text-center">
        {/* Eyebrow Badge */}
        

        {/* Centered Title */}
        <motion.h1
          initial={{ opacity: 0, y: -25, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-[2.7rem] leading-[1.08] sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
        >
          Đúng da, đúng dưỡng chất.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Từ trong ra ngoài.
          </span>
        </motion.h1>

        {/* Centered Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-cyan-50/95 leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] bg-[#050b18]/60 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-cyan-400/20 shadow-xl"
        >
          Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên một hồ sơ cá nhân dùng chung, giúp bạn biết ngay sản phẩm hay thực phẩm nào phù hợp với chính mình.
        </motion.p>

        {/* Centered Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00b4d8] hover:bg-[#38bdf8] px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 shadow-[0_0_30px_rgba(0,180,216,0.6)] transition-all hover:scale-105"
          >
            Bắt đầu khai báo hồ sơ
          </Link>
          <Link
            to="/scan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0a1628]/80 hover:bg-[#0f223d] border border-cyan-400/50 px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-cyan-200 shadow-lg transition-all hover:border-cyan-300 hover:text-white"
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
            className="mt-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-[#061120]/90 backdrop-blur-xl p-5 text-left border border-cyan-400/35 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                <CameraIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-cyan-300 tracking-tight">
                  Tạo tài khoản để lưu hồ sơ &amp; quét ảnh thật bằng AI
                </p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  Đồng bộ hồ sơ trên mọi thiết bị, xem lại lịch sử quét, miễn phí.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2.5 sm:w-auto shrink-0">
              <Link
                to="/register"
                className="flex-1 rounded-full bg-[#00b4d8] hover:bg-[#38bdf8] px-6 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(0,180,216,0.4)] transition hover:scale-105 sm:flex-none"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="flex-1 rounded-full bg-[#0e1d33] hover:bg-[#142846] border border-cyan-400/40 px-6 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-white transition hover:border-cyan-300 sm:flex-none"
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





