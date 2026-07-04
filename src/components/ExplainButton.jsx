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
      <div className="mt-2 rounded-lg border border-violet-100 bg-violet-50 p-3 text-sm leading-relaxed whitespace-pre-line text-violet-900">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-600">
          <SparklesIcon className="h-3.5 w-3.5" />
          Giải thích thêm từ AI
        </p>
        {explanation}
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        {status === 'loading' ? 'Đang tạo giải thích...' : 'Giải thích thêm bằng AI'}
      </button>
      {status === 'error' && <p className="mt-1.5 text-xs text-red-600">{errorMessage}</p>}
    </div>
  )
}

export default ExplainButton
