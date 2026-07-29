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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
            <GamepadIcon className="h-3.5 w-3.5 text-cyan-300" />
            <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
              Mini game / Skin Lab
            </span>
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow">Chơi nhanh để hiểu da mình hơn</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300/90">
            Một tab vui nhộn để giữ người dùng quay lại web. Không thay thế hồ sơ chính, nhưng rất hợp
            để kéo tương tác và tạo cảm giác hệ sinh thái sống động hơn.
          </p>

          <div className="mt-8 space-y-6">
            {QUESTIONS.map((question, index) => (
              <div key={question.id} className="rounded-2xl glass p-5 border border-cyan-400/20 shadow-glow">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Câu {index + 1}</p>
                <h2 className="mt-2 text-base font-bold text-white">{question.question}</h2>
                <div className="mt-4 grid gap-2.5">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                      className={`rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                        answers[question.id] === option.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-glow ring-1 ring-cyan-400'
                          : 'border-cyan-400/20 glass text-slate-300 hover:border-cyan-400/50 hover:text-white'
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

        <aside className="space-y-5">
          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <SparklesIcon className="h-4 w-4 text-cyan-300" />
              Kết quả mini quiz
            </p>
            {result ? (
              <>
                <h2 className="mt-4 text-2xl font-bold text-gradient-cyan">{result.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.tip}</p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Trả lời đủ 3 câu để mở ra một gợi ý vui, nhanh và dễ nhớ về xu hướng làn da của bạn.
              </p>
            )}
          </div>

          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <TrophyIcon className="h-4 w-4 text-cyan-300" />
              Thử thách hôm nay
            </p>
            <p className="mt-4 rounded-2xl glass border border-cyan-400/20 p-4 text-sm leading-relaxed text-slate-200">
              {pickedChallenge}
            </p>
            <button
              type="button"
              onClick={shuffleChallenge}
              className="mt-4 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
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
