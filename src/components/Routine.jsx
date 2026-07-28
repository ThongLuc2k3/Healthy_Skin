import { CheckCircleIcon, WarningIcon, XCircleIcon } from './Icons'
import { SectionTitle, Reveal } from './ui'
import RoutineTimelineSection from './RoutineTimelineSection'
import {
  FloatingCosmeticDecoration,
  AlcoholFreeBadge,
  CosmeticSet,
  SheetMaskPacket,
  BeautySponge,
} from '../CosmeticDecoration'

const LEGEND = [
  {
    title: 'Phù hợp',
    desc: 'Sản phẩm/thực phẩm tương thích hoàn toàn với loại da, dị ứng và bệnh lý nền của bạn.',
    icon: <CheckCircleIcon className="h-6 w-6 text-[#10B981]" />,
    badge: 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]',
  },
  {
    title: 'Cần cân nhắc',
    desc: 'Có thành phần cần chú ý liều lượng hoặc thói quen sử dụng đối với cơ địa của bạn.',
    icon: <WarningIcon className="h-6 w-6 text-[#F59E0B]" />,
    badge: 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D97706]',
  },
  {
    title: 'Nên tránh',
    desc: 'Chứa chất gây kích ứng da hoặc dị ứng/bệnh lý nền được khai báo trong hồ sơ của bạn.',
    icon: <XCircleIcon className="h-6 w-6 text-[#EF4444]" />,
    badge: 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#DC2626]',
  },
]

export default function Routine() {
  return (
    <section id="routine" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] overflow-hidden">
      {/* Animated Floating Cosmetic Decorations to fill empty space */}
      <FloatingCosmeticDecoration
        Icon={AlcoholFreeBadge}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="top-4 left-2 sm:left-4 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, -28, 0]}
        duration={5.2}
        delay={0.2}
        accent="#22c55e"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={CosmeticSet}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 right-2 sm:right-4 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.6}
        delay={0.4}
        accent="#eab308"
        parallaxOffset={-65}
      />
      <FloatingCosmeticDecoration
        Icon={BeautySponge}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="bottom-8 left-2 sm:left-4 xl:-left-12 opacity-80 lg:opacity-95"
        yRange={[-24, 24, -24]}
        duration={5.0}
        delay={0.6}
        accent="#fb7185"
        parallaxOffset={-50}
      />
      <FloatingCosmeticDecoration
        Icon={SheetMaskPacket}
        size="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72"
        className="bottom-8 right-2 sm:right-4 xl:-right-16 opacity-80 lg:opacity-95"
        yRange={[0, 30, 0]}
        duration={5.8}
        delay={0.8}
        accent="#d946ef"
        parallaxOffset={65}
      />
      <div className="relative mx-auto max-w-7xl px-6  text-[#0f826b]">
        <SectionTitle
          title={
            <>
              Lộ Trình Chăm Sóc Da,
              <br />
              Phân Loại Minh Bạch.  
            </>
          }
          description="Mọi gợi ý sản phẩm và thực phẩm đều được xếp nhóm minh bạch kèm lý do chi tiết từ AI."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {LEGEND.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="group relative rounded-3xl glass p-7 border border-white/80 shadow-glass transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.badge}`}>
                    {item.icon}
                  </span>
                  <span className={`rounded-full px-3.5 py-1 text-xs font-black border ${item.badge}`}>
                    {item.title}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-extrabold text-[#0F4C5C]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0F4C5C]/80 font-medium">
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

