import type * as React from 'react'
import { BookingStatus } from '../types'
import type { Booking as BookingType } from '../types'

export interface SubmissionBadgeProps {
  booking: BookingType | null
  userName: string
  courtName: string
  onConfirm: (bookingId: number) => void
  isConfirming?: boolean
  isLoading?: boolean
  error?: string | null
  variant?: 'default' | 'compact' | 'detailed'
  children?: React.ReactNode
}

export default function SubmissionBadge({
  booking,
  userName,
  courtName,
  onConfirm,
  isConfirming = false,
  isLoading = false,
  error = null,
  variant = 'default',
  children,
}: SubmissionBadgeProps) {
  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (booking) {
      onConfirm(booking.id)
    }
  }

  // Styled Loading State
  if (isLoading) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </article>
    )
  }

  // Styled Error / Empty State
  if (error || !booking) {
    return (
      <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
            ℹ️
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            {error ? 'Submission Error' : 'No Reservation Selected'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {error ?? 'Select a court venue and date to generate your submission booking details.'}
          </p>
        </div>
      </article>
    )
  }

  const isApproved = booking.status === BookingStatus.Approved

  // Variant: Compact
  if (variant === 'compact') {
    return (
      <article className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            Badge #{booking.id}
          </span>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{courtName}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            isApproved
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          {isConfirming ? 'Processing' : booking.status}
        </span>
      </article>
    )
  }

  // Variant: Default / Detailed
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 border-t-4 border-t-indigo-600 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:border-t-indigo-500 dark:bg-slate-900">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Submission Badge #{booking.id}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Booking status summary</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold capitalize border ${
              isConfirming
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : isApproved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConfirming ? 'bg-amber-500 animate-ping' : isApproved ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            />
            {isConfirming ? 'Processing...' : booking.status}
          </span>
        </div>

        {/* Details Table */}
        <div className="space-y-2.5 rounded-lg bg-slate-50 p-4 border border-slate-100 text-xs dark:bg-slate-800/50 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Player Name</span>
            <span className="font-bold text-slate-900 dark:text-white">{userName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Court Venue</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{courtName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled Date</span>
            <span className="font-bold text-slate-900 dark:text-white">{booking.bookingDate.toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</span>
            <span className="font-bold text-slate-900 dark:text-white">{booking.durationHours} Hours</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</span>
            <span className="font-extrabold capitalize text-slate-900 dark:text-white">{booking.status}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-2.5 px-4 text-sm font-bold text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 flex items-center justify-center gap-2"
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming || isApproved}
        >
          {isConfirming ? (
            'Processing Request...'
          ) : isApproved ? (
            '✓ Submission Confirmed'
          ) : (
            'Confirm Submission'
          )}
        </button>

        {children && <div className="space-y-2 pt-1">{children}</div>}
      </div>
    </article>
  )
}
