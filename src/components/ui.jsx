import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 40, className = '', once = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass border border-cyan-400/20 shadow-glow">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulseGlow shadow-glow" />
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-200">
        {children}
      </span>
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description, align = 'center' }) {
  return (
    <div
      className={
        align === 'center'
          ? 'flex flex-col items-center text-center mx-auto max-w-3xl'
          : 'flex flex-col items-start text-left max-w-2xl'
      }
    >
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gradient-cyan text-shadow-glow">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}

export function GlassPanel({ children, className = '', strong = false }) {
  return (
    <div className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function Corners({ color = '#22d3ee' }) {
  const base = 'absolute h-3 w-3'
  return (
    <>
      <span className={`${base} top-0 left-0 border-l border-t`} style={{ borderColor: color }} />
      <span className={`${base} top-0 right-0 border-r border-t`} style={{ borderColor: color }} />
      <span className={`${base} bottom-0 left-0 border-l border-b`} style={{ borderColor: color }} />
      <span className={`${base} bottom-0 right-0 border-r border-b`} style={{ borderColor: color }} />
    </>
  )
}
