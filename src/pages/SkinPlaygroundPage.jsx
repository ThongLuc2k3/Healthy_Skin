import { useMemo, useState } from 'react'
import { GamepadIcon, SparklesIcon, TrophyIcon } from '../components/Icons'

const QUESTIONS = [
  {
    id: 'after_wash',
    question: 'Sau khi rửa mặt xong 20 phút, da bạn thường thế nào?',
    options: [
      { id: 'tight', label: 'Căng, khô, hơi rít' },
      { id: 'balanced', label: 'Khá thoải mái, không quá bóng' },
      { id: 'shiny', label: 'Bóng dầu lại khá nhanh' },
    ],
  },
  {
    id: 'midday',
    question: 'Tới giữa trưa, vùng chữ T của bạn thường ra sao?',
    options: [
      { id: 'dry', label: 'Ít thay đổi, vẫn khá khô' },
      { id: 'mixed', label: 'Hơi dầu vùng mũi/trán' },
      { id: 'oily', label: 'Bóng rõ, dễ bí' },
    ],
  },
  {
    id: 'new_product',
    question: 'Khi thử sản phẩm mới, da bạn phản ứng thế nào?',
    options: [
      { id: 'easy', label: 'Khá dễ thích nghi' },
      { id: 'careful', label: 'Phải test kỹ một chút' },
      { id: 'reactive', label: 'Dễ đỏ, châm chích hoặc nổi mẩn' },
    ],
  },
]

const DAILY_CHALLENGES = [
  'Hôm nay uống đủ 2 bình nước trước 17:00.',
  'Kiểm tra hạn dùng 1 sản phẩm skincare đang để quá lâu.',
  'Đổi khăn mặt/vỏ gối sạch để giảm bí tắc da.',
  'Chốt 1 bữa tối ít đồ chiên và nhiều rau hơn thường lệ.',
]

function SkinPlaygroundPage() {
  const [answers, setAnswers] = useState({})
  const [pickedChallenge, setPickedChallenge] = useState(DAILY_CHALLENGES[0])

  const result = useMemo(() => {
    const values = Object.values(answers)
    if (values.length < QUESTIONS.length) return null

    const score = {
      dry: values.filter((v) => ['tight', 'dry'].includes(v)).length,
      oily: values.filter((v) => ['shiny', 'oily'].includes(v)).length,
      sensitive: values.filter((v) => ['careful', 'reactive'].includes(v)).length,
    }

    if (score.sensitive >= 1) {
      return {
        title: 'Thiên hướng da nhạy cảm',
        tip: 'Giữ routine ít bước, test sản phẩm mới chậm hơn và đừng đổi quá nhiều món cùng lúc.',
      }
    }
    if (score.oily > score.dry) {
      return {
        title: 'Thiên hướng da dầu/hỗn hợp dầu',
        tip: 'Ưu tiên cân bằng dầu, làm sạch dịu nhẹ và đừng quên dưỡng ẩm mỏng nhẹ.',
      }
    }
    return {
      title: 'Thiên hướng da thường/khô',
      tip: 'Tập trung khóa ẩm, giảm tẩy rửa mạnh và giữ da đủ nước suốt ngày.',
    }
  }, [answers])

  function shuffleChallenge() {
    const next = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)]
    setPickedChallenge(next)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <GamepadIcon className="h-3.5 w-3.5" />
            Mini game / Skin Lab
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Chơi nhanh để hiểu da mình hơn</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Một tab vui nhộn để giữ người dùng quay lại web. Không thay thế hồ sơ chính, nhưng rất hợp
            để kéo tương tác và tạo cảm giác hệ sinh thái sống động hơn.
          </p>

          <div className="mt-6 space-y-5">
            {QUESTIONS.map((question, index) => (
              <div key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Câu {index + 1}</p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{question.question}</h2>
                <div className="mt-4 grid gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        answers[question.id] === option.id
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(236,254,255,0.96))] p-6 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
              <SparklesIcon className="h-4 w-4" />
              Kết quả mini quiz
            </p>
            {result ? (
              <>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">{result.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{result.tip}</p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Trả lời đủ 3 câu để mở ra một gợi ý vui, nhanh và dễ nhớ về xu hướng làn da của bạn.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <TrophyIcon className="h-4 w-4 text-emerald-600" />
              Thử thách hôm nay
            </p>
            <p className="mt-4 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
              {pickedChallenge}
            </p>
            <button
              type="button"
              onClick={shuffleChallenge}
              className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5"
            >
              Đổi thử thách khác
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default SkinPlaygroundPage
