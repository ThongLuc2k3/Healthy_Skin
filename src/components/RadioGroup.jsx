import { motion } from 'framer-motion'

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {options.map((option) => {
        const checked = value === option.id
        return (
          <motion.label
            key={option.id}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
              checked
                ? 'border-[#2C8E92] bg-gradient-to-r from-[#67D6E8]/12 via-[#67D6E8]/8 to-[#2C8E92]/6 text-[#17353D] shadow-[0_8px_20px_rgba(44,142,146,0.12)] ring-1 ring-[#2C8E92]/40'
                : 'border-[#E9EEF1] bg-[#FDFDFB] text-[#17353D] shadow-[0_2px_8px_rgba(23,53,61,0.03)] hover:border-[#67D6E8]/60 hover:bg-white hover:shadow-[0_6px_16px_rgba(23,53,61,0.06)]'
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
            <span className="text-base font-semibold tracking-tight text-[#17353D]">
              {option.label}
            </span>
            <span
              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                checked
                  ? 'border-[#2C8E92] bg-[#2C8E92] shadow-[0_0_8px_rgba(103,214,232,0.5)]'
                  : 'border-[#BFD8CF] bg-transparent'
              }`}
            >
              {checked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="h-1.5 w-1.5 rounded-full bg-[#FDFDFB]"
                />
              )}
            </span>
          </motion.label>
        )
      })}
    </div>
  )
}

export default RadioGroup
