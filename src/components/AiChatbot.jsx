import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, MessageCircleQuestion, Send, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const welcome = { role: 'bot', text: 'Chào bạn! Mình là trợ lý TLUCS. Mình có thể hướng dẫn sử dụng, giải đáp về ví, yêu cầu, bài chia sẻ hoặc tiếp nhận khiếu nại.' }
const quickQuestions = ['Cách đăng yêu cầu', 'Cách nạp tiền', 'Cách nhận hỗ trợ', 'Gửi khiếu nại']

function answerFor(message) {
  const text = message.toLowerCase()
  if (text.includes('nạp') || text.includes('ví') || text.includes('tiền')) return 'Bạn mở Ví TLUCS, chọn Nạp tiền, chọn mệnh giá hoặc nhập số tiền rồi thanh toán bằng QR hay tài khoản ngân hàng đã liên kết. Đây là tính năng mô phỏng, không phát sinh tiền thật.'
  if (text.includes('đăng yêu cầu') || text.includes('cần hỗ trợ')) return 'Bạn chọn Đăng yêu cầu trên thanh điều hướng, điền nội dung, trường, môn, thời lượng và chọn hình thức miễn phí, trả phí hoặc trao đổi.'
  if (text.includes('nhận') || text.includes('hỗ trợ người')) return 'Bạn vào Bảng yêu cầu, nhấn vào một thẻ để đọc đầy đủ rồi chọn Nhận yêu cầu. Nếu phù hợp, TLUCS sẽ mở phòng trao đổi riêng.'
  if (text.includes('chia sẻ') || text.includes('tài liệu')) return 'Bảng chia sẻ cho phép mở khóa tài liệu hoặc tham gia buổi trao đổi nhóm. Nhấn vào bài để xem mô tả, nội dung nhận được và điều kiện hoàn tiền.'
  if (text.includes('xác minh')) return 'Bạn vào Tài khoản, chọn loại bằng chứng phù hợp và gửi yêu cầu xác minh. Thông tin bằng chứng không được công khai tùy tiện.'
  if (text.includes('khiếu nại') || text.includes('báo cáo')) return 'Mình có thể tiếp nhận ngay. Hãy chọn nút “Gửi khiếu nại” bên dưới rồi mô tả sự việc càng cụ thể càng tốt.'
  return 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về đăng hoặc nhận yêu cầu, bài chia sẻ, ví, xác minh tài khoản, hoặc chọn “Gửi khiếu nại”.'
}

export default function AiChatbot() {
  const { session, user } = useAuth()
  const [open, setOpen] = useState(false), [input, setInput] = useState(''), [messages, setMessages] = useState([welcome]), [awaitingComplaint, setAwaitingComplaint] = useState(false), [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  async function sendText(value) {
    const text = value.trim(); if (!text || busy) return
    setInput(''); setMessages(list => [...list, { role: 'user', text }])
    if (awaitingComplaint) {
      if (text.length < 10) return setMessages(list => [...list, { role: 'bot', text: 'Bạn vui lòng mô tả ít nhất 10 ký tự để bộ phận hỗ trợ có đủ thông tin xử lý.' }])
      if (!session) { setAwaitingComplaint(false); return setMessages(list => [...list, { role: 'bot', text: 'Bạn cần đăng nhập để gửi khiếu nại và theo dõi danh tính người gửi.' }]) }
      setBusy(true)
      try {
        const { data } = await api('/operations/reports', { method: 'POST', token: session.accessToken, body: { targetType: 'support', targetId: user.id, reason: text } })
        setAwaitingComplaint(false); setMessages(list => [...list, { role: 'bot', text: `Đã tiếp nhận khiếu nại. Mã hỗ trợ: ${data.id.slice(0, 8).toUpperCase()}. Quản trị viên sẽ xem nội dung trong hàng đợi xử lý.` }])
      } catch (error) { setMessages(list => [...list, { role: 'bot', text: `Chưa thể gửi khiếu nại: ${error.message}` }]) } finally { setBusy(false) }
      return
    }
    window.setTimeout(() => setMessages(list => [...list, { role: 'bot', text: answerFor(text) }]), 350)
  }
  function startComplaint() { setOpen(true); setAwaitingComplaint(true); setMessages(list => [...list, { role: 'bot', text: 'Bạn hãy mô tả vấn đề, thời điểm xảy ra và điều bạn mong muốn được hỗ trợ. Nội dung sẽ được chuyển đến quản trị viên.' }]) }

  return <div className="fixed bottom-5 right-4 z-[75] sm:bottom-7 sm:right-7">
    {open && <section className="mb-3 flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-28px))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center gap-3 bg-[#183153] px-5 py-4 text-white"><span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2D5BFF]"><Bot/><i className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#183153] bg-[#B7F34A]"/></span><div className="flex-1"><h2 className="font-black">Trợ lý AI TLUCS</h2><p className="text-xs text-blue-200">Hỗ trợ và tiếp nhận khiếu nại</p></div><button onClick={() => setOpen(false)} aria-label="Thu nhỏ chatbot"><ChevronDown/></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.map((message, index) => <div key={index} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto rounded-br-md bg-[#2D5BFF] text-white' : 'rounded-bl-md border bg-white text-slate-600 shadow-sm'}`}>{message.text}</div>)}{busy && <div className="w-fit rounded-2xl bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">Đang gửi đến bộ phận hỗ trợ...</div>}<div ref={endRef}/></div>
      <div className="border-t bg-white p-3"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{quickQuestions.map(question => <button key={question} onClick={() => question === 'Gửi khiếu nại' ? startComplaint() : sendText(question)} className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-[#2D5BFF] hover:text-[#2D5BFF]">{question}</button>)}</div><form onSubmit={event => { event.preventDefault(); sendText(input) }} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3"><input aria-label="Nhập câu hỏi" value={input} onChange={event => setInput(event.target.value)} className="!border-0 !bg-transparent !px-1 !shadow-none" placeholder={awaitingComplaint ? 'Mô tả khiếu nại...' : 'Hỏi trợ lý TLUCS...'}/><button disabled={!input.trim() || busy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2D5BFF] text-white disabled:opacity-40"><Send size={17}/></button></form><p className="mt-2 text-center text-[10px] text-slate-400">Trợ lý có thể trả lời chưa chính xác. Không chia sẻ mật khẩu hoặc OTP.</p></div>
    </section>}
    <button onClick={() => setOpen(value => !value)} aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'} className="group ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2D5BFF] text-white shadow-[0_12px_35px_rgba(45,91,255,.4)] transition hover:scale-105 hover:bg-[#2149db]">
      {open ? <ChevronDown size={28}/> : <span className="relative"><MessageCircleQuestion size={29}/><Sparkles className="absolute -right-2 -top-2 text-[#B7F34A]" size={15}/></span>}
    </button>
  </div>
}
