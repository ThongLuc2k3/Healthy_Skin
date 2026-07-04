import { CheckCircleIcon } from './Icons'

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((option) => {
        const checked = value === option.id
        return (
          <label
            key={option.id}
            className={`relative flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-3.5 text-center text-sm font-medium transition-all ${
              checked
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-500/30'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={checked}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            {checked && <CheckCircleIcon className="h-4 w-4 shrink-0" />}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}

export default RadioGroup
