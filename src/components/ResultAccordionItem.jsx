import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from './Icons'
import ExplainButton from './ExplainButton'

function ResultAccordionItem({ item, result }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="list-none"
    >
      <div
        className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
          open
            ? 'border-[#2C8E92] bg-white shadow-md ring-1 ring-[#67D6E8]/30'
            : 'border-[#E8EEF0] bg-white hover:border-[#2C8E92]/50 hover:shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer"
        >
          <span className="font-display text-base font-bold text-[#17353D] group-hover:text-[#2C8E92] transition-colors">
            {item.name_vi}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7FBFC] border border-[#E8EEF0] text-[#17353D] group-hover:bg-[#67D6E8]/15 group-hover:text-[#2C8E92] transition-all">
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-300 ${
                open ? 'rotate-180 text-[#2C8E92]' : ''
              }`}
            />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#E8EEF0] bg-[#F7FBFC]/70 p-4 sm:p-5 text-[#17353D] space-y-4">
                <div className="rounded-xl bg-white p-4 border border-[#E8EEF0] shadow-xs">
                  <p className="text-xs font-bold text-[#2C8E92] uppercase tracking-wider mb-1">
                    Phân tích từ AI Dermatologist
                  </p>
                  <p className="text-sm leading-relaxed text-[#17353D] font-normal">
                    {item.reason}
                  </p>
                </div>

                <ExplainButton
                  nameVi={item.name_vi}
                  category={item.category}
                  result={result}
                  reason={item.reason}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}

export default ResultAccordionItem
