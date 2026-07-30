import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { SearchIcon, SparklesIcon, CameraIcon, ShieldIcon } from './Icons'
import { SectionTitle } from './ui'
import {
  FloatingCosmeticDecoration,
  LotionPumpBottle,
  PerfumeBottle,
  LipBalmStick,
} from '../CosmeticDecoration'

function CountUp({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref} className="tabular-nums">
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function RingMetric({ label, value, icon, color, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const R = 52
  const C = 2 * Math.PI * R
  const offset = inView ? C - (value / 100) * C : C

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center"
    >
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(44, 142, 146, 0.12)" strokeWidth="6" />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black text-[#17353D]">
            <CountUp to={value} />
          </span>
          <span className="text-[10px] font-bold text-[#64748B]">/ 100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[#17353D]">
        {icon}
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#17353D]">{label}</span>
      </div>
    </motion.div>
  )
}

const metrics = [
  { label: 'Skin Score', value: 87, icon: <ShieldIcon className="h-4 w-4 text-[#2C8E92]" />, color: '#2C8E92', delay: 0 },
  { label: 'Hydration', value: 82, icon: <SparklesIcon className="h-4 w-4 text-[#67D6E8]" />, color: '#67D6E8', delay: 0.12 },
  { label: 'Clarity', value: 90, icon: <SearchIcon className="h-4 w-4 text-[#6F9D8D]" />, color: '#6F9D8D', delay: 0.24 },
  { label: 'Texture', value: 91, icon: <CameraIcon className="h-4 w-4 text-[#2C8E92]" />, color: '#2C8E92', delay: 0.36 },
]

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] overflow-hidden">
      {/* Soft Ambient Light Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-[#67D6E8]/10 blur-3xl opacity-50" />
      </div>

      {/* Animated Floating Cosmetic Decorations */}
      <FloatingCosmeticDecoration
        Icon={LotionPumpBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-1/3 -translate-y-1/2 left-0 sm:left-2 xl:-left-20 opacity-85 lg:opacity-100"
        yRange={[-30, 25, -30]}
        duration={5.5}
        delay={0.2}
        accent="#2C8E92"
        parallaxOffset={75}
      />
      <FloatingCosmeticDecoration
        Icon={PerfumeBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-1/2 -translate-y-1/2 right-0 sm:right-2 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[25, -30, 25]}
        duration={5.2}
        delay={0.4}
        accent="#67D6E8"
        parallaxOffset={-70}
      />
      <FloatingCosmeticDecoration
        Icon={LipBalmStick}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="top-4 right-4 xl:right-12 opacity-80 lg:opacity-95"
        yRange={[0, -28, 0]}
        duration={4.8}
        delay={0.6}
        accent="#D8B27A"
        parallaxOffset={50}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <SectionTitle
          eyebrow="HOLOGRAPHIC DASHBOARD"
          title={
            <>
              Chỉ Số Sức Khỏe Da
              <br />
              &amp; Báo Cáo Thông Minh.
            </>
          }
          description="Mọi kết quả quét và hồ sơ cơ địa được kết xuất thành bảng điều khiển trực quan — điểm số, xu hướng và độ tin cậy thời gian thực."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16"
        >
          <div className="relative overflow-hidden rounded-[32px] bg-[#FCFDFC] p-8 sm:p-12 border border-[#E7ECEE] shadow-[0_16px_50px_rgba(44,142,146,0.06)]">
            <span className="absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-[#2C8E92]" />
            <span className="absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-[#2C8E92]" />
            <span className="absolute left-4 bottom-4 h-4 w-4 border-l-2 border-b-2 border-[#2C8E92]" />
            <span className="absolute right-4 bottom-4 h-4 w-4 border-r-2 border-b-2 border-[#2C8E92]" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7ECEE] pb-6">
              <div className="text-left">
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#2C8E92]">
                  patient_id · #SKN-2026-04417
                </div>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#17353D]">
                  Skin Intelligence Report
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full bg-[#6F9D8D]/15 px-4 py-2 text-xs font-bold text-[#2C8E92] border border-[#6F9D8D]/30">
                <span className="h-2 w-2 rounded-full bg-[#6F9D8D] animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#2C8E92]">
                  scan complete
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {metrics.map((m) => (
                <RingMetric key={m.label} {...m} />
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                { label: 'Hydration trend · 30d', bars: [60, 64, 58, 70, 66, 74, 78, 82], color: '#67D6E8' },
                { label: 'Clarity trend · 30d', bars: [72, 75, 71, 80, 84, 82, 88, 90], color: '#6F9D8D' },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl bg-[#F7FBFC] p-5 border border-[#E7ECEE] shadow-xs text-left">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#17353D]">
                    {row.label}
                  </div>
                  <div className="mt-4 flex h-24 items-end gap-2">
                    {row.bars.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${b}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                        className="flex-1 rounded-t-md"
                        style={{ background: `linear-gradient(to top, ${row.color}33, ${row.color})` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


