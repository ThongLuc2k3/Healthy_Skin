import { CheckCircleIcon, WarningIcon, XCircleIcon } from './Icons'
import { RESULT } from '../logic/matchEngine'
import ExplainButton from './ExplainButton'

const THEME = {
  [RESULT.SUITABLE]: {
    wrap: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircleIcon,
  },
  [RESULT.CAUTION]: {
    wrap: 'border-amber-200 bg-amber-50/70 text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
    icon: WarningIcon,
  },
  [RESULT.AVOID]: {
    wrap: 'border-red-200 bg-red-50/70 text-red-900',
    badge: 'bg-red-100 text-red-700',
    icon: XCircleIcon,
  },
}

function ResultCard({ item, result, reason }) {
  const theme = THEME[result]
  const Icon = theme.icon

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${theme.wrap}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.badge}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
          {result}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold">{item.name_vi}</h3>
      <p className="mt-2 text-sm leading-relaxed opacity-80">{reason}</p>
      <ExplainButton nameVi={item.name_vi} category={item.category} result={result} reason={reason} />
    </div>
  )
}

export default ResultCard
