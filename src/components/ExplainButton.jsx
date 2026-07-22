import { useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { useProfile } from '../context/ProfileContext'
import { SparklesIcon } from './Icons'

function ExplainButton({ nameVi, category, result, reason }) {
  const { profile } = useProfile()
  const [status, setStatus] = useState('idle')
  const [explanation, setExplanation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleClick() {
    if (status === 'loading') return
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await apiClient.post('/explain', { nameVi, category, result, reason, profile })
      setExplanation(data.explanation)
      setStatus('done')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-2.5 rounded-xl border border-cyan-400/30 bg-cyan-950/40 p-3.5 text-sm leading-relaxed whitespace-pre-line text-cyan-100 shadow-glow">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
          <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
          Giải thích thêm từ AI
        </p>
        {explanation}
      </div>
    )
  }

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950 disabled:opacity-60 shadow-glow"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        {status === 'loading' ? 'Đang tạo giải thích...' : 'Giải thích thêm bằng AI'}
      </button>
      {status === 'error' && <p className="mt-1.5 text-xs text-rose-400">{errorMessage}</p>}
    </div>
  )
}

export default ExplainButton
