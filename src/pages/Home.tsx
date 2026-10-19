import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import UserComponent from '../components/User'
import { useBookingStore } from '../store/useBookingStore'

function HomeSkeletonCard() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700/60 rounded-md" />
      <div className="space-y-2 pt-2">
        <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
        <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
        <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
      </div>
    </div>
  )
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const bookings = useBookingStore((state) => state.bookings)
  const isLoading = useBookingStore((state) => state.isLoading)

  const availableCourts = courts.filter((c) => c.isAvailable).length

  const handleReserveClick = () => {
    navigate('/booking')
  }

  const handleViewCourtsClick = () => {
    navigate('/courts')
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#0876D1] bg-white dark:bg-slate-800 p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30">
              🏸 Welcome Back, {user?.name ?? 'Player'}!
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
              BAMICOURT RESERVATION PORTAL
            </h1>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              Book professional badminton courts, track your game schedules, and manage your active match reservations with real-time updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReserveClick}
              className="rounded-xl bg-[#0876D1] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-[#064A8C] transition-all duration-200 transform hover:-translate-y-0.5"
            >
              ⚡ Reserve Court Now
            </button>
            <button
              type="button"
              onClick={handleViewCourtsClick}
              className="rounded-xl bg-[#078A63] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-[#065f46] transition-all duration-200 transform hover:-translate-y-0.5"
            >
              🏟️ View All Courts
            </button>
          </div>
        </div>
      </div>

      {/* Grid with GT2 User UI Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <UserComponent user={user} isLoading={isLoading} compact={false} />
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {isLoading ? (
            <HomeSkeletonCard />
          ) : (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md flex items-center justify-between border-l-4 border-l-[#064A8C]">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Facilities</p>
                    <p className="text-2xl font-black text-[#064A8C] dark:text-blue-300">{courts.length} Courts</p>
                  </div>
                  <span className="text-3xl">🏟️</span>
                </div>

                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md flex items-center justify-between border-l-4 border-l-[#078A63]">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available Today</p>
                    <p className="text-2xl font-black text-[#078A63] dark:text-emerald-400">{availableCourts} Ready</p>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>

                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md flex items-center justify-between border-l-4 border-l-[#0876D1]">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">My Reservations</p>
                    <p className="text-2xl font-black text-[#0876D1] dark:text-blue-400">{bookings.length} Bookings</p>
                  </div>
                  <span className="text-3xl">🎟️</span>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-md flex flex-col justify-between hover:border-[#0876D1] transition-all">
                  <div className="space-y-2">
                    <span className="text-3xl">🏸</span>
                    <h3 className="text-base font-black text-[#064A8C] dark:text-blue-300 uppercase">Browse Courts</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Explore available badminton courts with detailed floor types and location notes.
                    </p>
                  </div>
                  <Link
                    to="/courts"
                    className="mt-4 inline-block text-center rounded-lg bg-[#EAF6EC] dark:bg-slate-700 py-2 px-4 text-xs font-black uppercase text-[#078A63] dark:text-emerald-300 hover:bg-[#078A63] hover:text-white transition-colors"
                  >
                    Explore Courts →
                  </Link>
                </div>

                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-md flex flex-col justify-between hover:border-[#0876D1] transition-all">
                  <div className="space-y-2">
                    <span className="text-3xl">📋</span>
                    <h3 className="text-base font-black text-[#064A8C] dark:text-blue-300 uppercase">My Bookings</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      View your confirmed match tickets, pending requests, and manage active reservations.
                    </p>
                  </div>
                  <Link
                    to="/my-bookings"
                    className="mt-4 inline-block text-center rounded-lg bg-[#0876D1] py-2 px-4 text-xs font-black uppercase text-white hover:bg-[#064A8C] transition-colors"
                  >
                    View Bookings ({bookings.length}) →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
