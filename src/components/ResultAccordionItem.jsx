import { useState } from 'react'
import { ChevronDownIcon } from './Icons'
import ExplainButton from './ExplainButton'

function ResultAccordionItem({ item, result }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="border-b border-black/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-opacity hover:opacity-70"
      >
        <span className="text-sm font-medium">{item.name_vi}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? 'grid-rows-[1fr] pb-3 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed opacity-80">{item.reason}</p>
          {open && (
            <ExplainButton
              nameVi={item.name_vi}
              category={item.category}
              result={result}
              reason={item.reason}
            />
          )}
        </div>
      </div>
    </li>
  )
}

export default ResultAccordionItem
