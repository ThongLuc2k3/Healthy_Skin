import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserIcon,
  SparklesIcon,
  SearchIcon,
  CalendarIcon,
  PlayIcon,
  GamepadIcon,
  ChatBubbleIcon,
  ArrowLeftIcon,
} from './Icons'
import { SectionTitle } from './ui'
import {
  FloatingCosmeticDecoration,
  SerumDropper,
  CreamJar,
  SunscreenTube,
  JadeRoller,
} from '../CosmeticDecoration'

const FEATURES = [
  {
    icon: UserIcon,
    title: 'Một hồ sơ cơ địa duy nhất',
    desc: 'Khai báo loại da, dị ứng thực phẩm, bệnh lý nền và mục tiêu một lần — dùng chung cho cả chăm sóc da lẫn dinh dưỡng. Không chắc thì chọn "Khác" và mô tả để AI hiểu rõ hơn.',
    to: '/profile',
    tag: 'Core Profile',
    accent: 'from-[#00b4d8]/25 to-[#0F4C5C]/15',
  },
  {
    icon: SparklesIcon,
    title: 'Gợi ý rõ ràng, có lý do',
    desc: 'Mỗi sản phẩm/thực phẩm được phân vào Phù hợp, Cần cân nhắc hoặc Nên tránh, bấm vào từng mục để AI giải thích sâu hơn.',
    to: '/results',
    tag: 'Transparent AI',
    accent: 'from-[#10B981]/25 to-[#0F4C5C]/15',
  },
  {
    icon: SearchIcon,
    title: 'Quét thử nhanh',
    desc: 'Tìm thủ công hoặc quét ảnh thật bằng AI để kiểm tra ngay mức độ phù hợp với cơ địa của bạn.',
    to: '/scan',
    tag: 'AI Scan',
    accent: 'from-[#00b4d8]/25 to-[#38bdf8]/15',
  },
  {
    icon: CalendarIcon,
    title: 'Có lộ trình cải thiện riêng',
    desc: 'Sau khi có kết quả, bạn có thể tạo kế hoạch theo mục tiêu, ngân sách, nhịp sống và sản phẩm đang dùng thay vì chỉ xem danh sách gợi ý tĩnh.',
    to: '/roadmap',
    tag: 'Roadmap',
    accent: 'from-[#F59E0B]/25 to-[#0F4C5C]/15',
  },
  {
    icon: PlayIcon,
    title: 'Góc truyền động lực',
    desc: 'Video & nội dung ngắn về skincare, dinh dưỡng, giảm cân lành mạnh — giữ động lực trên hành trình của bạn.',
    to: '/motivation',
    tag: 'Motivation',
    accent: 'from-[#EC4899]/25 to-[#0F4C5C]/15',
  },
  {
    icon: GamepadIcon,
    title: 'Skin Lab vui nhộn',
    desc: 'Mini quiz và thử thách nho nhỏ để người dùng quay lại mỗi ngày, giúp app giống một hệ sinh thái sống động hơn.',
    to: '/skin-lab',
    tag: 'Mini Games',
    accent: 'from-[#8B5CF6]/25 to-[#0F4C5C]/15',
  },
  {
    icon: ChatBubbleIcon,
    title: 'Trợ lý AI luôn sẵn sàng',
    desc: 'Nút chat nổi ở mọi trang — hỏi bất cứ điều gì về thành phần, dinh dưỡng hoặc cách dùng app.',
    to: '#chat',
    tag: '24/7 Assistant',
    accent: 'from-[#00b4d8]/25 to-[#0F4C5C]/15',
  },
]

function FeatureTiltCard({ feature, index }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -py * 14, ry: px * 16 })
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 })
  }

  const IconComp = feature.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="perspective-1000"
    >
      <Link
        to={feature.to}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="group preserve-3d relative block h-full overflow-hidden rounded-3xl glass p-7 text-left border border-white/90 shadow-md transition-all duration-300 hover:border-[#00b4d8] hover:shadow-2xl hover:-translate-y-1.5"
      >
        {/* Animated Gradient Spotlight Underlay */}
        <div
          className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        <div className="relative preserve-3d z-10" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C5C]/10 text-[#0F4C5C] border border-[#0F4C5C]/20 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0F4C5C] group-hover:text-white group-hover:shadow-lg">
              <IconComp className="h-6 w-6" />
            </span>
            <span className="font-mono text-[11px] font-black text-[#0F4C5C] uppercase tracking-wider bg-white/60 px-3 py-1 rounded-full border border-white">
              {feature.tag}
            </span>
          </div>

          <h3 className="mt-5 font-display text-xl font-black text-[#082531] group-hover:text-[#00b4d8] transition-colors">
            {feature.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[#133844] font-semibold">
            {feature.desc}
          </p>

          <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-[#00b4d8] group-hover:text-[#0F4C5C] transition-colors">
            Khám phá ngay <ArrowLeftIcon className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Analysis() {
  return (
    <section id="analysis" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] overflow-hidden">
      {/* Animated Floating Cosmetic Decorations to fill empty space */}
      <FloatingCosmeticDecoration
        Icon={SerumDropper}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="top-6 left-2 sm:left-4 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, -32, 0]}
        duration={5.5}
        delay={0.2}
        accent="#14b8a6"
        parallaxOffset={70}
      />
      <FloatingCosmeticDecoration
        Icon={CreamJar}
        size="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
        className="top-4 right-2 sm:right-4 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.0}
        delay={0.4}
        accent="#38bdf8"
        parallaxOffset={-65}
      />
      <FloatingCosmeticDecoration
        Icon={SunscreenTube}
        size="w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72"
        className="bottom-8 right-2 sm:right-6 xl:-right-12 opacity-80 lg:opacity-95"
        yRange={[0, -35, 0]}
        duration={6.0}
        delay={0.6}
        accent="#f59e0b"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={JadeRoller}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="bottom-4 left-2 sm:left-6 xl:-left-12 opacity-80 lg:opacity-95"
        yRange={[-25, 25, -25]}
        duration={6.5}
        delay={0.8}
        accent="#34d399"
        parallaxOffset={-55}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-[#0f826b]">
        <SectionTitle
          eyebrow="TÍNH NĂNG NỔI BẬT"
          title={
            <>
              Hệ sinh thái DA DƯỠNG
              <br />
              toàn diện &amp; thông minh.
            </>
          }
          description="Được thiết kế dựa trên một hồ sơ cơ địa dùng chung cho cả chăm sóc da và dinh dưỡng, giúp bạn biết rõ sản phẩm hay thực phẩm nào phù hợp với chính mình."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureTiltCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}


