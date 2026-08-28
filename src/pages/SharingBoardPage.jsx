/* oxlint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { BookOpen, CalendarClock, FileText, Search, ShieldCheck, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import DetailModal from '../components/DetailModal'
import { useAuth } from '../context/AuthContext'
import { useUniversity } from '../context/UniversityContext'
import { api } from '../lib/api'

const money = value => Number(value) === 0 ? 'Miễn phí' : `${Number(value).toLocaleString('vi-VN')}đ`
const formatLabel = item => item.format === 'instant_unlock' ? 'Mở khóa ngay' : 'Tham gia trao đổi'

function SharingCard({ item, onOpen, onJoin }) {
  return <article onClick={() => onOpen(item)} className="card flex h-full cursor-pointer flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
    <div className="h-36 bg-gradient-to-br from-[#183153] to-[#2D5BFF] p-5 text-white">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
        {item.format === 'instant_unlock' ? <FileText size={14}/> : <CalendarClock size={14}/>} {formatLabel(item)}
      </span>
      <p className="mt-7 text-xs text-blue-100">{item.content_extent || item.content_format || 'Thông tin từ cộng đồng'}</p>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap gap-2">{item.keywords?.map(tag => <span className="tag tag-blue" key={tag}>{tag}</span>)}</div>
      <h2 className="mt-4 text-lg font-extrabold leading-snug">{item.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description}</p>
      <p className="mt-3 flex items-center gap-1 text-sm text-slate-500">@{item.display_name || 'thành_viên'}{item.verified_claim && <ShieldCheck size={15} className="text-[#2D5BFF]"/>}</p>
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t pt-4"><b className="text-[#2D5BFF]">{money(item.access_price_vnd)}</b><span className="flex items-center gap-1 text-sm"><Star size={15} className="fill-amber-400 text-amber-400"/>4.9</span></div>
        <button onClick={event => { event.stopPropagation(); onJoin(item) }} className="btn-secondary mt-4 w-full justify-center">{formatLabel(item)}</button>
      </div>
    </div>
  </article>
}

export default function SharingBoardPage() {
  const { session } = useAuth()
  const { activeUniversityId } = useUniversity()
  const [format, setFormat] = useState('')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [notice, setNotice] = useState('')
  const [composer, setComposer] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ format: 'instant_unlock', title: '', description: '', deliverables: '', contentFormat: 'PDF', contentExtent: '', refundTerms: 'Hoàn tiền nếu không truy cập được hoặc sai mô tả.', accessPriceVnd: 0, capacity: 8, minimumParticipants: 2, startsAt: '' })

  function load() {
    const params = new URLSearchParams()
    if (activeUniversityId) params.set('universityId', activeUniversityId)
    if (format) params.set('format', format)
    if (q) params.set('q', q)
    api(`/sharing?${params}`).then(result => setItems(result.data)).catch(error => setNotice(error.message))
  }
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer) }, [format, q, activeUniversityId])

  async function join(item) {
    if (!session) return setNotice('Bạn cần đăng nhập để tham gia.')
    try {
      await api(`/sharing/${item.id}/join`, { method: 'POST', token: session.accessToken, body: {} })
      setSelected(null)
      setNotice(item.format === 'instant_unlock' ? 'Đã mở quyền truy cập nội dung.' : 'Bạn đã tham gia buổi trao đổi và phòng chat nhóm.')
    } catch (error) { setNotice(error.message) }
  }

  async function publish(event) {
    event.preventDefault()
    if (!session) return setNotice('Bạn cần đăng nhập để đăng bài.')
    try {
      const { data } = await api('/sharing', { method: 'POST', token: session.accessToken, body: { ...form, accessPriceVnd: Number(form.accessPriceVnd), capacity: Number(form.capacity), minimumParticipants: Number(form.minimumParticipants) } })
      setComposer(false)
      setNotice(data.status === 'published' ? 'Bài chia sẻ đã được đăng.' : 'Bài đang chờ quản trị viên xem xét.')
      load()
    } catch (error) { setNotice(error.details?.fields ? Object.values(error.details.fields)[0] : error.message) }
  }

  return <div className="page py-12">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><span className="eyebrow"><BookOpen size={15}/> Thông tin hữu ích từ cộng đồng</span><h1 className="mt-4 text-4xl font-black tracking-tight">Bảng chia sẻ</h1><p className="mt-3 text-slate-500">Mở khóa tài liệu có sẵn hoặc tham gia một buổi trao đổi nhóm.</p></div><div className="flex gap-2"><Link to="/chia-se-cua-toi" className="btn-secondary">Nội dung của tôi</Link><button onClick={() => setComposer(true)} className="btn-primary">Đăng bài chia sẻ</button></div></div>
    <div className="mt-8 flex flex-wrap gap-3"><div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl border bg-white px-4"><Search size={18} className="text-slate-400"/><input value={q} onChange={event => setQ(event.target.value)} className="w-full py-3 outline-none" placeholder="Tìm tài liệu, kinh nghiệm, chủ đề..."/></div>{[['', 'Tất cả'], ['instant_unlock', 'Mở khóa ngay'], ['scheduled_exchange', 'Tham gia trao đổi']].map(option => <button key={option[0]} onClick={() => setFormat(option[0])} className={format === option[0] ? 'btn-primary' : 'btn-secondary'}>{option[1]}</button>)}</div>
    {notice && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>}
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <SharingCard key={item.id} item={item} onOpen={setSelected} onJoin={join}/>)}</div>

    <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title} footer={selected && <button onClick={() => join(selected)} className="btn-primary w-full justify-center">{formatLabel(selected)}</button>}>
      {selected && <><div className="flex flex-wrap items-center gap-2"><span className="tag tag-blue">{formatLabel(selected)}</span>{selected.keywords?.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">{selected.description}</p>{selected.deliverables && <div className="mt-7 rounded-2xl bg-blue-50 p-5"><h3 className="font-black text-[#183153]">Bạn sẽ nhận được gì?</h3><p className="mt-2 whitespace-pre-line leading-7 text-slate-600">{selected.deliverables}</p></div>}<div className="mt-7 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3"><div><p className="text-xs text-slate-400">Người chia sẻ</p><b className="mt-1 block">@{selected.display_name || 'thành_viên'}</b></div><div><p className="text-xs text-slate-400">Định dạng</p><b className="mt-1 block">{selected.content_format || selected.content_extent || 'Nội dung cộng đồng'}</b></div><div><p className="text-xs text-slate-400">Chi phí</p><b className="mt-1 block text-[#2D5BFF]">{money(selected.access_price_vnd)}</b></div></div>{selected.refund_terms && <div className="mt-5"><h3 className="font-black">Điều kiện hoàn tiền</h3><p className="mt-2 leading-7 text-slate-600">{selected.refund_terms}</p></div>}</>}
    </DetailModal>

    {composer && <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4"><form onSubmit={publish} className="my-8 w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Đăng bài chia sẻ</h2><button type="button" onClick={() => setComposer(false)}><X/></button></div><div className="mt-6 grid gap-5"><label>Định dạng<select value={form.format} onChange={event => setForm({ ...form, format: event.target.value })}><option value="instant_unlock">Mở khóa ngay</option><option value="scheduled_exchange">Tham gia trao đổi</option></select></label><label>Tiêu đề<input required minLength="10" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label><label>Mô tả<textarea required minLength="20" rows="4" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })}/></label><label>Người tham gia sẽ nhận được gì?<textarea value={form.deliverables} onChange={event => setForm({ ...form, deliverables: event.target.value })}/></label><div className="grid gap-4 sm:grid-cols-2"><label>Định dạng nội dung<input value={form.contentFormat} onChange={event => setForm({ ...form, contentFormat: event.target.value })}/></label><label>Số trang/thời lượng<input value={form.contentExtent} onChange={event => setForm({ ...form, contentExtent: event.target.value })} placeholder="18 trang / 60 phút"/></label></div><label>Giá mỗi người<input type="number" min="0" step="1000" value={form.accessPriceVnd} onChange={event => setForm({ ...form, accessPriceVnd: event.target.value })}/><span className="font-normal text-slate-400">Trên 20.000đ cần admin duyệt.</span></label>{form.format === 'scheduled_exchange' && <div className="grid gap-4 sm:grid-cols-3"><label>Lịch bắt đầu<input type="datetime-local" value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })}/></label><label>Tối thiểu<input type="number" min="1" value={form.minimumParticipants} onChange={event => setForm({ ...form, minimumParticipants: event.target.value })}/></label><label>Tối đa<input type="number" min="1" value={form.capacity} onChange={event => setForm({ ...form, capacity: event.target.value })}/></label></div>}<label>Điều kiện hoàn tiền<textarea value={form.refundTerms} onChange={event => setForm({ ...form, refundTerms: event.target.value })}/></label><button className="btn-primary justify-center">Kiểm tra và đăng bài</button></div></form></div>}
  </div>
}
