import { CheckCircleIcon } from './Icons'

function CheckboxGroup({ name, options, values, onChange }) {
  function toggle(id) {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id))
    } else {
      onChange([...values, id])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const checked = values.includes(option.id)
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              checked
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-glow ring-1 ring-cyan-400'
                : 'border-cyan-400/20 glass text-slate-300 hover:border-cyan-400/50 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option.id}
              checked={checked}
              onChange={() => toggle(option.id)}
              className="sr-only"
            />
            <CheckCircleIcon
              className={`h-4 w-4 shrink-0 text-cyan-300 transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
            />
            <span>{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

export default CheckboxGroup
