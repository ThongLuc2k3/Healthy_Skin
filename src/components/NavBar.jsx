import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { UserIcon, MenuIcon, XIcon, LogOutIcon } from './Icons'
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
  { to: '/skin-lab', label: 'Skin Lab' },
  { to: '/experts', label: 'Chuyên gia' },
]

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
          scrolled
            ? 'bg-[#02040b]/85 backdrop-blur-xl border-b border-cyan-400/20 shadow-glow-lg'
            : 'bg-transparent'
        }`}
      >
        {/* Full-width wide container */}
        <div className="w-full flex items-center justify-between px-6 py-3.5 sm:px-10 lg:px-14">
          {/* Brand Logo from /logo.png */}
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl glass border border-cyan-400/30 overflow-hidden p-1">
              <img
                src="/logo.png"
                alt="DA DƯỠNG AI Logo"
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
              />
              <span className="absolute inset-0 rounded-xl shadow-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
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
                    isActive ? 'text-cyan-300 font-semibold' : 'text-slate-300 hover:text-cyan-200'
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
                <span className="hidden sm:flex items-center gap-2 rounded-xl glass border border-cyan-400/20 px-3.5 py-2 text-xs font-semibold text-cyan-200">
                  <UserIcon className="h-4 w-4 text-cyan-300" />
                  <span className="truncate max-w-[150px]">{user.email}</span>
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
              className="lg:hidden grid h-10 w-10 place-items-center rounded-xl glass border border-cyan-400/30 text-cyan-300"
              onClick={() => setOpen((v) => !v)}
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
            className="fixed top-20 left-4 right-4 z-40 lg:hidden glass-strong rounded-3xl p-5 border border-cyan-400/25 shadow-glow-lg"
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm rounded-xl transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30'
                        : 'text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-cyan-400/20 flex items-center justify-between text-xs">
                <span className="truncate max-w-[200px] text-cyan-300 font-semibold">{user.email}</span>
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
