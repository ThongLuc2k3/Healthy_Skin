import { CheckCircleIcon } from './Icons'

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((option) => {
        const checked = value === option.id
        return (
          <label
            key={option.id}
            className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-center text-sm font-medium transition-all ${
              checked
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-glow ring-1 ring-cyan-400'
                : 'border-cyan-400/20 glass text-slate-300 hover:border-cyan-400/50 hover:bg-slate-800/60 hover:text-white'
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
            {checked && <CheckCircleIcon className="h-4 w-4 shrink-0 text-cyan-300" />}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}

export default RadioGroup
