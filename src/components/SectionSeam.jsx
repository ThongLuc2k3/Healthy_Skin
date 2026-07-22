export function SectionSeam() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/40 blur-sm" />
    </div>
  )
}
