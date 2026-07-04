import ResultAccordionItem from './ResultAccordionItem'

const THEME = {
  green: {
    wrap: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  yellow: {
    wrap: 'border-amber-200 bg-amber-50/70 text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
  },
  red: {
    wrap: 'border-red-200 bg-red-50/70 text-red-900',
    badge: 'bg-red-100 text-red-700',
  },
}

function ResultGroup({ title, resultValue, color, icon, items }) {
  const theme = THEME[color]

  return (
    <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${theme.wrap}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.badge}`}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${theme.badge}`}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm opacity-60">Không có mục nào trong nhóm này.</p>
      ) : (
        <ul className="mt-2">
          {items.map((item) => (
            <ResultAccordionItem key={item.id} item={item} result={resultValue} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ResultGroup
