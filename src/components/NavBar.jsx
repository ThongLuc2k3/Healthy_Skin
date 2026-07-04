import { NavLink, useNavigate } from 'react-router-dom'
import { LeafIcon, UserIcon } from './Icons'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/profile', label: 'Hồ sơ' },
  { to: '/results', label: 'Kết quả' },
  { to: '/scan', label: 'Quét thử' },
  { to: '/history', label: 'Lịch sử' },
  { to: '/motivation', label: 'Động lực' },
  { to: '/roadmap', label: 'Lộ trình' },
  { to: '/checkin', label: 'Điểm danh' },
  { to: '/experts', label: 'Chuyên gia' },
]

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-200">
            <LeafIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">DA DƯỠNG</span>
        </NavLink>
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <span className="mx-1 h-4 w-px bg-slate-200" />
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <UserIcon className="h-4 w-4" />
              {user.email}
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              Đăng nhập
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export default NavBar
