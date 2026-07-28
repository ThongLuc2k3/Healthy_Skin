import ResultAccordionItem from './ResultAccordionItem'

const THEME = {
  green: {
    wrap: 'border-emerald-500/30 glass text-[#183B3B] shadow-glow',
    badge: 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40',
  },
  yellow: {
    wrap: 'border-amber-500/30 glass text-[#183B3B] shadow-glow',
    badge: 'bg-amber-500/20 text-amber-800 border border-amber-500/40',
  },
  red: {
    wrap: 'border-rose-500/30 glass text-[#183B3B] shadow-glow',
    badge: 'bg-rose-500/20 text-rose-800 border border-rose-500/40',
  },
}

function ResultGroup({ title, resultValue, color, icon, items }) {
  const theme = THEME[color]

  return (
    <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${theme.wrap}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.badge}`}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-[#183B3B]">{title}</h3>
        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.badge}`}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[#183B3B]/70">Không có mục nào trong nhóm này.</p>
      ) : (
        <ul className="mt-3 divide-y divide-cyan-400/10 text-[#183B3B]">
          {items.map((item) => (
            <ResultAccordionItem key={item.id} item={item} result={resultValue} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ResultGroup
