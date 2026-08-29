/* oxlint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { Bookmark, Gift, Heart, MessageCircle, Plus, Reply, Search, Send, Share2, X } from 'lucide-react'
import DetailModal from '../components/DetailModal'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useUniversity } from '../context/UniversityContext'
import { api } from '../lib/api'

const giftTiers = [100, 1000, 10000]

function GiftMenu({ count, onGift, label = 'Tặng quà' }) {
  const [open, setOpen] = useState(false)
  return <div className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} className="flex items-center gap-1.5 text-amber-500" aria-label={label}><Gift size={16}/> {count || 0}</button>
    {open && <>
      <button type="button" aria-label="Đóng" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)}/>
      <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-xl border bg-white p-2 shadow-lg">
        {giftTiers.map(tier => <button type="button" key={tier} onClick={() => { onGift(tier); setOpen(false) }} className="rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100">{tier.toLocaleString('vi-VN')}đ</button>)}
      </div>
    </>}
  </div>
}

function Actions({ post, action, comment, report, gift, currentUserId }) {
  const isOwn = currentUserId && post.author_id === currentUserId
  return <div className="mt-5 flex flex-wrap items-center gap-5 border-t pt-4 text-sm text-slate-500">
    <button onClick={() => action(post, 'react', { reaction: 'like' })} className={`flex gap-1.5 ${post.reacted ? 'text-red-500' : ''}`}><Heart size={18} fill={post.reacted ? 'currentColor' : 'none'}/> {post.reaction_count || 0}</button>
    <button onClick={() => comment(post)} className="flex gap-1.5"><MessageCircle size={18}/> {post.comment_count || 0}</button>
    {!isOwn && <GiftMenu count={post.gift_count} onGift={tier => gift(post, tier)}/>}
    <button onClick={() => action(post, 'save')} className="flex gap-1.5"><Bookmark size={18}/> Lưu</button>
    <button onClick={() => report(post)} className="text-xs font-bold text-slate-400">Báo cáo</button>
    <button onClick={() => navigator.clipboard?.writeText(`${location.origin}/dien-dan?post=${post.id}`)} className="ml-auto"><Share2 size={18}/></button>
  </div>
}

function CommentThread({ comments, session, currentUserId, replyTo, setReplyTo, replyDraft, setReplyDraft, replyBusy, onReact, onGift, onReport, onSubmitReply }) {
  const childrenOf = parentId => comments.filter(item => (item.parent_id || null) === parentId)
  const roots = comments.filter(item => !item.parent_id)

  const renderNode = comment => {
    const isOwn = currentUserId && comment.author_id === currentUserId
    const kids = childrenOf(comment.id)
    return <div key={comment.id}>
      <article className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Avatar name={comment.display_name} className="h-7 w-7 rounded-full text-[11px]"/><b>@{comment.display_name || 'thành_viên'}</b></div>
          <time className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleString('vi-VN')}</time>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{comment.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <button type="button" onClick={() => onReact(comment)} className={`flex items-center gap-1 ${comment.reacted ? 'text-red-500' : ''}`}><Heart size={15} fill={comment.reacted ? 'currentColor' : 'none'}/> {comment.reaction_count || 0}</button>
          <button type="button" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="flex items-center gap-1"><Reply size={15}/> Trả lời</button>
          {!isOwn && <GiftMenu count={comment.gift_count} onGift={tier => onGift(comment, tier)} label="Tặng quà bình luận"/>}
          <button type="button" onClick={() => onReport(comment)} className="font-bold text-slate-400">Báo cáo</button>
        </div>
        {replyTo === comment.id && (session
          ? <form onSubmit={event => onSubmitReply(event, comment.id)} className="mt-3 flex items-center gap-2">
              <input autoFocus required maxLength="3000" value={replyDraft} onChange={event => setReplyDraft(event.target.value)} placeholder={`Trả lời @${comment.display_name || 'thành_viên'}...`} className="w-full rounded-xl border px-3 py-2 text-sm outline-none"/>
              <button disabled={replyBusy} className="btn-primary shrink-0" aria-label="Gửi trả lời"><Send size={16}/></button>
            </form>
          : <p className="mt-3 rounded-xl bg-blue-50 p-2 text-xs text-blue-700">Đăng nhập để trả lời.</p>)}
      </article>
      {kids.length > 0 && <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4">{kids.map(renderNode)}</div>}
    </div>
  }

  if (!comments.length) return <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-400">Chưa có bình luận. Hãy bắt đầu cuộc thảo luận.</p>
  return <div className="mt-4 space-y-3">{roots.map(renderNode)}</div>
}

export default function ForumPage() {
  const { session, user } = useAuth()
  const { activeUniversityId } = useUniversity()
  const [feed, setFeed] = useState('for_you'), [q, setQ] = useState(''), [posts, setPosts] = useState([])
  const [composer, setComposer] = useState(false), [selectedId, setSelectedId] = useState(null), [notice, setNotice] = useState('')
  const [form, setForm] = useState({ title: '', body: '', keywords: '' })
  const [comments, setComments] = useState([]), [commentBody, setCommentBody] = useState(''), [commentBusy, setCommentBusy] = useState(false)
  const [replyTo, setReplyTo] = useState(null), [replyDraft, setReplyDraft] = useState(''), [replyBusy, setReplyBusy] = useState(false)
  const selected = posts.find(post => post.id === selectedId)
  function load() { const params = new URLSearchParams({ feed: feed === 'trending' ? 'trending' : 'latest' }); if (activeUniversityId) params.set('universityId', activeUniversityId); if (q) params.set('q', q); api(`/forum/posts?${params}`).then(result => setPosts(result.data)).catch(error => setNotice(error.message)) }
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer) }, [feed, q, activeUniversityId])
  useEffect(() => { setReplyTo(null); setReplyDraft(''); if (!selectedId) { setComments([]); return }; let active = true; api(`/forum/posts/${selectedId}/comments`).then(result => { if (active) setComments(result.data) }).catch(error => { if (active) setNotice(error.message) }); return () => { active = false } }, [selectedId])
  async function publish(event) { event.preventDefault(); if (!session) return setNotice('Bạn cần đăng nhập để đăng bài.'); try { const { data } = await api('/forum/posts', { method: 'POST', token: session.accessToken, body: { title: form.title, body: form.body, keywords: form.keywords.split(',').map(value => value.trim()).filter(Boolean) } }); setComposer(false); setForm({ title: '', body: '', keywords: '' }); setNotice(data.moderation?.outcome === 'publish' ? 'Bài viết đã được đăng.' : 'Bài viết đang chờ quản trị viên xem xét.'); load() } catch (error) { setNotice(error.details?.fields ? Object.values(error.details.fields)[0] : error.message) } }
  async function action(post, path, body = {}) { if (!session) return setNotice('Bạn cần đăng nhập để tương tác.'); try { const result = await api(`/forum/posts/${post.id}/${path}`, { method: 'POST', token: session.accessToken, body }); if (path === 'react') setPosts(list => list.map(item => item.id === post.id ? { ...item, reaction_count: Number(item.reaction_count) + (result.active ? 1 : -1), reacted: result.active } : item)); if (path === 'save') setNotice(result.active ? 'Đã lưu bài viết.' : 'Đã bỏ lưu bài viết.') } catch (error) { setNotice(error.message) } }
  function comment(post) { setSelectedId(post.id) }
  async function gift(post, amountVnd) { if (!session) return setNotice('Bạn cần đăng nhập để tặng quà.'); try { await api(`/forum/posts/${post.id}/gift`, { method: 'POST', token: session.accessToken, body: { amountVnd } }); setPosts(list => list.map(item => item.id === post.id ? { ...item, gift_count: Number(item.gift_count || 0) + 1, gift_total_vnd: Number(item.gift_total_vnd || 0) + amountVnd } : item)); setNotice(`Đã tặng ${amountVnd.toLocaleString('vi-VN')}đ cho bài viết.`) } catch (error) { setNotice(error.message) } }
  async function submitComment(event) { event.preventDefault(); if (!session) return setNotice('Bạn cần đăng nhập để bình luận.'); const body = commentBody.trim(); if (!body) return; setCommentBusy(true); try { const { data } = await api(`/forum/posts/${selected.id}/comments`, { method: 'POST', token: session.accessToken, body: { body } }); setCommentBody(''); if (data.moderation_status === 'published') { setComments(list => [...list, { ...data, display_name: session.user?.display_name || 'Bạn' }]); setPosts(list => list.map(item => item.id === selected.id ? { ...item, comment_count: Number(item.comment_count || 0) + 1 } : item)) } else setNotice('Bình luận đang được kiểm duyệt trước khi hiển thị.') } catch (error) { setNotice(error.message) } finally { setCommentBusy(false) } }
  async function submitReply(event, parentId) { event.preventDefault(); if (!session) return setNotice('Bạn cần đăng nhập để bình luận.'); const body = replyDraft.trim(); if (!body) return; setReplyBusy(true); try { const { data } = await api(`/forum/posts/${selected.id}/comments`, { method: 'POST', token: session.accessToken, body: { body, parentId } }); setReplyDraft(''); setReplyTo(null); if (data.moderation_status === 'published') { setComments(list => [...list, { ...data, display_name: session.user?.display_name || 'Bạn' }]); setPosts(list => list.map(item => item.id === selected.id ? { ...item, comment_count: Number(item.comment_count || 0) + 1 } : item)) } else setNotice('Trả lời đang được kiểm duyệt trước khi hiển thị.') } catch (error) { setNotice(error.message) } finally { setReplyBusy(false) } }
  async function reactOnComment(target) { if (!session) return setNotice('Bạn cần đăng nhập để tương tác.'); try { const result = await api(`/forum/comments/${target.id}/react`, { method: 'POST', token: session.accessToken, body: { reaction: 'like' } }); setComments(list => list.map(item => item.id === target.id ? { ...item, reaction_count: Math.max(0, Number(item.reaction_count || 0) + (result.active ? 1 : -1)), reacted: result.active } : item)) } catch (error) { setNotice(error.message) } }
  async function giftComment(target, amountVnd) { if (!session) return setNotice('Bạn cần đăng nhập để tặng quà.'); try { await api(`/forum/comments/${target.id}/gift`, { method: 'POST', token: session.accessToken, body: { amountVnd } }); setComments(list => list.map(item => item.id === target.id ? { ...item, gift_count: Number(item.gift_count || 0) + 1, gift_total_vnd: Number(item.gift_total_vnd || 0) + amountVnd } : item)); setNotice(`Đã tặng ${amountVnd.toLocaleString('vi-VN')}đ cho bình luận.`) } catch (error) { setNotice(error.message) } }
  async function reportComment(target) { if (!session) return setNotice('Bạn cần đăng nhập để báo cáo.'); const reason = prompt('Mô tả lý do báo cáo bình luận (ít nhất 10 ký tự)'); if (!reason) return; try { await api('/operations/reports', { method: 'POST', token: session.accessToken, body: { targetType: 'comment', targetId: target.id, reason } }); setNotice('Đã gửi báo cáo bình luận cho quản trị viên.') } catch (error) { setNotice(error.message) } }
  async function report(post) { if (!session) return setNotice('Bạn cần đăng nhập để báo cáo.'); const reason = prompt('Mô tả lý do báo cáo (ít nhất 10 ký tự)'); if (!reason) return; try { await api('/operations/reports', { method: 'POST', token: session.accessToken, body: { targetType: 'post', targetId: post.id, reason } }); setNotice('Đã gửi báo cáo cho quản trị viên.') } catch (error) { setNotice(error.message) } }

  return <div className="page py-12">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><span className="eyebrow">Cộng đồng liên trường</span><h1 className="mt-4 text-4xl font-black">Diễn đàn</h1></div><button onClick={() => setComposer(true)} className="btn-primary"><Plus size={18}/> Viết bài</button></div>
    <div className="mt-7 flex flex-wrap gap-2">{[['for_you', 'Dành cho bạn'], ['latest', 'Mới nhất'], ['trending', 'Đang nổi']].map(option => <button onClick={() => setFeed(option[0])} className={feed === option[0] ? 'btn-primary' : 'btn-secondary'} key={option[0]}>{option[1]}</button>)}{['Học tập', 'Đời sống', 'Nghề nghiệp'].map(value => <button onClick={() => setQ(value)} className="btn-secondary" key={value}>{value}</button>)}</div>
    <div className="mt-6 flex items-center gap-3 rounded-xl border bg-white px-4"><Search className="text-slate-400"/><input value={q} onChange={event => setQ(event.target.value)} className="w-full py-3 outline-none" placeholder="Tìm bài viết hoặc từ khóa..."/></div>{notice && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>}
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]"><div className="space-y-5">{posts.map(post => <article onClick={() => setSelectedId(post.id)} className="card cursor-pointer p-6 transition hover:shadow-lg" key={post.id}><div className="flex items-center gap-3"><Avatar name={post.display_name} className="h-10 w-10 rounded-full text-sm"/><div><b>@{post.display_name || 'thành_viên'}</b><p className="text-xs text-slate-400">{post.university_code || 'Liên trường'} · {new Date(post.created_at).toLocaleString('vi-VN')}</p></div></div><h2 className="mt-5 text-xl font-extrabold">{post.title}</h2><p className="mt-3 line-clamp-3 whitespace-pre-line leading-7 text-slate-600">{post.body}</p><div className="mt-4 flex flex-wrap gap-2">{post.keywords?.map(tag => <button onClick={event => { event.stopPropagation(); setQ(tag) }} className="tag tag-blue" key={tag}>#{tag}</button>)}</div><div onClick={event => event.stopPropagation()}><Actions post={post} action={action} comment={comment} report={report} gift={gift} currentUserId={user?.id}/></div></article>)}</div><aside className="card h-fit p-5"><h3 className="font-extrabold">Chủ đề nổi bật</h3>{['#dang-ky-hoc-phan', '#thuc-tap-2026', '#nha-tro-lang-dai-hoc', '#tri-tue-nhan-tao'].map((value, index) => <button onClick={() => setQ(value.slice(1))} className="mt-4 flex w-full justify-between text-sm" key={value}><span className="font-bold text-[#2D5BFF]">{value}</span><span className="text-slate-400">{28 - index * 5} bài</span></button>)}</aside></div>
    <DetailModal open={Boolean(selected)} onClose={() => { setSelectedId(null); setCommentBody('') }} title={selected?.title}>{selected && <><div className="flex items-center gap-3"><Avatar name={selected.display_name} className="h-11 w-11 rounded-full text-sm"/><div><b>@{selected.display_name || 'thành_viên'}</b><p className="text-xs text-slate-400">{selected.university_code || 'Liên trường'} · {new Date(selected.created_at).toLocaleString('vi-VN')}</p></div></div><p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">{selected.body}</p><div className="mt-5 flex flex-wrap gap-2">{selected.keywords?.map(tag => <span className="tag tag-blue" key={tag}>#{tag}</span>)}</div><Actions post={selected} action={action} comment={comment} report={report} gift={gift} currentUserId={user?.id}/><section className="mt-7 border-t pt-6"><h3 className="flex items-center gap-2 font-black"><MessageCircle size={19} className="text-[#2D5BFF]"/> Bình luận ({comments.length})</h3><CommentThread comments={comments} session={session} currentUserId={user?.id} replyTo={replyTo} setReplyTo={setReplyTo} replyDraft={replyDraft} setReplyDraft={setReplyDraft} replyBusy={replyBusy} onReact={reactOnComment} onGift={giftComment} onReport={reportComment} onSubmitReply={submitReply}/>{session ? <form onSubmit={submitComment} className="mt-4 flex items-center gap-2"><input required maxLength="3000" value={commentBody} onChange={event => setCommentBody(event.target.value)} placeholder="Viết bình luận..."/><button disabled={commentBusy} className="btn-primary shrink-0" aria-label="Gửi bình luận"><Send size={18}/></button></form> : <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">Đăng nhập để tham gia bình luận.</p>}</section></>}</DetailModal>
    {composer && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={event => event.target === event.currentTarget && setComposer(false)}><form onSubmit={publish} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Viết bài mới</h2><button type="button" onClick={() => setComposer(false)}><X/></button></div><div className="mt-6 grid gap-5"><label>Tiêu đề<input required minLength="10" maxLength="160" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label><label>Nội dung<textarea required minLength="20" rows="7" value={form.body} onChange={event => setForm({ ...form, body: event.target.value })}/></label><label>Từ khóa, phân cách bằng dấu phẩy<input value={form.keywords} onChange={event => setForm({ ...form, keywords: event.target.value })} placeholder="AI, chọn môn, HCMUS"/></label><button className="btn-primary justify-center">Kiểm tra và đăng bài</button></div></form></div>}
  </div>
}
