import { motion } from 'framer-motion'
import { PlayIcon, SparklesIcon } from '../components/Icons'
import { MOTIVATION_CATEGORIES } from '../data/motivationContent'

const THEME = {
  emerald: {
    badge: 'bg-[#6F9D8D]/15 text-[#2C8E92] border border-[#6F9D8D]/30',
    pillBg: 'bg-[#6F9D8D]/10',
    accent: '#6F9D8D',
    gradient: 'from-[#17353D] via-[#2C8E92] to-[#67D6E8]',
  },
  amber: {
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    pillBg: 'bg-[#D8B27A]/10',
    accent: '#D8B27A',
    gradient: 'from-[#17353D] via-[#A87A45] to-[#D8B27A]',
  },
  teal: {
    badge: 'bg-[#67D6E8]/15 text-[#2C8E92] border border-[#2C8E92]/30',
    pillBg: 'bg-[#67D6E8]/10',
    accent: '#67D6E8',
    gradient: 'from-[#17353D] via-[#6F9D8D] to-[#67D6E8]',
  },
}

function ThumbnailArtwork({ themeKey, title }) {
  const theme = THEME[themeKey] || THEME.emerald

  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-tr ${theme.gradient} flex items-center justify-center`}>
      {/* Ambient Lighting Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#67D6E8]/30 blur-xl animate-pulse" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#BFD8CF]/30 blur-xl" />

      {/* Procedural AI Skincare Graphic */}
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl">
        <div
          className="h-10 w-10 rounded-2xl opacity-80 transition-transform duration-700 group-hover:scale-125"
          style={{ backgroundColor: theme.accent }}
        />
      </div>
    </div>
  )
}

function MotivationPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#67D6E8]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -left-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -right-20 h-[400px] w-[400px] rounded-full bg-[#67D6E8]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-16">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8EEF0] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(44,142,146,0.06)] text-center space-y-4"
        >

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17353D]">
            Góc Truyền Động Lực
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Video &amp; nội dung ngắn chọn lọc giúp bạn duy trì thói quen chăm sóc da, dinh dưỡng và lối sống lành mạnh mỗi ngày bên cạnh hồ sơ cơ địa cá nhân.
          </p>
        </motion.div>

        {/* MOTIVATION CATEGORIES GRID */}
        <div className="space-y-16">
          {MOTIVATION_CATEGORIES.map((category, catIdx) => {
            const theme = THEME[category.color] || THEME.emerald
            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                className="space-y-6"
              >
                {/* FLOATING GLASS PILL CATEGORY HEADER */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold shadow-xs backdrop-blur-md border ${theme.badge}`}>
                    <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
                    {category.label}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#E8EEF0]" />
                </div>

                {/* VIDEO CARDS */}
                <div className="grid gap-8 sm:grid-cols-2">
                  {category.items.map((item, itemIdx) => (
                    <motion.a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="group overflow-hidden rounded-[28px] border border-[#E8EEF0] bg-[#FCFDFC] shadow-[0_12px_40px_rgba(44,142,146,0.06)] transition-all duration-300 hover:border-[#2C8E92] hover:shadow-[0_20px_50px_rgba(44,142,146,0.12)] flex flex-col justify-between"
                    >
                      <div>
                        {/* BROWSER-STYLE WINDOW FRAME TOP BAR */}
                        <div className="flex items-center justify-between border-b border-[#E8EEF0] bg-[#F7FBFC] px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                          </div>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                            motivation.ai/video
                          </span>
                        </div>

                        {/* MOCKUP THUMBNAIL AREA */}
                        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                          <ThumbnailArtwork themeKey={category.color} title={item.title} />

                          {/* AI Recommended Badge */}
                          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-[#E8EEF0] px-3 py-1 text-[11px] font-extrabold text-[#17353D] shadow-xs backdrop-blur-md">
                            <SparklesIcon className="h-3 w-3 text-[#2C8E92]" />
                            AI Recommended
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                            4:30 MIN
                          </div>

                          {/* Floating Glass Play Button Overlay */}
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2C8E92] shadow-xl border border-white/60 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2C8E92] group-hover:text-white">
                              <PlayIcon className="h-7 w-7 translate-x-0.5" />
                            </span>
                          </div>
                        </div>

                        {/* CARD CONTENT */}
                        <div className="p-6 sm:p-7 space-y-2">
                          <h3 className="font-display text-xl font-extrabold text-[#17353D] group-hover:text-[#2C8E92] transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* CARD FOOTER */}
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 flex items-center justify-between text-xs font-bold text-[#2C8E92]">
                        <span className="group-hover:underline">Xem video trên YouTube</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>

        {/* FOOTER DEMO NOTE */}
        <p className="text-center text-xs text-[#64748B] pt-4 font-normal">
          Bấm vào thẻ để mở kết quả tìm kiếm liên quan trên YouTube (trang demo chưa gắn video cố định).
        </p>
      </div>
    </div>
  )
}

export default MotivationPage
