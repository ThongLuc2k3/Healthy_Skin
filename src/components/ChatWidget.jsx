import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { useProfile } from '../context/ProfileContext'
import { ChatBubbleIcon, CloseIcon, SendIcon, SparklesIcon } from './Icons'

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Xin chào! Mình là trợ lý AI của DA DƯỠNG. Bạn có thể hỏi mình về thành phần mỹ phẩm, thực phẩm, hoặc cách dùng app nhé.',
}

function ChatWidget() {
  const { profile } = useProfile()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await apiClient.post('/chat', {
        messages: nextMessages,
        context: { page: location.pathname, profile },
      })
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl glass-strong border border-cyan-400/30 shadow-glow">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-cyan-900/80 to-slate-900/90 border-b border-cyan-400/20 px-4 py-3 text-white">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gradient-cyan">
              <SparklesIcon className="h-4 w-4 text-cyan-300" />
              Trợ lý DA DƯỠNG
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng khung chat"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium shadow-glow'
                      : 'glass border border-cyan-400/15 text-slate-200'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl glass border border-cyan-400/15 px-3.5 py-2 text-sm text-cyan-300/70">
                  Đang trả lời...
                </p>
              </div>
            )}
            {errorMessage && (
              <p className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-2 text-xs font-medium text-rose-300">
                {errorMessage}
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-cyan-400/20 p-2.5 bg-slate-950/60">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi trợ lý AI..."
              className="flex-1 rounded-xl bg-slate-900/80 border border-cyan-400/20 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 shadow-glow"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-glow-lg transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatBubbleIcon className="h-6 w-6" />}
      </button>
    </>
  )
}

export default ChatWidget
