import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Wallet, X } from 'lucide-react'
import LogoIcon from './LogoIcon'
import { useAuth } from '../context/AuthContext'
import { useUniversity } from '../context/UniversityContext'
const links = [['/', 'Trang chủ'], ['/yeu-cau', 'Bảng yêu cầu'], ['/chia-se', 'Bảng chia sẻ'], ['/dien-dan', 'Diễn đàn'], ['/server', 'Server trường'], ['/phien', 'Phiên của tôi'], ['/tin-nhan', 'Tin nhắn']]
export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const {universities,activeUniversityId,setActiveUniversityId}=useUniversity()
  return <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fbfcff]/90 backdrop-blur-xl">
    <div className="page flex h-[72px] items-center justify-between">
      <Link to="/" onClick={() => setOpen(false)}><LogoIcon /></Link>
      <nav className="hidden items-center gap-5 lg:flex">{links.map(([to,label]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `text-sm font-semibold transition ${isActive ? 'text-[#2D5BFF]' : 'text-slate-600 hover:text-slate-950'}`}>{label}</NavLink>)}<select aria-label="Lọc theo trường" className="max-w-28 rounded-lg border bg-white px-2 py-2 text-xs font-bold" value={activeUniversityId} onChange={e=>setActiveUniversityId(e.target.value)}><option value="">Tất cả trường</option>{universities.map(x=><option value={x.id} key={x.id}>{x.code}</option>)}</select></nav>
      <div className="hidden items-center gap-3 lg:flex"><Link to="/tim-kiem" title="Tìm kiếm" className="text-slate-500 hover:text-[#2D5BFF]"><Search size={19}/></Link>{user?<><Link to="/thong-bao" title="Thông báo" className="text-slate-500 hover:text-[#2D5BFF]"><Bell size={19}/></Link><Link to="/vi" title="Ví TLUCS" className="text-slate-500 hover:text-[#2D5BFF]"><Wallet size={19}/></Link><Link to="/tai-khoan" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9EEFF] text-xs font-black text-[#2D5BFF]">{user.display_name?.slice(0,2).toUpperCase()}</Link><button onClick={logout} title="Đăng xuất" className="text-slate-400 hover:text-red-500"><LogOut size={18}/></button></>:<Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-700">Đăng nhập</Link>}<Link to="/dang-yeu-cau" className="btn-primary">Đăng yêu cầu</Link></div>
      <button className="lg:hidden" onClick={() => setOpen(value => !value)} aria-label={open ? 'Đóng menu' : 'Mở menu'}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <div className="border-t bg-white px-5 py-4 lg:hidden">{links.map(([to,label]) => <Link onClick={() => setOpen(false)} key={to} to={to} className="block py-3 font-semibold text-slate-700">{label}</Link>)}{user?<button onClick={()=>{logout();setOpen(false)}} className="block py-3 font-semibold text-red-600">Đăng xuất · {user.display_name}</button>:<Link onClick={() => setOpen(false)} to="/login" className="block py-3 font-semibold text-slate-700">Đăng nhập</Link>}<Link onClick={() => setOpen(false)} to="/dang-yeu-cau" className="btn-primary mt-3 w-full">Đăng yêu cầu</Link></div>}
  </header>
}
