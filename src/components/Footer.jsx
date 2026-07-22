import { Link } from 'react-router-dom'

const cols = [
  {
    title: 'Nền tảng',
    links: [
      { label: 'Hồ sơ cơ địa', to: '/profile' },
      { label: 'Gợi ý cá nhân hóa', to: '/results' },
      { label: 'Quét ảnh thật AI', to: '/scan' },
      { label: 'Lộ trình cải thiện', to: '/roadmap' },
    ],
  },
  {
    title: 'Hệ sinh thái',
    links: [
      { label: 'Skin Lab', to: '/skin-lab' },
      { label: 'Góc truyền động lực', to: '/motivation' },
      { label: 'Chuyên gia tư vấn', to: '/experts' },
      { label: 'Điểm danh hằng ngày', to: '/checkin' },
    ],
  },
  {
    title: 'Công nghệ',
    links: [
      { label: 'Rule-Based Engine', to: '#technology' },
      { label: 'Computer Vision', to: '#technology' },
      { label: 'Vision Transformers', to: '#technology' },
      { label: 'Neural Match Engine', to: '#technology' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-400/10 bg-slate-950 noise text-left">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl glass border border-cyan-400/30 overflow-hidden p-1">
                <img
                  src="/logo.png"
                  alt="DA DƯỠNG AI Logo"
                  className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                />
              </span>
              <span className="font-display text-base font-bold text-white">
                DA DƯỠNG<span className="text-cyan-300"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Đúng da, đúng dưỡng chất — từ trong ra ngoài. Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên hồ sơ cơ địa duy nhất.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1.5 border border-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseGlow" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                hệ thống đang hoạt động
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  {c.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8">
          <p className="text-xs text-slate-500">
            © 2026 DA DƯỠNG AI. Cá nhân hóa chăm sóc da &amp; dinh dưỡng.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Xây dựng trên React · Three.js · GSAP · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
