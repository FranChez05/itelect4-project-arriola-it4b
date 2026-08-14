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

function BookingLoadingSpinner() {
  return (
    <div className="h-full flex flex-col justify-center items-center rounded-2xl border-2 border-blue-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl text-center min-h-[300px] space-y-4 animate-pulse">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-[#0876D1]/20 border-t-[#0876D1] animate-spin" />
        <span className="absolute text-xl">🎟️</span>
      </div>
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-black text-[#078A63] dark:text-emerald-300 uppercase tracking-widest border border-[#078A63]/30">
          <span className="h-2 w-2 rounded-full bg-[#078A63] animate-ping" />
          LOADING TICKET
        </span>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">Generating reservation ticket preview...</p>
      </div>
    </div>
  )
}

function BookingErrorAlert({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-slate-800 p-6 shadow-xl text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 shadow-sm border border-rose-300">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-1">
        <span className="inline-block rounded-md bg-rose-200/80 dark:bg-rose-900/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-300">
          ⚠️ Action Required
        </span>
        <h3 className="text-base font-black text-rose-950 dark:text-rose-200 uppercase pt-1">{title}</h3>
        <p className="text-xs font-bold text-rose-800/90 dark:text-rose-300 max-w-sm mx-auto">{message}</p>
      </div>
    </div>
  )
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
    return <BookingLoadingSpinner />
  }

  // Styled Error / Empty State
  if (error || !booking) {
    return (
      <BookingErrorAlert
        title={error ? 'Booking System Error' : 'No Reservation Selected'}
        message={
          error
            ? 'Failed to connect with reservation service.'
            : 'Please select an available court and match date to view ticket preview.'
        }
      />
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
