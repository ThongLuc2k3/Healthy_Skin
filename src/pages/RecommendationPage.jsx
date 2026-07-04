import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile, isProfileComplete } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { getRecommendations, RESULT } from '../logic/matchEngine'
import ResultGroup from '../components/ResultGroup'
import { CheckCircleIcon, WarningIcon, XCircleIcon, ArrowLeftIcon } from '../components/Icons'

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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-2 text-sm text-slate-500">
          Vui lòng khai báo loại da của bạn trước để xem gợi ý cá nhân hóa.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  const results = resultsByTab[activeTab]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Gợi ý dành cho bạn
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Dựa trên hồ sơ cơ địa bạn đã khai báo. Bấm vào từng mục để xem lý do chi tiết.
        </p>
      </div>

      <div className="sticky top-16 z-30 mt-6 flex gap-2 rounded-xl bg-slate-100/90 p-1 shadow-sm backdrop-blur-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <ResultGroup
          title="Phù hợp"
          resultValue={RESULT.SUITABLE}
          color="green"
          icon={<CheckCircleIcon className="h-4 w-4" />}
          items={results[RESULT.SUITABLE]}
        />
        <ResultGroup
          title="Cần cân nhắc"
          resultValue={RESULT.CAUTION}
          color="yellow"
          icon={<WarningIcon className="h-4 w-4" />}
          items={results[RESULT.CAUTION]}
        />
        <ResultGroup
          title="Nên tránh"
          resultValue={RESULT.AVOID}
          color="red"
          icon={<XCircleIcon className="h-4 w-4" />}
          items={results[RESULT.AVOID]}
        />
      </div>

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Quay lại chỉnh hồ sơ
      </button>
    </div>
  )
}

export default RecommendationPage
