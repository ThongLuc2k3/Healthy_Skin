import { PlayIcon, SparklesIcon } from '../components/Icons'
import { MOTIVATION_CATEGORIES } from '../data/motivationContent'

const THEME = {
  emerald: { badge: 'bg-emerald-50 text-emerald-700', thumb: 'from-emerald-400 to-teal-500' },
  amber: { badge: 'bg-amber-50 text-amber-700', thumb: 'from-amber-400 to-orange-500' },
  teal: { badge: 'bg-teal-50 text-teal-700', thumb: 'from-teal-400 to-cyan-500' },
}

function MotivationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <SparklesIcon className="h-3.5 w-3.5" />
          Khung demo
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Góc truyền động lực
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Video &amp; nội dung ngắn về chăm sóc da, dinh dưỡng và giảm cân lành mạnh — giúp bạn duy trì
          động lực bên cạnh hồ sơ cơ địa cá nhân. Đây là khung demo, nội dung thật sẽ được đội ngũ biên
          tập/tuyển chọn sau.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {MOTIVATION_CATEGORIES.map((category) => {
          const theme = THEME[category.color]
          return (
            <section key={category.id}>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.badge}`}>
                  {category.label}
                </span>
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div
                      className={`flex h-32 items-center justify-center bg-gradient-to-br ${theme.thumb}`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition group-hover:bg-white/40">
                        <PlayIcon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        Bấm vào thẻ để mở kết quả tìm kiếm liên quan trên YouTube (trang demo chưa gắn video cố định).
      </p>
    </div>
  )
}

export default MotivationPage
