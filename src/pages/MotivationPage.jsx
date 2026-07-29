import { PlayIcon, SparklesIcon } from '../components/Icons'
import { MOTIVATION_CATEGORIES } from '../data/motivationContent'

const THEME = {
  emerald: { badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', thumb: 'from-emerald-600/40 to-teal-600/40' },
  amber: { badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', thumb: 'from-amber-600/40 to-orange-600/40' },
  teal: { badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/40', thumb: 'from-teal-600/40 to-cyan-600/40' },
}

function MotivationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
          <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
          <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
            Khung demo
          </span>
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
          Góc truyền động lực
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-300/90 leading-relaxed">
          Video &amp; nội dung ngắn về chăm sóc da, dinh dưỡng và giảm cân lành mạnh — giúp bạn duy trì
          động lực bên cạnh hồ sơ cơ địa cá nhân. Đây là khung demo, nội dung thật sẽ được đội ngũ biên
          tập/tuyển chọn sau.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {MOTIVATION_CATEGORIES.map((category) => {
          const theme = THEME[category.color]
          return (
            <section key={category.id}>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <span className={`rounded-full px-3.5 py-1 text-xs font-semibold ${theme.badge}`}>
                  {category.label}
                </span>
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {category.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-3xl glass-strong border border-cyan-400/20 shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50"
                  >
                    <div
                      className={`flex h-36 items-center justify-center bg-gradient-to-br ${theme.thumb} border-b border-cyan-400/15`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-950 shadow-glow">
                        <PlayIcon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold text-gradient-cyan">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300/80">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        Bấm vào thẻ để mở kết quả tìm kiếm liên quan trên YouTube (trang demo chưa gắn video cố định).
      </p>
    </div>
  )
}

export default MotivationPage
