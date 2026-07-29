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
    <footer className="relative border-t border-white/80 bg-white/50 backdrop-blur-xl text-left">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center h-5">
              <img
                src="/logo1.png"
                alt="DA DƯỠNG AI Logo"
                className="h-30 w-auto object-contain"
              />
              <span className="font-display text-lg font-black text-[#0F4C5C]">
                DA DƯỠNG<span className="text-[#00B4D8]"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#0F4C5C]/80 font-medium">
              Đúng da, đúng dưỡng chất — từ trong ra ngoài. Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên hồ sơ cơ địa duy nhất.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full glass border border-white px-3.5 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0F4C5C]">
                Hệ thống đang hoạt động
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#0F4C5C]">
                  {c.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm font-semibold text-[#0F4C5C]/75 hover:text-[#0F4C5C] transition-colors"
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

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#0F4C5C]/10 pt-8">
          <p className="text-xs font-bold text-[#0F4C5C]/80">
            © 2026 DA DƯỠNG AI. Cá nhân hóa chăm sóc da &amp; dinh dưỡng.
          </p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F4C5C]/70">
            POWERED BY SKIN AI ENGINE
          </p>
        </div>
      </div>
    </footer>
  )
}

