import { useState } from 'react'

const MORNING_STEPS = [
  { name: 'Sữa rửa mặt dịu nhẹ', desc: 'Làm sạch bã nhờn tích tụ qua đêm mà không phá vỡ màng ẩm lipid bảo vệ.', time: '07:00' },
  { name: 'Serum chống oxy hóa', desc: 'Vitamin C + Niacinamide dưỡng sáng da và ngăn tác hại gốc tự do từ môi trường.', time: '07:05' },
  { name: 'Kem dưỡng ẩm mỏng nhẹ', desc: 'Khóa ẩm Ceramide nuôi dưỡng hàng rào bảo vệ da bền vững suốt cả ngày.', time: '07:10' },
  { name: 'Kem chống nắng quang phổ rộng', desc: 'Chỉ số SPF 50 bảo vệ da khỏi tia UV theo đúng khuyến cáo hồ sơ cá nhân.', time: '07:15' },
]

const NIGHT_STEPS = [
  { name: 'Tẩy trang & Rửa mặt kép', desc: 'Dầu tẩy trang tan sạch kem chống nắng và khói bụi mịn tích tụ cả ngày.', time: '21:00' },
  { name: 'Tinh chất phục hồi', desc: 'Retinol / Peptide cải thiện kết cấu bề mặt da và làm mờ nếp nhăn mỏng.', time: '21:05' },
  { name: 'Kem dưỡng tái tạo chuyên sâu', desc: 'Làm dịu các vùng da mẫn cảm và hỗ trợ tái tạo tế bào trong lúc ngủ.', time: '21:15' },
  { name: 'Mặt nạ ngủ cấp nước', desc: 'Tăng cường độ ẩm lớp sừng đẩy chỉ số Hydration vượt mốc 90%.', time: '21:20' },
]

export default function RoutineTimelineSection() {
  const [tab, setTab] = useState('morning')
  const steps = tab === 'morning' ? MORNING_STEPS : NIGHT_STEPS
  const accentColor = tab === 'morning' ? '#fbbf24' : '#60a5fa'

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start text-left">
      <div className="relative overflow-hidden rounded-3xl glass-strong border border-cyan-400/25 p-7 shadow-glow-lg">
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-40"
          style={{ background: accentColor }}
        />
        <div className="relative z-10">
          <div className="inline-flex rounded-xl glass p-1.5 border border-cyan-400/20 mb-6">
            <button
              type="button"
              onClick={() => setTab('morning')}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                tab === 'morning'
                  ? 'bg-amber-400 text-slate-950 shadow-glow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Quy trình sáng
            </button>
            <button
              type="button"
              onClick={() => setTab('night')}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                tab === 'night'
                  ? 'bg-blue-400 text-slate-950 shadow-glow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Quy trình tối
            </button>
          </div>

          <h3 className="font-display text-2xl font-bold text-gradient-cyan capitalize">
            Quy trình {tab === 'morning' ? 'buổi sáng' : 'buổi tối'} chuẩn hóa
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300/90">
            {tab === 'morning'
              ? 'Bảo vệ & cấp ẩm: Quy trình buổi sáng được tối ưu hóa nhằm ngăn ngừa tác động tia UV và yếu tố môi trường được ghi nhận trong hồ sơ.'
              : 'Tái tạo & phục hồi: Quy trình buổi tối tập trung dưỡng ẩm sâu và phục hồi hàng rào tự nhiên trong chu kỳ tái tạo da.'}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {['4 bước', '~15 phút', 'Chuẩn AI'].map((s) => (
              <div key={s} className="rounded-xl glass p-3 text-center border border-cyan-400/20">
                <div className="font-display text-sm font-bold text-white">{s.split(' ')[0]}</div>
                <div className="text-[10px] text-cyan-300 font-mono uppercase tracking-wider">{s.split(' ').slice(1).join(' ') || 'chuẩn'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative pl-8 sm:pl-10 space-y-6">
        <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/40 via-cyan-400/20 to-transparent" />
        {steps.map((s, i) => (
          <div key={s.name} className="relative">
            <span
              className="absolute -left-[24px] top-4 grid h-6 w-6 place-items-center rounded-full glass border border-cyan-400/40"
              style={{ boxShadow: `0 0 12px ${accentColor}` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: accentColor }} />
            </span>
            <div className="rounded-2xl glass-strong border border-cyan-400/20 p-5 shadow-glow transition-all hover:border-cyan-400/50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-white">{s.name}</h4>
                <span className="font-mono text-xs text-cyan-300 tabular-nums">{s.time}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300/80">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
