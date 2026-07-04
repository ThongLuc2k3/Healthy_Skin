import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RadioGroup from '../components/RadioGroup'
import CheckboxGroup from '../components/CheckboxGroup'
import ExtendedProfileSection from '../components/ExtendedProfileSection'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { SKIN_TYPES, ALLERGIES, CONDITIONS, GOALS, OTHER_OPTION_ID } from '../data/profileOptions'

function OtherNoteInput({ id, label, value, onChange }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Mô tả bằng lời của bạn, AI sẽ dựa vào đây để hiểu rõ hơn..."
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
      />
    </div>
  )
}

function ProfileForm() {
  const { profile, setProfile } = useProfile()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [skinType, setSkinType] = useState(profile.skinType)
  const [allergies, setAllergies] = useState(profile.allergies)
  const [conditions, setConditions] = useState(profile.conditions)
  const [goals, setGoals] = useState(profile.goals)
  const [skinTypeNote, setSkinTypeNote] = useState(profile.skinTypeNote || '')
  const [allergiesNote, setAllergiesNote] = useState(profile.allergiesNote || '')
  const [conditionsNote, setConditionsNote] = useState(profile.conditionsNote || '')
  const [goalsNote, setGoalsNote] = useState(profile.goalsNote || '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!skinType) {
      setError('Vui lòng chọn loại da trước khi tiếp tục.')
      return
    }

    const nextProfile = {
      skinType,
      allergies,
      conditions,
      goals,
      skinTypeNote: skinType === OTHER_OPTION_ID ? skinTypeNote : '',
      allergiesNote: allergies.includes(OTHER_OPTION_ID) ? allergiesNote : '',
      conditionsNote: conditions.includes(OTHER_OPTION_ID) ? conditionsNote : '',
      goalsNote: goals.includes(OTHER_OPTION_ID) ? goalsNote : '',
    }
    setProfile(nextProfile)
    console.log('Hồ sơ cơ địa đã lưu:', nextProfile)
    navigate('/results')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hồ sơ cơ địa của bạn
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thông tin này chỉ dùng để cá nhân hóa gợi ý trên thiết bị của bạn. Không chắc chắn ở mục nào?
          Chọn "Khác" và mô tả bằng lời của bạn — AI sẽ dựa vào đó để hiểu rõ hơn.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-900">
            Loại da <span className="text-red-500">*</span>
          </h2>
          <div className="mt-3">
            <RadioGroup
              name="skinType"
              options={SKIN_TYPES}
              value={skinType}
              onChange={(value) => {
                setSkinType(value)
                setError('')
              }}
            />
          </div>
          {skinType === OTHER_OPTION_ID && (
            <OtherNoteInput
              id="skinTypeNote"
              label="Mô tả làn da của bạn"
              value={skinTypeNote}
              onChange={setSkinTypeNote}
            />
          )}
        </section>

        <hr className="border-slate-100" />

        <section>
          <h2 className="text-base font-semibold text-slate-900">Dị ứng thực phẩm</h2>
          <p className="text-sm text-slate-500">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
          <div className="mt-3">
            <CheckboxGroup
              name="allergies"
              options={ALLERGIES}
              values={allergies}
              onChange={setAllergies}
            />
          </div>
          {allergies.includes(OTHER_OPTION_ID) && (
            <OtherNoteInput
              id="allergiesNote"
              label="Mô tả dị ứng của bạn"
              value={allergiesNote}
              onChange={setAllergiesNote}
            />
          )}
        </section>

        <hr className="border-slate-100" />

        <section>
          <h2 className="text-base font-semibold text-slate-900">Bệnh lý nền liên quan dinh dưỡng</h2>
          <p className="text-sm text-slate-500">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
          <div className="mt-3">
            <CheckboxGroup
              name="conditions"
              options={CONDITIONS}
              values={conditions}
              onChange={setConditions}
            />
          </div>
          {conditions.includes(OTHER_OPTION_ID) && (
            <OtherNoteInput
              id="conditionsNote"
              label="Mô tả bệnh lý nền của bạn"
              value={conditionsNote}
              onChange={setConditionsNote}
            />
          )}
        </section>

        <hr className="border-slate-100" />

        <section>
          <h2 className="text-base font-semibold text-slate-900">Mục tiêu của bạn</h2>
          <p className="text-sm text-slate-500">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
          <div className="mt-3">
            <CheckboxGroup name="goals" options={GOALS} values={goals} onChange={setGoals} />
          </div>
          {goals.includes(OTHER_OPTION_ID) && (
            <OtherNoteInput
              id="goalsNote"
              label="Mô tả mục tiêu của bạn"
              value={goalsNote}
              onChange={setGoalsNote}
            />
          )}
        </section>

        {user && (
          <>
            <hr className="border-slate-100" />
            <ExtendedProfileSection />
          </>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30"
        >
          Xem gợi ý cho tôi
        </button>
      </form>
    </div>
  )
}

export default ProfileForm
