import { ShieldIcon, SearchIcon, SparklesIcon, CameraIcon } from './Icons'
import { SectionTitle, Reveal } from './ui'
import NeuralNetCanvas from './NeuralNetCanvas'

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
    <section id="technology" className="relative py-28 sm:py-36 overflow-hidden noise bg-[#02040b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,#0a1626_0%,#050b18_60%,#02040b_100%)]" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6">
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

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <Reveal className="lg:row-span-2">
            <div className="relative h-full min-h-[340px] overflow-hidden rounded-3xl glass-strong p-2 shadow-glow-lg border border-cyan-400/25">
              <NeuralNetCanvas />
              <div className="pointer-events-none absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                match_engine.active
              </div>
              <div className="pointer-events-none absolute right-5 bottom-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseGlow" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  rule-based + AI · online
                </span>
              </div>
            </div>
          </Reveal>

          {tech.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl glass p-6 transition-all hover:border-cyan-400/40 border border-cyan-400/20">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-40" />
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {t.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {t.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
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
