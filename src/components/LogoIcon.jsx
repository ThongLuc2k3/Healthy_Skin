export default function LogoIcon({ compact = false, className = '' }) {
  return <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="TLUCS">
    <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#183153" />
      <path d="M11 35V23C11 14.7 16.8 9 24 9s13 5.7 13 14v12" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M17 20h14M24 20v15" fill="none" stroke="#B8F34A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="11" cy="36" r="3.5" fill="#B8F34A"/><circle cx="37" cy="36" r="3.5" fill="#B8F34A"/>
      <path d="M14.5 36h19" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
    </svg>
    {!compact && <span><span className="block text-[22px] font-black leading-none tracking-[-.04em] text-[#183153]">TLUCS</span><span className="mt-1 hidden text-[7px] font-bold uppercase tracking-[.13em] text-slate-400 sm:block">University Community</span></span>}
  </span>
}
