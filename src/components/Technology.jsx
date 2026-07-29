import { ShieldIcon, SearchIcon, SparklesIcon, CameraIcon } from './Icons'
import { SectionTitle, Reveal } from './ui'
import NeuralNetCanvas from './NeuralNetCanvas'
import {
  FloatingCosmeticDecoration,
  SkinAnalysisIcon,
  FaceMistBottle,
  MoisturizerTube,
} from '../CosmeticDecoration'

const tech = [
  {
    name: 'Quy Tắc Rule-Based Engine',
    icon: <ShieldIcon className="h-5 w-5" />,
    desc: 'Phân tích đối chiếu loại da, dị ứng thực phẩm và bệnh lý nền để đưa ra gợi ý minh bạch lý do.',
  },
  {
    name: 'Computer Vision AI',
    icon: <SearchIcon className="h-5 w-5" />,
    desc: 'Trích xuất đặc trưng hình ảnh từ ảnh quét thật để tự động đọc thành phần và nhãn sản phẩm.',
  },
  {
    name: 'Vision Transformer',
    icon: <SparklesIcon className="h-5 w-5" />,
    desc: 'Mô hình học sâu phân tích bề mặt da, độ bóng dầu và cấu trúc lỗ chân lông với độ chính xác cao.',
  },
  {
    name: 'Neural Match Engine',
    icon: <CameraIcon className="h-5 w-5" />,
    desc: 'Tính toán điểm phù hợp và sinh ra phân loại Phù hợp / Cần cân nhắc / Nên tránh tức thì.',
  },
]

export default function Technology() {
  return (
    <section id="technology" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] overflow-hidden">
      {/* Animated Floating Cosmetic Decorations to fill empty space */}
      <FloatingCosmeticDecoration
        Icon={SkinAnalysisIcon}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="top-4 right-2 sm:right-6 xl:-right-16 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.2}
        delay={0.2}
        accent="#3b82f6"
        parallaxOffset={65}
      />
      <FloatingCosmeticDecoration
        Icon={FaceMistBottle}
        size="w-44 h-44 sm:w-60 sm:h-60 lg:w-68 lg:h-68"
        className="top-1/2 -translate-y-1/2 right-2 sm:right-4 xl:-right-12 opacity-80 lg:opacity-95"
        yRange={[0, -30, 0]}
        duration={4.8}
        delay={0.5}
        accent="#6366f1"
        parallaxOffset={-55}
      />
      <FloatingCosmeticDecoration
        Icon={MoisturizerTube}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="bottom-4 left-2 sm:left-6 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, 32, 0]}
        duration={6.0}
        delay={0.8}
        accent="#3b82f6"
        parallaxOffset={70}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-[#0f826b]">
        <SectionTitle
          eyebrow="CÔNG NGHỆ & QUY TẮC"
          title={
            <>
              Hệ Thống Phân Tích
              <br />
              Minh Bạch &amp; Chính Xác.
            </>
          }
          description="Sự kết hợp giữa quy tắc kiểm tra minh bạch theo hồ sơ cơ địa và mô hình trí tuệ nhân tạo đọc ảnh sản phẩm thực tế."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="lg:row-span-2">
            <div className="relative h-full min-h-[340px] overflow-hidden rounded-3xl glass p-2 border border-white/90 shadow-md">
              <NeuralNetCanvas />
              <div className="pointer-events-none absolute left-5 top-5 font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#082531]">
                match_engine.active
              </div>
              <div className="pointer-events-none absolute right-5 bottom-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#082531]">
                  rule-based + AI · online
                </span>
              </div>
            </div>
          </Reveal>

          {tech.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 transition-all border border-white/90 shadow-md hover:shadow-xl hover:border-[#00b4d8] hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0F4C5C]/10 text-[#0F4C5C] border border-[#0F4C5C]/20 shadow-sm">
                    {t.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-black text-[#082531]">
                      {t.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#133844] font-semibold">
                      {t.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


