import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CameraIcon } from './Icons'
import { useAuth } from '../context/AuthContext'

export default function Hero() {
  const { user } = useAuth()

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-gradient-to-br from-[#f6fbf9] via-white to-[#eaf7f1]">
      {/* Nền 2D tĩnh: gradient nhạt + vài khối blob mờ làm hoạ tiết, không dùng 3D/particle */}
      <div className="absolute inset-0 grid-bg opacity-40 mask-fade-b" />
      <div className="absolute -left-24 top-24 h-[50vh] w-[50vh] rounded-full bg-[#c5e7dd]/60 blur-[110px] animate-blob1" />
      <div className="absolute right-[-10%] top-[45%] h-[40vh] w-[40vh] rounded-full bg-[#f4eddf]/70 blur-[100px] animate-blob2" />
      <div className="absolute left-[35%] bottom-[-10%] h-[35vh] w-[35vh] rounded-full bg-[#9fd8c9]/50 blur-[100px] animate-blob3" />

      {/* Centered Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-end px-6 pt-28 pb-10 sm:pb-[10vh] text-center">
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-[2.7rem] leading-[1.08] sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0e3b33]"
        >
          Đúng da, đúng dưỡng chất.
          <br />
          <span className="text-gradient-logo">Từ trong ra ngoài.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-[#126b59] leading-relaxed font-semibold bg-white/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#c5e7dd] shadow-glow"
        >
          Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên một hồ sơ cá nhân dùng chung, giúp bạn biết ngay sản phẩm hay thực phẩm nào phù hợp với chính mình.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2fa98c] hover:bg-[#126b59] px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-glow transition-all hover:scale-105"
          >
            Bắt đầu khai báo hồ sơ
          </Link>
          <Link
            to="/scan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-[#eaf7f1] border border-[#2fa98c]/50 px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#126b59] shadow-glow transition-all hover:border-[#2fa98c]"
          >
            <CameraIcon className="h-4 w-4 text-[#2fa98c]" />
            Thử quét sản phẩm
          </Link>
        </motion.div>

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-white/85 backdrop-blur-xl p-5 text-left border border-[#c5e7dd] shadow-glow-lg"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf7f1] text-[#2fa98c] border border-[#c5e7dd]">
                <CameraIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#126b59] tracking-tight">
                  Tạo tài khoản để lưu hồ sơ &amp; quét ảnh thật bằng AI
                </p>
                <p className="text-xs font-semibold text-[#0e3b33]/80 mt-0.5">
                  Đồng bộ hồ sơ trên mọi thiết bị, xem lại lịch sử quét, miễn phí.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2.5 sm:w-auto shrink-0">
              <Link
                to="/register"
                className="flex-1 rounded-full bg-[#2fa98c] hover:bg-[#126b59] px-6 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-white transition hover:scale-105 sm:flex-none"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="flex-1 rounded-full bg-white hover:bg-[#eaf7f1] border border-[#c5e7dd] px-6 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-[#126b59] transition hover:border-[#2fa98c] sm:flex-none"
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
