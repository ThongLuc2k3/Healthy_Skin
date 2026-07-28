import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { getRecommendations, RESULT } from '../logic/matchEngine'
import ResultGroup from '../components/ResultGroup'
import { CheckCircleIcon, WarningIcon, XCircleIcon, ArrowLeftIcon, SparklesIcon, CalendarIcon } from '../components/Icons'

function RecommendationPage() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('skincare')
  const { skincare, food } = useItems()

  const TABS = useMemo(
    () => [
      { id: 'skincare', label: 'Chăm sóc da', data: skincare },
      { id: 'food', label: 'Dinh dưỡng', data: food },
    ],
    [skincare, food],
  )

  const resultsByTab = useMemo(() => {
    if (!isProfileComplete(profile)) return null
    return Object.fromEntries(TABS.map((tab) => [tab.id, getRecommendations(profile, tab.data)]))
  }, [profile, TABS])

  if (!resultsByTab) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-[#183B3B]">
        <h1 className="text-2xl font-bold text-[#183B3B]">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-3 text-sm text-[#183B3B]">
          Vui lòng khai báo loại da của bạn trước để xem gợi ý cá nhân hóa.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-[#183B3B] px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-[#183B3B]/90"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  const results = resultsByTab[activeTab]
  const suitableCount = results[RESULT.SUITABLE].length
  const cautionCount = results[RESULT.CAUTION].length
  const avoidCount = results[RESULT.AVOID].length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-[#183B3B]">
      <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 text-center shadow-glow-lg sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
          <SparklesIcon className="h-3.5 w-3.5 text-[#183B3B]" />
          <span className="font-mono text-xs font-semibold text-[#183B3B] uppercase tracking-wider">
            Hồ sơ đã phân tích xong
          </span>
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#183B3B] sm:text-4xl">
          Gợi ý dành cho bạn
        </h1>
        <p className="mt-3 text-sm text-[#183B3B]">
          Dựa trên hồ sơ cơ địa bạn đã khai báo. Bấm vào từng mục để xem lý do chi tiết.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl glass border border-emerald-500/30 p-4 shadow-glow">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700">Phù hợp</p>
            <p className="mt-2 text-3xl font-extrabold text-[#183B3B]">{suitableCount}</p>
          </div>
          <div className="rounded-2xl glass border border-amber-500/30 p-4 shadow-glow">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-700">Cần cân nhắc</p>
            <p className="mt-2 text-3xl font-extrabold text-[#183B3B]">{cautionCount}</p>
          </div>
          <div className="rounded-2xl glass border border-rose-500/30 p-4 shadow-glow">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-700">Nên tránh</p>
            <p className="mt-2 text-3xl font-extrabold text-[#183B3B]">{avoidCount}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl glass border border-cyan-400/20 p-5 text-left shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#183B3B]">
                Bước tiếp theo: biến kết quả này thành kế hoạch cải thiện
              </p>
              <p className="mt-1 text-sm text-[#183B3B] leading-relaxed opacity-90">
                Hệ thống sẽ hỏi thêm ngân sách, mức cam kết, sản phẩm đang dùng và thói quen ăn uống để
                sinh ra lộ trình thực tế hơn cho chính bạn.
              </p>
            </div>
            <Link
              to="/roadmap/plan"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#183B3B] px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-[#183B3B]/90"
            >
              <CalendarIcon className="h-4 w-4 text-white" />
              Lập kế hoạch cải thiện
            </Link>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 mt-6 flex gap-2 rounded-2xl glass p-1.5 shadow-glow backdrop-blur-xl border border-cyan-400/20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#183B3B] text-white shadow-glow'
                : 'text-[#183B3B]/70 hover:text-[#183B3B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        <ResultGroup
          title="Phù hợp"
          resultValue={RESULT.SUITABLE}
          color="green"
          icon={<CheckCircleIcon className="h-4 w-4 text-emerald-600" />}
          items={results[RESULT.SUITABLE]}
        />
        <ResultGroup
          title="Cần cân nhắc"
          resultValue={RESULT.CAUTION}
          color="yellow"
          icon={<WarningIcon className="h-4 w-4 text-amber-600" />}
          items={results[RESULT.CAUTION]}
        />
        <ResultGroup
          title="Nên tránh"
          resultValue={RESULT.AVOID}
          color="red"
          icon={<XCircleIcon className="h-4 w-4 text-rose-600" />}
          items={results[RESULT.AVOID]}
        />
      </div>

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl glass border border-cyan-400/30 px-6 py-3 text-sm font-semibold text-[#183B3B] transition hover:border-[#183B3B]"
      >
        <ArrowLeftIcon className="h-4 w-4 text-[#183B3B]" />
        Quay lại chỉnh hồ sơ
      </button>
    </div>
  )
}

export default RecommendationPage
