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
      <label htmlFor={id} className="text-xs font-medium text-cyan-300/80">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Mô tả bằng lời của bạn, AI sẽ dựa vào đây để hiểu rõ hơn..."
        className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-cyan-400/20 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient-cyan text-shadow-glow sm:text-4xl">
          Hồ sơ cơ địa của bạn
        </h1>
        <p className="mt-3 text-base text-slate-300/90 max-w-xl mx-auto">
          Thông tin này chỉ dùng để cá nhân hóa gợi ý trên thiết bị của bạn. Không chắc chắn ở mục nào?
          Chọn "Khác" và mô tả bằng lời của bạn — AI sẽ dựa vào đó để hiểu rõ hơn.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-8 rounded-3xl glass-strong border border-cyan-400/25 p-6 shadow-glow-lg sm:p-8"
      >
        <section>
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-gradient-cyan">
            Loại da <span className="text-rose-400">*</span>
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

        <hr className="border-cyan-400/15" />

        <section>
          <h2 className="text-base font-semibold text-gradient-cyan">Dị ứng thực phẩm</h2>
          <p className="mt-1 text-sm text-slate-400">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
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

        <hr className="border-cyan-400/15" />

        <section>
          <h2 className="text-base font-semibold text-gradient-cyan">Bệnh lý nền liên quan dinh dưỡng</h2>
          <p className="mt-1 text-sm text-slate-400">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
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

        <hr className="border-cyan-400/15" />

        <section>
          <h2 className="text-base font-semibold text-gradient-cyan">Mục tiêu của bạn</h2>
          <p className="mt-1 text-sm text-slate-400">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
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
            <hr className="border-cyan-400/15" />
            <ExtendedProfileSection />
          </>
        )}

        {error && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-cyan-400 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-glow-lg transition hover:bg-cyan-300 hover:scale-[1.01]"
        >
          Xem gợi ý cho tôi
        </button>
      </form>
    </div>
  )
}

export default ProfileForm
