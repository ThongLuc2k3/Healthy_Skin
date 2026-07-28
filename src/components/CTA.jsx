import { Link } from 'react-router-dom'
import { ArrowLeftIcon, SearchIcon, ShieldIcon } from './Icons'
import { Reveal } from './ui'
import {
  FloatingCosmeticDecoration,
  CreamJar,
  SerumDropper,
  PerfumeBottle,
  SunscreenTube,
} from '../CosmeticDecoration'

export default function CTA() {
  return (
    <section id="cta" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] overflow-hidden">
      {/* Animated Floating Cosmetic Decorations to fill empty space */}
      <FloatingCosmeticDecoration
        Icon={CreamJar}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 left-1 sm:left-6 xl:left-12 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.0}
        delay={0.2}
        accent="#38bdf8"
        parallaxOffset={-70}
      />
      <FloatingCosmeticDecoration
        Icon={SerumDropper}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="bottom-4 left-2 sm:left-10 xl:left-20 opacity-80 lg:opacity-95"
        yRange={[22, -22, 22]}
        duration={4.6}
        delay={0.4}
        accent="#14b8a6"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={PerfumeBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 right-1 sm:right-6 xl:right-12 opacity-85 lg:opacity-100"
        yRange={[28, -28, 28]}
        duration={5.4}
        delay={0.3}
        accent="#fb7185"
        parallaxOffset={70}
      />
      <FloatingCosmeticDecoration
        Icon={SunscreenTube}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="bottom-4 right-2 sm:right-10 xl:right-20 opacity-80 lg:opacity-95"
        yRange={[-24, 24, -24]}
        duration={4.8}
        delay={0.5}
        accent="#f59e0b"
        parallaxOffset={-60}
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center">

        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#16715d]">
            Đúng da, đúng dưỡng chất.
            <br />
            Từ trong ra ngoài.
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-[#0F4C5C]/80 leading-relaxed font-medium">
            Chỉ cần khai báo loại da, dị ứng và mục tiêu một lần để nhận ngay gợi ý sản phẩm mỹ phẩm &amp; thực phẩm phù hợp với chính cơ địa của bạn.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/profile"
              className="group inline-flex items-center gap-2 rounded-full bg-[#0f6552] px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-teal-btn transition-all hover:bg-[#135c70] hover:scale-[1.03]"
            >
              Bắt đầu khai báo hồ sơ
              <ArrowLeftIcon className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-full glass border border-white px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0F4C5C] transition-all hover:bg-white/80"
            >
              Thử quét sản phẩm
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold text-[#0F4C5C]/80">
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-[#10B981]" />
              Minh bạch lý do phân loại
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-[#10B981]" />
              Lưu trữ hồ sơ cá nhân bảo mật
            </span>
          </div>
          <p className="mt-6 text-xs text-[#0F4C5C]/70 max-w-2xl mx-auto font-medium">
            Gợi ý theo hồ sơ dựa trên quy tắc (rule-based), minh bạch lý do. Quét ảnh thật (AI) là tính năng bổ sung dành cho tài khoản đã đăng nhập.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

