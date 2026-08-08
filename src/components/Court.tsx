import { useRef } from 'react'
import type * as React from 'react'
import type { Court as CourtType } from '../types'

interface CourtProps {
  court: CourtType | null
  courts: CourtType[]
  selectedDate: string
  onCourtChange: (courtId: number) => void
  onDateChange: (date: string) => void
  isLoading?: boolean
}

export default function Court({
  court,
  courts,
  selectedDate,
  onCourtChange,
  onDateChange,
  isLoading = false,
}: CourtProps) {
  // DOM reference using useRef to target the date input element directly
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleCourtChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCourtChange(Number(event.target.value))
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value)
  }

  const handleFocusDateInput = () => {
    // Focus the date input DOM element
    dateInputRef.current?.focus()
  }

  if (isLoading) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="relative mb-3">
          <svg className="animate-spin h-9 w-9 text-[#0876D1] dark:text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-slate-700 px-3 py-0.5 text-xs font-extrabold text-[#0876D1] dark:text-blue-300 uppercase tracking-wider mb-1">
          Loading Courts
        </span>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fetching court availability & schedules...</p>
      </article>
    )
  }

  if (courts.length === 0) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 dark:bg-amber-900/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
          No Matches Found
        </span>
        <h3 className="text-base font-black text-amber-950 dark:text-amber-200">No Courts Available</h3>
        <p className="mt-1 text-xs font-semibold text-amber-800/80 dark:text-amber-300/80 max-w-xs">
          No court matches your current search criteria. Try clearing your search query.
        </p>
      </article>
    )
  }

  return (
    <article className="h-full flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Sport Magazine Asymmetric Banner Header */}
      <div className="bg-[#0876D1] dark:bg-slate-950 px-5 py-4 text-white flex items-center justify-between border-b-2 border-[#064A8C]">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#064A8C] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
            02
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-blue-100">
            CHOOSE A COURT
          </span>
        </div>
        <span className="rounded-md bg-white/10 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-200 border border-blue-300/30">
          SELECT VENUE
        </span>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Booking Inputs Section */}
        <div className="space-y-4">
          {/* Venue Selection Field Card */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 p-4 transition-all focus-within:border-[#0876D1] focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:shadow-md">
            <label className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              <span>VENUE / COURT</span>
              <span className="text-[#0876D1] dark:text-blue-400">Step 2A</span>
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-black text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1] shadow-2xs"
              value={court?.id ?? ''}
              onChange={handleCourtChange}
            >
              {courts.map((item) => (
                <option key={item.id} value={item.id} className="dark:bg-slate-800 dark:text-white font-semibold">
                  {item.name} ({item.location})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Field Card */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 p-4 transition-all focus-within:border-[#0876D1] focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:shadow-md">
            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
              <span>RESERVATION DATE</span>
              <button
                className="text-[10px] font-black text-[#0876D1] dark:text-blue-400 hover:underline uppercase tracking-wider"
                type="button"
                onClick={handleFocusDateInput}
              >
                Focus Input
              </button>
            </div>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-black text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1] shadow-2xs"
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Scoreboard-Style Status Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <div
            className={`flex items-center justify-between rounded-xl p-3.5 border text-xs shadow-2xs transition-colors ${
              court?.isAvailable
                ? 'bg-[#EAF6EC] dark:bg-slate-700/60 border-[#078A63]/50 text-[#078A63] dark:text-emerald-400'
                : 'bg-[#FEF2F2] dark:bg-slate-700/60 border-[#EF4444]/50 text-[#B91C1C] dark:text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${court?.isAvailable ? 'bg-[#078A63] dark:bg-emerald-400 animate-pulse' : 'bg-[#EF4444]'}`} />
              <span className="font-black text-xs">
                {court ? (court.isAvailable ? 'Instant Availability' : 'Limited / Booked') : 'No Court Selected'}
              </span>
            </div>
            <span className="font-black uppercase tracking-widest text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-current shadow-2xs">
              {court ? (court.isAvailable ? 'Available' : 'Booked') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
