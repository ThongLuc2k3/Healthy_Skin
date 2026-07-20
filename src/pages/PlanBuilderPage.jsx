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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">
          Đăng nhập để lưu kế hoạch cải thiện và để hệ thống theo dõi lộ trình riêng của bạn.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Chưa có hồ sơ cơ địa</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hãy hoàn thành hồ sơ và xem kết quả kiểm tra trước khi lập kế hoạch cải thiện.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
        >
          Điền hồ sơ ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_70px_-40px_rgba(16,185,129,0.45)]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(240,253,250,0.96))] px-6 py-7 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
              <SparklesIcon className="h-3.5 w-3.5" />
              Bước sau kết quả kiểm tra
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Lập kế hoạch cải thiện riêng cho bạn
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Không chỉ dừng ở việc biết cái gì phù hợp hay nên tránh. Hãy cho hệ thống thêm một ít bối
              cảnh thực tế để tạo ra lộ trình có thể làm ngay trong đời sống hằng ngày của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TargetIcon className="h-4 w-4 text-emerald-600" />
                  Mục tiêu ưu tiên
                </span>
                <select
                  value={form.focusArea}
                  onChange={(e) => updateField('focusArea', e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="calm_skin">Làm dịu da, giảm kích ứng</option>
                  <option value="acne_control">Kiểm soát dầu và giảm mụn</option>
                  <option value="glow_up">Da sáng khỏe, đều màu hơn</option>
                  <option value="healthy_eating">Ăn uống ổn định để da khỏe từ trong</option>
                </select>
              </label>

              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <WalletIcon className="h-4 w-4 text-emerald-600" />
                  Ngân sách/tháng
                </span>
                <select
                  value={form.monthlyBudget}
                  onChange={(e) => updateField('monthlyBudget', e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="lean">Dưới 500k</option>
                  <option value="balanced">500k - 1.5 triệu</option>
                  <option value="premium">Trên 1.5 triệu</option>
                </select>
              </label>

              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TrophyIcon className="h-4 w-4 text-emerald-600" />
                  Mức cam kết
                </span>
                <select
                  value={form.commitment}
                  onChange={(e) => updateField('commitment', e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="quick">Nhanh gọn 10 phút/ngày</option>
                  <option value="steady">Vừa phải 20 phút/ngày</option>
                  <option value="deep">Chăm kỹ 30 phút/ngày</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Bạn đang dùng sản phẩm gì?</span>
                <textarea
                  rows={4}
                  value={form.currentProducts}
                  onChange={(e) => updateField('currentProducts', e.target.value)}
                  placeholder="Ví dụ: sữa rửa mặt có BHA, serum vitamin C, kem chống nắng..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Thói quen ăn uống hiện tại</span>
                <textarea
                  rows={4}
                  value={form.currentFoods}
                  onChange={(e) => updateField('currentFoods', e.target.value)}
                  placeholder="Ví dụ: hay uống cà phê, ăn cay, ít rau, hay ăn ngoài..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Số ngày muốn tập trung</span>
                <select
                  value={form.durationDays}
                  onChange={(e) => updateField('durationDays', Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={7}>7 ngày tăng tốc</option>
                  <option value={14}>14 ngày ổn định</option>
                  <option value={21}>21 ngày xây thói quen</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Điều bạn muốn AI lưu ý thêm</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Ví dụ: sắp đi thực tập, ngủ muộn, dễ quên chống nắng, muốn routine tối giản..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
            </div>

            {errorMessage && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? 'Đang tạo kế hoạch...' : 'Tạo kế hoạch cải thiện cho tôi'}
              </button>
              <Link
                to="/roadmap/custom"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
              >
                Tự nhập việc thủ công
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Kế hoạch này sẽ làm gì?</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Biến kết quả kiểm tra thành việc cần làm ngay trong ngày.</li>
              <li>Ưu tiên mục tiêu bạn đang cần nhất thay vì đẩy cả tá lời khuyên cùng lúc.</li>
              <li>Tự cân theo ngân sách và mức cam kết thực tế của bạn.</li>
              <li>Gợi ý thay đổi từ sản phẩm và thói quen hiện tại để lộ trình bám sát đời sống thật.</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Sau khi tạo xong</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tab <strong>Lộ trình</strong> sẽ chuyển sang giao diện kiểu dashboard: hôm nay cần làm gì,
              đang tiến triển tới đâu, streak bao nhiêu ngày, và mục tiêu hiện tại ra sao.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bạn vẫn có thể chỉnh lại kế hoạch hoặc tự thiết kế một bản khác bất cứ lúc nào.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PlanBuilderPage
