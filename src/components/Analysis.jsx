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

const FEATURES = [
  {
    icon: UserIcon,
    title: 'Một hồ sơ cơ địa duy nhất',
    desc: 'Khai báo loại da, dị ứng thực phẩm, bệnh lý nền và mục tiêu một lần — dùng chung cho cả chăm sóc da lẫn dinh dưỡng. Không chắc thì chọn "Khác" và mô tả để AI hiểu rõ hơn.',
    to: '/profile',
    tag: 'Core Profile',
    accent: 'from-cyan-500/30 to-blue-500/20',
  },
  {
    icon: SparklesIcon,
    title: 'Gợi ý rõ ràng, có lý do',
    desc: 'Mỗi sản phẩm/thực phẩm được phân vào Phù hợp, Cần cân nhắc hoặc Nên tránh, bấm vào từng mục để AI giải thích sâu hơn.',
    to: '/results',
    tag: 'Transparent AI',
    accent: 'from-emerald-500/30 to-teal-500/20',
  },
  {
    icon: SearchIcon,
    title: 'Quét thử nhanh',
    desc: 'Tìm thủ công hoặc quét ảnh thật bằng AI để kiểm tra ngay mức độ phù hợp với cơ địa của bạn.',
    to: '/scan',
    tag: 'AI Scan',
    accent: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    icon: CalendarIcon,
    title: 'Có lộ trình cải thiện riêng',
    desc: 'Sau khi có kết quả, bạn có thể tạo kế hoạch theo mục tiêu, ngân sách, nhịp sống và sản phẩm đang dùng thay vì chỉ xem danh sách gợi ý tĩnh.',
    to: '/roadmap',
    tag: 'Roadmap',
    accent: 'from-amber-500/30 to-orange-500/20',
  },
  {
    icon: PlayIcon,
    title: 'Góc truyền động lực',
    desc: 'Video & nội dung ngắn về skincare, dinh dưỡng, giảm cân lành mạnh — giữ động lực trên hành trình của bạn.',
    to: '/motivation',
    tag: 'Motivation',
    accent: 'from-rose-500/30 to-pink-500/20',
  },
  {
    icon: GamepadIcon,
    title: 'Skin Lab vui nhộn',
    desc: 'Mini quiz và thử thách nho nhỏ để người dùng quay lại mỗi ngày, giúp app giống một hệ sinh thái sống động hơn.',
    to: '/skin-lab',
    tag: 'Mini Games',
    accent: 'from-fuchsia-500/30 to-purple-500/20',
  },
  {
    icon: ChatBubbleIcon,
    title: 'Trợ lý AI luôn sẵn sàng',
    desc: 'Nút chat nổi ở mọi trang — hỏi bất cứ điều gì về thành phần, dinh dưỡng hoặc cách dùng app.',
    to: '#chat',
    tag: '24/7 Assistant',
    accent: 'from-cyan-500/30 to-teal-500/20',
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
    setTilt({ rx: -py * 10, ry: px * 12 })
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
          transition: 'transform 0.2s ease-out',
        }}
        className="group preserve-3d relative block h-full overflow-hidden rounded-2xl glass-strong p-6 text-left border border-cyan-400/20 shadow-glow hover:border-cyan-400/50"
      >
        <div
          className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        <div className="relative preserve-3d z-10" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-glow transition-all group-hover:bg-cyan-400 group-hover:text-slate-950">
              <IconComp className="h-5 w-5" />
            </span>
            <span className="font-mono text-[11px] text-cyan-300/80 uppercase tracking-wider">
              {feature.tag}
            </span>
          </div>

          <h3 className="mt-5 font-display text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
            {feature.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
            {feature.desc}
          </p>

          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-cyan-300 opacity-80 group-hover:opacity-100">
            Khám phá ngay <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Analysis() {
  return (
    <section id="analysis" className="relative py-28 sm:py-36 noise bg-[#02040b]">
      <div className="absolute inset-0 bg-metal" />
      <div className="absolute left-1/2 top-0 h-64 w-[80%] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureTiltCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
