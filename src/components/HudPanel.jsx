import { motion } from 'framer-motion'

export default function HudPanel({
  label,
  value,
  unit,
  icon,
  title,
  description,
  className = '',
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-20 ${className}`}
    >
      <div className="relative glass-strong rounded-2xl p-4 border border-[#c5e7dd] shadow-glow">
        {/* Corner Brackets */}
        <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-[#2fa98c]/70" />
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-[#2fa98c]/70" />
        <span className="absolute left-1.5 bottom-1.5 h-2.5 w-2.5 border-l border-b border-[#2fa98c]/70" />
        <span className="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r border-b border-[#2fa98c]/70" />

        {title ? (
          <div className="text-left space-y-1.5">
            <h3 className="text-sm font-bold text-gradient-logo leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs leading-relaxed text-[#0e3b33]/70">
                {description}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[#126b59]">
              {icon}
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0e3b33]/60 font-medium">
                {label}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-[#0e3b33] tabular-nums">
                {value}
              </span>
              {unit && <span className="text-xs font-semibold text-[#126b59]/80">{unit}</span>}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#c5e7dd]/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1.4, delay: delay + 0.4, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#126b59] to-[#2fa98c]"
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
