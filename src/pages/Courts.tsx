import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourts } from '../api/client'
import CourtComponent from '../components/Court'
import { useBookingStore } from '../store/useBookingStore'
import { useUiStore } from '../store/uiStore'
import type { Court } from '../types'

function CourtsEmptyState({ searchQuery, onClear }: { searchQuery: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center space-y-4 shadow-sm">
      <div className="text-4xl">🔎</div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase">No Courts Found</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No facilities matched your search query "{searchQuery}".
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-xl bg-[#0876D1] hover:bg-[#064A8C] text-white text-xs font-black uppercase tracking-wider px-4 py-2 shadow-md transition-colors"
      >
        Clear Search Filter
      </button>
    </div>
  )
}

function CourtsSkeletonCard() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700/60 rounded-md" />
      <div className="h-12 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
    </div>
  )
}

const Courts: React.FC = () => {
  const navigate = useNavigate()

  // Typed useQuery call 2: Fetch all courts directory
  const { data: courts = [], isLoading } = useQuery<Court[]>({
    queryKey: ['courts'],
    queryFn: getCourts,
  })
  const searchTerm = useUiStore((state) => state.searchTerm)
  const setSearchTerm = useUiStore((state) => state.setSearchTerm)
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId)
  const setSelectedCourtId = useBookingStore((state) => state.setSelectedCourtId)
  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? courts[0]

  const filteredCourts = courts.filter(
    (court) =>
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAndBook = (courtId: number) => {
    setSelectedCourtId(courtId)
    navigate('/booking')
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#078A63] bg-white dark:bg-slate-800 p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded bg-[#EAF6EC] dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 mb-1">
              🏸 Badminton Facilities Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
              COURTS & ARENAS
            </h1>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
              Select your preferred court to check real-time schedule and proceed to reservation.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by court or location..."
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-[#F5FAF6] dark:bg-slate-700 px-4 py-2.5 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none placeholder:text-slate-400 focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* GT2 Court Selection Card UI */}
        <div className="lg:col-span-1">
          <CourtComponent
            court={selectedCourt}
            courts={filteredCourts}
            selectedDate={selectedDate}
            onCourtChange={setSelectedCourtId}
            onDateChange={setSelectedDate}
            isLoading={isLoading}
          />
        </div>

        {/* Courts Grid */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <CourtsSkeletonCard />
          ) : filteredCourts.length === 0 ? (
            <CourtsEmptyState searchQuery={searchTerm} onClear={() => setSearchTerm('')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCourts.map((court) => {
                const isSelected = court.id === selectedCourtId
                return (
                  <div
                    key={court.id}
                    className={`rounded-2xl border-2 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? 'border-[#0876D1] ring-2 ring-[#0876D1]/30 bg-blue-50/40 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#0876D1]">
                            Facility #{court.id}
                          </span>
                          <h3 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase">
                            {court.name}
                          </h3>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full ${
                            court.isAvailable
                              ? 'bg-[#EAF6EC] text-[#078A63] border border-[#078A63]/30 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {court.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>

                      <div className="rounded-xl bg-[#F5FAF6] dark:bg-slate-700/60 p-3 space-y-1 border border-slate-200 dark:border-slate-600 text-xs">
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          📍 <strong>Location:</strong> {court.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                      <Link
                        to={`/courts/${court.id}`}
                        className="text-xs font-black uppercase text-[#064A8C] dark:text-blue-300 hover:underline"
                      >
                        🔍 Details
                      </Link>

                      <button
                        type="button"
                        disabled={!court.isAvailable}
                        onClick={() => handleSelectAndBook(court.id)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors ${
                          court.isAvailable
                            ? 'bg-[#078A63] hover:bg-[#065f46]'
                            : 'bg-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {court.isAvailable ? 'Book →' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Courts
