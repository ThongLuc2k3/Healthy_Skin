import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { ChatBubbleIcon, CloseIcon, SendIcon, SparklesIcon } from './Icons'

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Xin chào! Mình là Trợ Lý của HEALTHY SKIN. Bạn có thể hỏi mình về cách dùng app hoặc thành phần mỹ phẩm/thực phẩm cơ bản nhé.',
}

function ChatWidget() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [wallet, setWallet] = useState(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, open, quotaExceeded])

  useEffect(() => {
    if (!open || !user) return
    apiClient
      .get('/chat/wallet', { auth: true })
      .then(setWallet)
      .catch(() => {})
  }, [open, user])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || quotaExceeded) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await apiClient.post(
        '/chat',
        {
          messages: nextMessages,
          context: { page: location.pathname, profile },
        },
        { auth: true },
      )

      if (data.wallet) setWallet(data.wallet)

      if (data.quotaExceeded) {
        setQuotaExceeded(true)
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
      }
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const remainingToday = wallet?.remainingFreeToday ?? null
  const purchasedRemaining = wallet?.purchasedQuestionsRemaining ?? 0

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl glass-strong border border-[#c5e7dd] shadow-glow-lg">
          <div className="flex items-center justify-between gap-2 bg-[#eaf7f1] border-b border-[#c5e7dd] px-4 py-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gradient-logo">
              <SparklesIcon className="h-4 w-4 text-[#2fa98c]" />
              Trợ Lý HEALTHY SKIN
            </span>
            <div className="flex items-center gap-2">
              {user && wallet && (
                <span className="rounded-full bg-white border border-[#c5e7dd] px-2.5 py-1 text-[11px] font-bold text-[#126b59]">
                  {remainingToday > 0 ? `Còn ${remainingToday} câu hôm nay` : purchasedRemaining > 0 ? `${purchasedRemaining} câu đã mua` : 'Hết lượt hôm nay'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng khung chat"
                className="rounded-lg p-1 text-[#126b59]/70 transition hover:bg-white hover:text-[#0e3b33]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 bg-white">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#2fa98c] text-white font-medium'
                      : 'bg-[#eaf7f1] border border-[#c5e7dd] text-[#0e3b33]'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-[#eaf7f1] border border-[#c5e7dd] px-3.5 py-2 text-sm text-[#0e3b33]/60">
                  Đang trả lời...
                </p>
              </div>
            )}
            {quotaExceeded && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-amber-800">
                  Bạn đã dùng hết lượt hỏi miễn phí hôm nay. Nâng cấp Gói Trợ Lý để hỏi tiếp, hoặc đặt lịch với chuyên gia thật để được tư vấn sâu hơn.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/pricing"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-[#2fa98c] px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-[#126b59]"
                  >
                    Nâng cấp Gói Trợ Lý
                  </Link>
                  <Link
                    to="/experts"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-white border border-[#c5e7dd] px-3 py-1.5 text-center text-xs font-bold text-[#126b59] hover:bg-[#eaf7f1]"
                  >
                    Đặt lịch chuyên gia
                  </Link>
                </div>
              </div>
            )}
            {errorMessage && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
                {errorMessage}
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#c5e7dd] p-2.5 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={quotaExceeded ? 'Đã hết lượt hỏi hôm nay...' : 'Hỏi Trợ Lý...'}
              disabled={quotaExceeded}
              className="flex-1 rounded-xl bg-[#f6fbf9] border border-[#c5e7dd] px-3 py-2 text-sm text-[#0e3b33] placeholder-[#0e3b33]/40 focus:border-[#2fa98c] focus:ring-1 focus:ring-[#2fa98c] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || quotaExceeded}
              aria-label="Gửi tin nhắn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2fa98c] text-white transition hover:bg-[#126b59] disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng Trợ Lý' : 'Mở Trợ Lý'}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2fa98c] text-white shadow-glow-lg transition-all duration-300 hover:scale-105 hover:bg-[#126b59]"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatBubbleIcon className="h-6 w-6" />}
      </button>
    </>
  )
}

export default ChatWidget
