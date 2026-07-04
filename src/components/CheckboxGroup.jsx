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
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              checked
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-500/30'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
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
              className={`h-4 w-4 shrink-0 transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
            />
            <span>{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

export default CheckboxGroup
