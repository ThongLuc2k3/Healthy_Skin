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
  const accentColor = tab === 'morning' ? '#a2ea1b' : '#00B4D8'

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start text-left">
      <div className="relative overflow-hidden rounded-3xl glass p-7 border border-white/80 shadow-glass">
        <div className="relative z-10">
          <div className="inline-flex rounded-full glass p-1 border border-white mb-6">
            <button
              type="button"
              onClick={() => setTab('morning')}
              className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                tab === 'morning'
                  ? 'bg-[#a2ea1b] text-sky-950 shadow-teal-btn'
                  : 'text-[#0F4C5C]/80 hover:text-[#0F4C5C]'
              }`}
            >
              Quy trình sáng
            </button>
            <button
              type="button"
              onClick={() => setTab('night')}
              className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                tab === 'night'
                  ? 'bg-[#00B4D8] text-white shadow-sm'
                  : 'text-[#0F4C5C]/80 hover:text-[#3898b0]'
              }`}
            >
              Quy trình tối
            </button>
          </div>

          <h3 className="font-display text-2xl font-black text-[#0F4C5C] uppercase">
            Quy trình {tab === 'morning' ? 'sáng' : 'tối'} chuẩn hóa
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#0F4C5C]/80 font-medium">
            {tab === 'morning'
              ? 'Bảo vệ & cấp ẩm: Quy trình buổi sáng được tối ưu hóa nhằm ngăn ngừa tác động tia UV và yếu tố môi trường được ghi nhận trong hồ sơ.'
              : 'Tái tạo & phục hồi: Quy trình buổi tối tập trung dưỡng ẩm sâu và phục hồi hàng rào tự nhiên trong chu kỳ tái tạo da.'}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {['4 bước', '~15 phút', 'Chuẩn AI'].map((s) => (
              <div key={s} className="rounded-2xl glass p-3 text-center border border-white">
                <div className="font-display text-sm font-black text-[#0F4C5C]">{s.split(' ')[0]}</div>
                <div className="text-[10px] text-[#0F4C5C]/80 font-bold uppercase tracking-wider">{s.split(' ').slice(1).join(' ') || 'chuẩn'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative pl-8 sm:pl-10 space-y-6">
        <div className={`absolute left-[14px] top-2 bottom-2 w-0.5 bg-gradient-to-b ${tab === 'night' ? 'from-[#0F4C5C] via-[#00B4D8] to-transparent' : 'from-[#148d74] via-[#16ca8e] to-transparent'}`} />
        {steps.map((s) => (
          <div key={s.name} className="relative">
            <span
              className="absolute -left-[24px] top-4 grid h-6 w-6 place-items-center rounded-full glass border border-white"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accentColor }} />
            </span>
            <div className="rounded-3xl glass border border-white/80 p-5 shadow-glass transition-all hover:shadow-glass-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-[#0F4C5C]">{s.name}</h4>
                <span className={`font-mono text-xs font-bold tabular-nums ${tab === 'morning' ? 'text-[#4e730a]' : 'text-[#00B4D8]'}`}>
                  {s.time}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#0F4C5C]/80 font-medium">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

