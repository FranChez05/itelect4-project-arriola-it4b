import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourts, getBookings } from '../api/client'
import { useBookingStore } from '../store/useBookingStore'
import { useUiStore } from '../store/uiStore'
import type { Court } from '../types'
import { isCourtBookedOnDate } from '../lib/courtAvailability'

function CourtsEmptyState({ searchQuery, onClear }: { searchQuery: string; onClear: () => void }) {
  return (
    <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 text-center space-y-4 shadow-sm">
      <div className="text-3xl sm:text-4xl">🔎</div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase">No Courts Found</h3>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No facilities matched "{searchQuery}".
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg sm:rounded-xl bg-[#0876D1] hover:bg-[#064A8C] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 shadow-md transition-all hover:shadow-lg"
      >
        Clear Search Filter
      </button>
    </div>
  )
}

function CourtsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md animate-pulse overflow-hidden">
          <div className="h-32 sm:h-40 bg-slate-200 dark:bg-slate-700" />
          <div className="p-4 sm:p-5 space-y-3">
            <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-700/60 rounded-md" />
            <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

type FilterMode = 'all' | 'available' | 'booked'

const Courts: React.FC = () => {
  const navigate = useNavigate()

  const { data: courts = [], isLoading } = useQuery<Court[]>({
    queryKey: ['courts'],
    queryFn: getCourts,
  })
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: getBookings, refetchInterval: 15000 })
  const searchTerm = useUiStore((state) => state.searchTerm)
  const setSearchTerm = useUiStore((state) => state.setSearchTerm)
  const setSelectedCourtId = useBookingStore((state) => state.setSelectedCourtId)
  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)
  const today = new Date()
  const localToday = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-')
  const courtIsAvailable = (court: Court) => Boolean(selectedDate) && selectedDate >= localToday && court.isAvailable && !isCourtBookedOnDate(bookings, court.id, selectedDate)

  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'available' && courtIsAvailable(court)) ||
      (filterMode === 'booked' && !courtIsAvailable(court))
    return matchesSearch && matchesFilter
  })

  const handleSelectAndBook = (courtId: number) => {
    setSelectedCourtId(courtId)
    setSelectedDate(selectedDate)
    navigate('/booking')
  }

  const availableCount = courts.filter(courtIsAvailable).length
  const bookedCount = courts.length - availableCount

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl sm:rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-4 sm:border-l-8 border-l-[#078A63] bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded bg-[#EAF6EC] dark:bg-slate-700 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 mb-1">
              🏸 Badminton Facilities Directory
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
              COURTS & ARENAS
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
              Check court availability for your chosen date, then reserve.
            </p>
          </div>

          {/* Search and date filters */}
          <div className="w-full space-y-3 md:w-80">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔍</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by court or location..."
                className="w-full rounded-lg border-2 border-slate-300 bg-[#F5FAF6] py-2 pl-9 pr-3 text-xs font-extrabold text-[#064A8C] shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-4"
              />
            </div>
            <label className="block text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:text-xs">
              Check availability on
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold dark:border-slate-600 dark:bg-slate-800"/>
            </label>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {([
          { key: 'all' as FilterMode, label: `All (${courts.length})`, activeClass: 'bg-[#064A8C] text-white shadow-md' },
          { key: 'available' as FilterMode, label: `✅ Available (${availableCount})`, activeClass: 'bg-[#078A63] text-white shadow-md' },
          { key: 'booked' as FilterMode, label: `🔒 Booked (${bookedCount})`, activeClass: 'bg-rose-600 text-white shadow-md' },
        ]).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterMode(f.key)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              filterMode === f.key
                ? f.activeClass
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Courts Grid */}
      {isLoading ? (
        <CourtsSkeletonGrid />
      ) : filteredCourts.length === 0 ? (
        <CourtsEmptyState searchQuery={searchTerm || filterMode} onClear={() => { setSearchTerm(''); setFilterMode('all') }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filteredCourts.map((court) => (
            <div
              key={court.id}
              className="rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md overflow-hidden hover:shadow-xl hover:border-[#0876D1]/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Court Image */}
              <div className="relative h-36 sm:h-44 overflow-hidden">
                <img
                  src={court.imageUrl || "/court-card.jpg"}
                  alt={court.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm ${
                      courtIsAvailable(court)
                        ? 'bg-[#078A63]/90 text-white'
                        : 'bg-rose-600/90 text-white'
                    }`}
                  >
                    {courtIsAvailable(court) ? '✓ Available on date' : '✕ Unavailable on date'}
                  </span>
                </div>
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className="bg-[#064A8C]/90 backdrop-blur-sm text-white px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase rounded-lg shadow-lg">
                    Court #{court.id}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Court Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase group-hover:text-[#0876D1] transition-colors">
                    {court.name}
                  </h3>
                  {court.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{court.description}</p>}
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>📍</span>
                    <span>{court.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700 gap-2">
                  <Link
                    to={`/courts/${court.id}`}
                    className="text-[10px] sm:text-xs font-black uppercase text-[#064A8C] dark:text-blue-300 hover:text-[#0876D1] hover:underline transition-colors"
                  >
                    🔍 Details
                  </Link>
                  <button
                    type="button"
                    disabled={!courtIsAvailable(court)}
                    onClick={() => handleSelectAndBook(court.id)}
                    className={`rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md transition-all ${
                      courtIsAvailable(court)
                        ? 'bg-[#078A63] hover:bg-[#065f46] hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {courtIsAvailable(court) ? '🏸 Book Now' : 'Unavailable on date'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Courts
