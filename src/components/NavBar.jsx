import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  HomeIcon,
  CameraIcon,
  DocumentIcon,
  HistoryIcon,
  FlameIcon,
  MapIcon,
  CheckCircleIcon,
  SparklesIcon,
  StethoscopeIcon,
  ChatBubbleIcon,
  ShieldIcon,
} from './Icons'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Trang chủ', end: true, icon: HomeIcon },
  { to: '/profile', label: 'Hồ sơ', icon: UserIcon },
  { to: '/scan', label: 'Quét thử', icon: CameraIcon },
  { to: '/results', label: 'Kết quả', icon: DocumentIcon },
  { to: '/motivation', label: 'Động lực', icon: FlameIcon },
  { to: '/experts', label: 'Chuyên gia', icon: StethoscopeIcon },
  { to: '/history', label: 'Lịch sử', icon: HistoryIcon },
  { to: '/checkin', label: 'Điểm danh', icon: CheckCircleIcon },
  { to: '/roadmap', label: 'Lộ trình', icon: MapIcon },
  { to: '/skin-lab', label: 'Skin Lab', icon: SparklesIcon },
  { to: '/reviews', label: 'Diễn đàn', icon: ChatBubbleIcon },
  { to: '/about', label: 'Về chúng tôi', icon: ShieldIcon },
]

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 250)
  }

  const isHome = location.pathname === '/'

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          !isHome || scrolled
            ? 'bg-[#02040b]/85 backdrop-blur-xl border-b border-cyan-400/20 shadow-glow-lg'
            : 'bg-transparent'
        }`}
      >

        {/* Full-width wide container */}
          <div className={`w-full flex items-center justify-between px-6 lg:py-2 sm:py-1 sm:px-5 
                ${ user ? 'lg:py-5' : 'lg:py-4'
          }`}
          >
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center group shrink-0">
            <div className="flex items-center cursor-pointer h-10">
              <img
                src="/logo1.png"
                alt="DA DƯỠNG AI Logo"
                className="object-cover h-30 w-auto"
              />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              DA DƯỠNG<span className="text-cyan-300"> AI</span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm transition-colors relative group ${
                    isActive ? 'text-cyan-300 font-semibold' : 'text-slate-100 hover:text-cyan-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-cyan-400 transition-transform origin-left ${
                        isActive ? 'scale-x-100 shadow-glow' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action & Auth Section */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:flex items-center gap-2 rounded-xl bg-sky-900 border border-cyan-700/60 px-3.5 py-2 text-xs text-white font-semibold shadow-md">
                  <UserIcon className="h-4 w-4 text-cyan-300" />
                  <span className="truncate max-w-[150px] text-white">{user.email}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-400/15 border border-cyan-400/30 px-3.5 py-2 text-xs font-bold text-cyan-200 transition-all hover:bg-cyan-400 hover:text-slate-950 shadow-glow"
                >
                  <LogOutIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-glow"
              >
                Đăng nhập
              </NavLink>
            )}

            {/* Mobile Menu Trigger button */}
            <button
              className="lg:hidden grid h-10 w-10 place-items-center  text-cyan-300"
              onClick={() => setOpen((v) => !v)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Toggle menu"
            >
              {open ? <XIcon className="h-5 w-5 text-cyan-300" /> : <MenuIcon className="h-5 w-5 text-cyan-300" />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-300"
        />
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden bg-[#050c1e]/95 backdrop-blur-2xl rounded-3xl p-4 border border-cyan-400/30 shadow-glow-lg text-white"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm">
              {LINKS.map((l) => {
                const Icon = l.icon
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all border ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 text-cyan-300 font-bold border-cyan-400/60 shadow-glow'
                          : 'bg-[#0b172a]/70 text-slate-100 hover:text-cyan-300 hover:bg-cyan-500/20 border-cyan-500/20 hover:border-cyan-400/40'
                      }`
                    }
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-cyan-400" />}
                    <span className="truncate">{l.label}</span>
                  </NavLink>
                )
              })}
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-cyan-400/20 flex items-center justify-between text-xs">
                <span className="truncate max-w-[200px] rounded-xl bg-sky-900 border border-cyan-700/60 px-3 py-1.5 text-white font-semibold">{user.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-400 font-semibold hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

export default NavBar



