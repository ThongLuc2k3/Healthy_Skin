import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function DetailModal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-5 border-b px-6 py-5 md:px-8">
        <h2 id="detail-modal-title" className="text-2xl font-black leading-tight text-slate-900">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"><X size={20}/></button>
      </header>
      <div className="overflow-y-auto px-6 py-6 md:px-8">{children}</div>
      {footer&&<footer className="border-t bg-white px-6 py-4 md:px-8">{footer}</footer>}
    </section>
  </div>
}
