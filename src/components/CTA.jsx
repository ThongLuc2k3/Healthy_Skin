import { Link } from 'react-router-dom'
import { ArrowLeftIcon, SearchIcon, ShieldIcon } from './Icons'
import { Reveal } from './ui'

export default function CTA() {
  return (
    <section id="cta" className="relative py-28 sm:py-36 overflow-hidden noise bg-[#02040b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#0a1a2e_0%,#050b18_55%,#02040b_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[55vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[130px] animate-pulseGlow" />
      <div className="absolute inset-0 grid-bg opacity-20 mask-fade-b" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow border border-cyan-400/20">
            <SearchIcon className="h-3.5 w-3.5 text-cyan-300" />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-200 font-semibold">
              BẮT ĐẦU VỚI DA DƯỠNG
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gradient-cyan text-shadow-glow">
            Đúng da, đúng dưỡng chất.
            <br />
            Từ trong ra ngoài.
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-slate-300/90 leading-relaxed font-medium">
            Chỉ cần khai báo loại da, dị ứng và mục tiêu một lần để nhận ngay gợi ý sản phẩm mỹ phẩm &amp; thực phẩm phù hợp với chính cơ địa của bạn.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/profile"
              className="group inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-8 py-4 text-sm font-bold text-slate-950 shadow-glow-lg transition-all hover:bg-cyan-300 hover:scale-[1.03]"
            >
              Bắt đầu khai báo hồ sơ
              <ArrowLeftIcon className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-xl glass border border-cyan-400/25 px-8 py-4 text-sm font-semibold text-white transition-all hover:border-cyan-400/60 hover:shadow-glow"
            >
              Thử quét sản phẩm
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-emerald-400" />
              Minh bạch lý do phân loại
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-emerald-400" />
              Lưu trữ hồ sơ cá nhân bảo mật
            </span>
          </div>
          <p className="mt-6 text-xs text-slate-400/80 max-w-2xl mx-auto">
            Gợi ý theo hồ sơ dựa trên quy tắc (rule-based), minh bạch lý do. Quét ảnh thật (AI) là tính năng bổ sung dành cho tài khoản đã đăng nhập.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
