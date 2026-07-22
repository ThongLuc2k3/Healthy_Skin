import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isProfileComplete, useProfile } from '../context/ProfileContext'
import { useItems } from '../hooks/useItems'
import { apiClient } from '../lib/apiClient'
import { buildPersonalizedPlan } from '../lib/planComposer'
import { loadPlanPreferences, savePlanPreferences } from '../lib/planPreferences'
import { SparklesIcon, TargetIcon, WalletIcon, TrophyIcon } from '../components/Icons'

const DEFAULT_FORM = {
  focusArea: 'calm_skin',
  monthlyBudget: 'balanced',
  commitment: 'steady',
  durationDays: 14,
  currentProducts: '',
  currentFoods: '',
  notes: '',
}

function PlanBuilderPage() {
  const { user, ready } = useAuth()
  const { profile } = useProfile()
  const { skincare, food } = useItems()
  const navigate = useNavigate()

  const initialForm = useMemo(() => {
    if (!user) return DEFAULT_FORM
    const saved = loadPlanPreferences(user.id)
    return saved?.form ? { ...DEFAULT_FORM, ...saved.form } : DEFAULT_FORM
  }, [user])

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setErrorMessage('')

    try {
      const plan = buildPersonalizedPlan(profile, form, skincare, food)
      await apiClient.post(
        '/roadmap/custom',
        {
          goal: plan.goal,
          durationDays: form.durationDays,
          tasks: plan.tasks,
        },
        { auth: true },
      )

      savePlanPreferences(user.id, {
        form,
        summary: plan.summary,
        goal: plan.goal,
        generatedAt: new Date().toISOString(),
      })

      navigate('/roadmap')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Cần đăng nhập</h1>
        <p className="mt-3 text-sm text-slate-300">
          Đăng nhập để lưu kế hoạch cải thiện và để hệ thống theo dõi lộ trình riêng của bạn.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-cyan">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-3 text-sm text-slate-300">
          Hãy hoàn thành hồ sơ và xem kết quả kiểm tra trước khi lập kế hoạch cải thiện.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl glass-strong border border-cyan-400/25 shadow-glow-lg overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-cyan-400/20 bg-slate-950/40">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-glow">
              <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
              <span className="font-mono text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                Bước sau kết quả kiểm tra
              </span>
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
              Lập kế hoạch cải thiện riêng cho bạn
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/90">
              Không chỉ dừng ở việc biết cái gì phù hợp hay nên tránh. Hãy cho hệ thống thêm một ít bối
              cảnh thực tế để tạo ra lộ trình có thể làm ngay trong đời sống hằng ngày của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="rounded-2xl glass border border-cyan-400/20 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <TargetIcon className="h-4 w-4 text-cyan-300" />
                  Mục tiêu ưu tiên
                </span>
                <select
                  value={form.focusArea}
                  onChange={(e) => updateField('focusArea', e.target.value)}
                  className="mt-3 w-full rounded-xl bg-slate-900 border border-cyan-400/20 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="calm_skin">Làm dịu da, giảm kích ứng</option>
                  <option value="acne_control">Kiểm soát dầu và giảm mụn</option>
                  <option value="glow_up">Da sáng khỏe, đều màu hơn</option>
                  <option value="healthy_eating">Ăn uống ổn định để da khỏe từ trong</option>
                </select>
              </label>

              <label className="rounded-2xl glass border border-cyan-400/20 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <WalletIcon className="h-4 w-4 text-cyan-300" />
                  Ngân sách/tháng
                </span>
                <select
                  value={form.monthlyBudget}
                  onChange={(e) => updateField('monthlyBudget', e.target.value)}
                  className="mt-3 w-full rounded-xl bg-slate-900 border border-cyan-400/20 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="lean">Dưới 500k</option>
                  <option value="balanced">500k - 1.5 triệu</option>
                  <option value="premium">Trên 1.5 triệu</option>
                </select>
              </label>

              <label className="rounded-2xl glass border border-cyan-400/20 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <TrophyIcon className="h-4 w-4 text-cyan-300" />
                  Mức cam kết
                </span>
                <select
                  value={form.commitment}
                  onChange={(e) => updateField('commitment', e.target.value)}
                  className="mt-3 w-full rounded-xl bg-slate-900 border border-cyan-400/20 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="quick">Nhanh gọn 10 phút/ngày</option>
                  <option value="steady">Vừa phải 20 phút/ngày</option>
                  <option value="deep">Chăm kỹ 30 phút/ngày</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Bạn đang dùng sản phẩm gì?</span>
                <textarea
                  rows={4}
                  value={form.currentProducts}
                  onChange={(e) => updateField('currentProducts', e.target.value)}
                  placeholder="Ví dụ: sữa rửa mặt có BHA, serum vitamin C, kem chống nắng..."
                  className="mt-2 w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Thói quen ăn uống hiện tại</span>
                <textarea
                  rows={4}
                  value={form.currentFoods}
                  onChange={(e) => updateField('currentFoods', e.target.value)}
                  placeholder="Ví dụ: hay uống cà phê, ăn cay, ít rau, hay ăn ngoài..."
                  className="mt-2 w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Số ngày muốn tập trung</span>
                <select
                  value={form.durationDays}
                  onChange={(e) => updateField('durationDays', Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl bg-slate-900 border border-cyan-400/20 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value={7}>7 ngày tăng tốc</option>
                  <option value={14}>14 ngày ổn định</option>
                  <option value={21}>21 ngày xây thói quen</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Điều bạn muốn AI lưu ý thêm</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Ví dụ: sắp đi thực tập, ngủ muộn, dễ quên chống nắng, muốn routine tối giản..."
                  className="mt-2 w-full rounded-2xl bg-slate-900/90 border border-cyan-400/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </label>
            </div>

            {errorMessage && (
              <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-300">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {submitting ? 'Đang tạo kế hoạch...' : 'Tạo kế hoạch cải thiện cho tôi'}
              </button>
              <Link
                to="/roadmap/custom"
                className="rounded-xl glass border border-cyan-400/30 px-6 py-3.5 text-center text-sm font-semibold text-cyan-200 transition hover:border-cyan-400"
              >
                Tự nhập việc thủ công
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <h2 className="text-lg font-bold text-gradient-cyan">Kế hoạch này sẽ làm gì?</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              <li>Biến kết quả kiểm tra thành việc cần làm ngay trong ngày.</li>
              <li>Ưu tiên mục tiêu bạn đang cần nhất thay vì đẩy cả tá lời khuyên cùng lúc.</li>
              <li>Tự cân theo ngân sách và mức cam kết thực tế của bạn.</li>
              <li>Gợi ý thay đổi từ sản phẩm và thói quen hiện tại để lộ trình bám sát đời sống thật.</li>
            </ul>
          </div>

          <div className="rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg">
            <h2 className="text-lg font-bold text-gradient-cyan">Sau khi tạo xong</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Tab <strong>Lộ trình</strong> sẽ chuyển sang giao diện kiểu dashboard: hôm nay cần làm gì,
              đang tiến triển tới đâu, streak bao nhiêu ngày, và mục tiêu hiện tại ra sao.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Bạn vẫn có thể chỉnh lại kế hoạch hoặc tự thiết kế một bản khác bất cứ lúc nào.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PlanBuilderPage
