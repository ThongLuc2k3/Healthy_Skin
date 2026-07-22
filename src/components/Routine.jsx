import { CheckCircleIcon, WarningIcon, XCircleIcon } from './Icons'
import { SectionTitle, Reveal } from './ui'
import RoutineTimelineSection from './RoutineTimelineSection'

const LEGEND = [
  {
    title: 'Phù hợp',
    desc: 'Sản phẩm/thực phẩm tương thích hoàn toàn với loại da, dị ứng và bệnh lý nền của bạn.',
    icon: <CheckCircleIcon className="h-6 w-6 text-emerald-400" />,
    badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  },
  {
    title: 'Cần cân nhắc',
    desc: 'Có thành phần cần chú ý liều lượng hoặc thói quen sử dụng đối với cơ địa của bạn.',
    icon: <WarningIcon className="h-6 w-6 text-amber-400" />,
    badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  },
  {
    title: 'Nên tránh',
    desc: 'Chứa chất gây kích ứng da hoặc dị ứng/bệnh lý nền được khai báo trong hồ sơ của bạn.',
    icon: <XCircleIcon className="h-6 w-6 text-rose-400" />,
    badge: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
  },
]

export default function Routine() {
  return (
    <section id="routine" className="relative py-28 sm:py-36 overflow-hidden noise bg-[#02040b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#0a1a2e_0%,#050b18_55%,#02040b_100%)]" />
      <div className="absolute inset-0 grid-bg opacity-25" />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="QUY TRÌNH &amp; PHÂN LOẠI"
          title={
            <>
              Lộ Trình Chăm Sóc Da,
              <br />
              Phân Loại Minh Bạch.
            </>
          }
          description="Mọi gợi ý sản phẩm và thực phẩm đều được xếp nhóm minh bạch kèm lý do chi tiết từ AI."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {LEGEND.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="group relative rounded-3xl glass-strong p-7 border border-cyan-400/20 shadow-glow transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.badge}`}>
                    {item.icon}
                  </span>
                  <span className={`rounded-full px-3.5 py-1 text-xs font-semibold border ${item.badge}`}>
                    {item.title}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <RoutineTimelineSection />
      </div>
    </section>
  )
}
