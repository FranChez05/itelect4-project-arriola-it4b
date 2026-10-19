import React, { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'

const Layout: React.FC = () => {
  const isDarkMode = useUiStore((state) => state.isDarkMode)
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode)
  const bookingsCount = useBookingStore((state) => state.bookings.length)
  const statusMessage = useBookingStore((state) => state.statusMessage)
  const fetchData = useBookingStore((state) => state.fetchData)

  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  // Trigger mock async fetch on component mount / page refresh
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Courts', path: '/courts' },
    { label: 'Booking', path: '/booking' },
    { label: 'My Bookings', path: '/my-bookings', badge: bookingsCount },
  ]

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <main className="min-h-screen bg-[#EAF6EC] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-300 flex flex-col justify-between">
        <div>
          {/* Shared Layout Header */}
          <header className="bg-[#064A8C] dark:bg-slate-950 text-white shadow-lg border-b-2 border-[#00224f] dark:border-slate-800 py-3.5 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <NavLink to="/" className="flex items-center gap-3 group">
                  <span className="bg-[#078A63] text-white px-3.5 py-1.5 text-base sm:text-lg font-black uppercase tracking-wider rounded-lg shadow-sm group-hover:bg-[#066e4f] transition-colors">
                    🏸 BAMICOURT
                  </span>
                  <span className="text-sm font-bold text-blue-100 dark:text-blue-200 hidden sm:inline">
                    Badminton Court Booking Portal
                  </span>
                </NavLink>
              </div>

              {/* Layout <nav> Navigation Links - Conditionally rendered when logged in */}
              {token && (
                <nav className="flex items-center gap-1 sm:gap-2 bg-[#003770] dark:bg-slate-900/80 p-1.5 rounded-xl border border-blue-400/20">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${isActive
                          ? 'bg-[#0876D1] text-white shadow-md scale-105'
                          : 'text-blue-100 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1 rounded-full bg-[#078A63] px-2 py-0.5 text-[10px] font-black text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </nav>
              )}

              {/* Header Action Controls */}
              <div className="flex items-center gap-2">
                {token ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
                    title="Log Out Player Session"
                  >
                    🚪 Logout
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <NavLink
                      to="/login"
                      className="flex items-center gap-1.5 rounded-lg bg-[#0876D1] hover:bg-[#064A8C] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all"
                    >
                      🔑 Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="flex items-center gap-1.5 rounded-lg bg-[#078A63] hover:bg-[#066e4f] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all"
                    >
                      ✨ Register
                    </NavLink>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 rounded-lg bg-[#078A63] hover:bg-[#065f46] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#078A63]"
                >
                  {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </header>

          {/* CRITICAL: Layout renders child routes via <Outlet /> below the nav header */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>

        {/* Global System Log Footer Bar */}
        <div className="mx-auto max-w-7xl w-full px-4 pb-6 sm:px-6 lg:px-8">
          <footer className="rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-md flex items-center justify-center gap-3 transition-colors duration-300">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-extrabold text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30">
              <span className="h-2 w-2 rounded-full bg-[#078A63] animate-pulse" />
              System Log:
            </span>
            <span className="rounded-lg bg-[#F5FAF6] dark:bg-slate-700 px-3 py-1 text-xs font-black text-[#064A8C] dark:text-blue-300 border border-slate-200 dark:border-slate-600 shadow-xs">
              {statusMessage}
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Layout
