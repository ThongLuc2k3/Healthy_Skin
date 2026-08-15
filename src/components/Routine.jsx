import { CheckCircleIcon, WarningIcon } from './Icons'
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
    desc: 'Sản phẩm/thực phẩm tương thích tốt với loại da, dị ứng và bệnh lý nền của bạn.',
    icon: <CheckCircleIcon className="h-6 w-6 text-[#6F9D8D]" />,
    badge: 'bg-[#6F9D8D]/15 border-[#6F9D8D]/30 text-[#2C8E92]',
  },
  {
    title: 'Cần cân nhắc',
    desc: 'Có thành phần cần chú ý, nếu là bạn thì nên tìm hiểu thêm hoặc hỏi chuyên gia trước khi dùng.',
    icon: <WarningIcon className="h-6 w-6 text-[#D8B27A]" />,
    badge: 'bg-[#D8B27A]/15 border-[#D8B27A]/30 text-[#A87A45]',
  },
]

export default function Routine() {
  return (
    <section id="routine" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#F7FBFC] via-[#F0F6F8] to-[#F7FBFC] overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[#BFD8CF]/15 blur-3xl opacity-50" />
      </div>

      {/* Animated Floating Cosmetic Decorations */}
      <FloatingCosmeticDecoration
        Icon={AlcoholFreeBadge}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="top-4 left-2 sm:left-4 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, -28, 0]}
        duration={5.2}
        delay={0.2}
        accent="#6F9D8D"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={CosmeticSet}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 right-2 sm:right-4 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.6}
        delay={0.4}
        accent="#D8B27A"
        parallaxOffset={-65}
      />
      <FloatingCosmeticDecoration
        Icon={BeautySponge}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="bottom-8 left-2 sm:left-4 xl:-left-12 opacity-80 lg:opacity-95"
        yRange={[-24, 24, -24]}
        duration={5.0}
        delay={0.6}
        accent="#BFD8CF"
        parallaxOffset={-50}
      />
      <FloatingCosmeticDecoration
        Icon={SheetMaskPacket}
        size="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72"
        className="bottom-8 right-2 sm:right-4 xl:-right-16 opacity-80 lg:opacity-95"
        yRange={[0, 30, 0]}
        duration={5.8}
        delay={0.8}
        accent="#67D6E8"
        parallaxOffset={65}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto text-left">
          {LEGEND.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="group relative rounded-[28px] bg-[#FCFDFC] p-8 border border-[#E7ECEE] shadow-[0_10px_30px_rgba(44,142,146,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2C8E92]">
                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.badge}`}>
                    {item.icon}
                  </span>
                  <span className={`rounded-full px-3.5 py-1 text-xs font-bold border ${item.badge}`}>
                    {item.title}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-extrabold text-[#17353D]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B] font-normal">
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

