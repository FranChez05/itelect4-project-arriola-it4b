import type * as React from 'react'
import { BookingStatus } from '../types'
import type { Booking as BookingType } from '../types'

interface BookingProps {
  booking: BookingType | null
  userName: string
  courtName: string
  onConfirm: (bookingId: number) => void
  isConfirming?: boolean
  isLoading?: boolean
  error?: string | null
  variant?: 'default' | 'compact'
  children?: React.ReactNode
}

const Booking: React.FC<BookingProps> = ({
  booking,
  userName,
  courtName,
  onConfirm,
  isConfirming = false,
  isLoading = false,
  error = null,
  variant = 'default',
  children,
}) => {
  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (booking) {
      onConfirm(booking.id)
    }
  }

  // Styled Loading State
  if (isLoading) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="relative mb-3">
          <svg className="animate-spin h-9 w-9 text-[#078A63] dark:text-emerald-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-slate-700 px-3 py-0.5 text-xs font-extrabold text-[#078A63] dark:text-emerald-300 uppercase tracking-wider mb-1">
          Loading Ticket
        </span>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fetching reservation details...</p>
      </article>
    )
  }

  // Styled Error / Empty State
  if (error || !booking) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 dark:bg-amber-900/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
          {error ? 'System Error' : 'Action Required'}
        </span>
        <h2 className="text-base font-black text-amber-950 dark:text-amber-200">
          {error || 'No Reservation Selected'}
        </h2>
        <p className="mt-1 text-xs font-semibold text-amber-800/80 dark:text-amber-300/80 max-w-xs">
          {error
            ? 'Unable to communicate with the court booking service. Please try again.'
            : 'Please select an available court and date to generate your confirmation ticket.'}
        </p>
      </article>
    )
  }

  const isApproved = booking.status === BookingStatus.Approved
  const durationHours = booking.durationHours || 2

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between rounded-xl bg-[#EAF6EC] dark:bg-slate-700 p-3.5 border border-[#078A63]/30 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isApproved ? 'bg-[#078A63] dark:bg-emerald-400' : 'bg-amber-500'}`} />
          <span className="font-black text-[#064A8C] dark:text-blue-300">
            Reservation #{booking.id} ({courtName})
          </span>
        </div>
        <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded bg-white/80 border border-current ${isApproved ? 'text-[#078A63] dark:text-emerald-400' : 'text-[#0876D1] dark:text-blue-400'}`}>
          {isApproved ? 'Approved' : 'Pending'}
        </span>
      </div>
    )
  }

  return (
    <article className="h-full flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Sport Magazine Asymmetric Banner Header */}
      <div className="bg-[#078A63] dark:bg-slate-950 px-5 py-4 text-white flex items-center justify-between border-b-2 border-[#064A8C]">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#064A8C] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
            03
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
            CONFIRMATION TICKET
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
            isApproved
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-amber-400 text-amber-950 border border-amber-500'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isApproved ? 'bg-emerald-300' : 'bg-amber-900'}`} />
          {isApproved ? 'Approved' : 'Pending'}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Digital Match Ticket Stub Container */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 p-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-600/60">
            <span className="font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest text-[9px]">
              TICKET STUB
            </span>
            <span className="font-black text-[#064A8C] dark:text-blue-300">#{booking.id}</span>
          </div>

          {/* Ticket Receipt Data Grid */}
          <div className="space-y-2.5 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest text-[9px]">
                PLAYER
              </span>
              <span className="font-black text-[#064A8C] dark:text-blue-300">{userName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest text-[9px]">
                VENUE
              </span>
              <span className="font-black text-[#0876D1] dark:text-blue-400">{courtName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest text-[9px]">
                DATE
              </span>
              <span className="font-black text-slate-700 dark:text-slate-200">
                {booking.bookingDate.toLocaleDateString()}
              </span>
            </div>

            {/* Perforated Dashed Line Divider */}
            <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-600/80 my-2 pt-2 flex items-center justify-between">
              <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest text-[9px]">
                DURATION
              </span>
              <span className="font-black text-[#078A63] dark:text-emerald-400">{durationHours} Hours</span>
            </div>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="space-y-2.5">
          <button
            className={`w-full rounded-xl py-3 px-4 text-xs font-black uppercase tracking-widest transition-all shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isApproved
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                : 'bg-[#0876D1] hover:bg-[#064A8C] text-white hover:shadow-lg'
            }`}
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming || isApproved}
          >
            {isConfirming
              ? 'Checking Availability...'
              : isApproved
              ? '✓ Booking Confirmed'
              : 'Confirm Booking'}
          </button>

          {children && <div className="space-y-2">{children}</div>}
        </div>
      </div>
    </article>
  )
}

export default Booking
