const palette = [
  { bg: '#E9EEFF', text: '#2D5BFF' },
  { bg: '#FFE9F0', text: '#E23670' },
  { bg: '#E8FBF0', text: '#0F9D58' },
  { bg: '#FFF4E0', text: '#B7791F' },
  { bg: '#F1E9FF', text: '#7C3AED' },
]

function colorFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export default function Avatar({ name, className = 'h-10 w-10 rounded-full text-sm' }) {
  const label = (name || '').trim()
  const initials = label.slice(0, 2).toUpperCase() || '?'
  const { bg, text } = colorFor(label || '?')
  return <span style={{ background: bg, color: text }} title={label || undefined} className={`flex shrink-0 items-center justify-center font-black ${className}`}>{initials}</span>
}
