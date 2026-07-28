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
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(15, 76, 92, 0.12)" strokeWidth="6" />
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
          <span className="font-display text-2xl font-black text-[#082531]">
            <CountUp to={value} />
          </span>
          <span className="text-[10px] font-black text-[#082531]">/ 100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[#082531]">
        {icon}
        <span className="text-xs font-black uppercase tracking-wider text-[#082531]">{label}</span>
      </div>
    </motion.div>
  )
}

const metrics = [
  { label: 'Skin Score', value: 87, icon: <ShieldIcon className="h-4 w-4 text-[#0F4C5C]" />, color: '#0F4C5C', delay: 0 },
  { label: 'Hydration', value: 82, icon: <SparklesIcon className="h-4 w-4 text-[#00b4d8]" />, color: '#00b4d8', delay: 0.12 },
  { label: 'Clarity', value: 90, icon: <SearchIcon className="h-4 w-4 text-[#10B981]" />, color: '#10B981', delay: 0.24 },
  { label: 'Texture', value: 91, icon: <CameraIcon className="h-4 w-4 text-[#0F4C5C]" />, color: '#0F4C5C', delay: 0.36 },
]

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] overflow-hidden">
      {/* Animated Floating Cosmetic Decorations to fill empty space */}
      <FloatingCosmeticDecoration
        Icon={LotionPumpBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-1/3 -translate-y-1/2 left-0 sm:left-2 xl:-left-20 opacity-85 lg:opacity-100"
        yRange={[-30, 25, -30]}
        duration={5.5}
        delay={0.2}
        accent="#0ea5e9"
        parallaxOffset={75}
      />
      <FloatingCosmeticDecoration
        Icon={PerfumeBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-1/2 -translate-y-1/2 right-0 sm:right-2 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[25, -30, 25]}
        duration={5.2}
        delay={0.4}
        accent="#fb7185"
        parallaxOffset={-70}
      />
      <FloatingCosmeticDecoration
        Icon={LipBalmStick}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="top-4 right-4 xl:right-12 opacity-80 lg:opacity-95"
        yRange={[0, -28, 0]}
        duration={4.8}
        delay={0.6}
        accent="#facc15"
        parallaxOffset={50}
      />
      <div className="relative mx-auto max-w-7xl px-6 text-[#0f826b]">
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
          className="mt-14"
        >
          <div className="relative overflow-hidden rounded-3xl glass p-8 sm:p-10 border border-white/90 shadow-md">
            <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#00b4d8]" />
            <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#00b4d8]" />
            <span className="absolute left-3 bottom-3 h-4 w-4 border-l-2 border-b-2 border-[#00b4d8]" />
            <span className="absolute right-3 bottom-3 h-4 w-4 border-r-2 border-b-2 border-[#00b4d8]" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#082531]">
                  patient_id · #SKN-2026-04417
                </div>
                <h3 className="mt-1 font-display text-2xl font-black text-[#082531]">
                  Skin Intelligence Report
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full bg-[#10B981]/15 px-3.5 py-1.5 text-xs text-[#10B981] font-mono border border-[#10B981]/30">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-[#10B981]">
                  scan complete
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {metrics.map((m) => (
                <RingMetric key={m.label} {...m} />
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Hydration trend · 30d', bars: [60, 64, 58, 70, 66, 74, 78, 82], color: '#00b4d8' },
                { label: 'Clarity trend · 30d', bars: [72, 75, 71, 80, 84, 82, 88, 90], color: '#10b981' },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl bg-white/80 p-4 border border-white shadow-sm">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider text-[#082531]">
                    {row.label}
                  </div>
                  <div className="mt-3 flex h-20 items-end gap-1.5">
                    {row.bars.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${b}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                        className="flex-1 rounded-t-sm"
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


