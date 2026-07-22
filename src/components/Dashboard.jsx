import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { SearchIcon, SparklesIcon, CameraIcon, ShieldIcon } from './Icons'
import { SectionTitle } from './ui'

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
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
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
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-white">
            <CountUp to={value} />
          </span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-cyan-300">
        {icon}
        <span className="text-sm text-slate-300">{label}</span>
      </div>
    </motion.div>
  )
}

const metrics = [
  { label: 'Skin Score', value: 87, icon: <ShieldIcon className="h-4 w-4" />, color: '#22d3ee', delay: 0 },
  { label: 'Hydration', value: 82, icon: <SparklesIcon className="h-4 w-4" />, color: '#60a5fa', delay: 0.12 },
  { label: 'Clarity', value: 90, icon: <SearchIcon className="h-4 w-4" />, color: '#34d399', delay: 0.24 },
  { label: 'Texture', value: 91, icon: <CameraIcon className="h-4 w-4" />, color: '#67e8f9', delay: 0.36 },
]

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-28 sm:py-36 overflow-hidden noise bg-[#02040b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#0a1a2e_0%,#050b18_55%,#02040b_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[50vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
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
          initial={{ opacity: 0, y: 60, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="perspective-1000 mt-16"
        >
          <div className="relative preserve-3d overflow-hidden rounded-3xl glass-strong border border-cyan-400/25 p-8 sm:p-12 shadow-glow-lg">
            <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-cyan-400/50" />
            <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-cyan-400/50" />
            <span className="absolute left-3 bottom-3 h-4 w-4 border-l-2 border-b-2 border-cyan-400/50" />
            <span className="absolute right-3 bottom-3 h-4 w-4 border-r-2 border-b-2 border-cyan-400/50" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300">
                  patient_id · #SKN-2026-04417
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                  Skin Intelligence Report
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full glass border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-300 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-300">
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
                { label: 'Hydration trend · 30d', bars: [60, 64, 58, 70, 66, 74, 78, 82], color: '#60a5fa' },
                { label: 'Clarity trend · 30d', bars: [72, 75, 71, 80, 84, 82, 88, 90], color: '#34d399' },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl glass p-4 border border-cyan-400/15">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
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
                        style={{ background: `linear-gradient(to top, ${row.color}22, ${row.color})`, boxShadow: `0 0 12px -2px ${row.color}66` }}
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
