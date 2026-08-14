import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/useBookingStore'
import { BookingStatus } from '../types'

function MyBookingsEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center space-y-4 shadow-sm">
      <div className="text-4xl">📋</div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase">No Match Reservations Found</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You currently have no booking tickets matching this filter status.
        </p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="rounded-xl bg-[#0876D1] hover:bg-[#064A8C] text-white text-xs font-black uppercase tracking-wider px-4 py-2 shadow-md transition-colors"
      >
        Reserve Court Now →
      </button>
    </div>
  )
}

function MyBookingsSkeletonCard() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700/60 rounded-md" />
      <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
    </div>
  )
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate()
  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const bookings = useBookingStore((state) => state.bookings)
  const isLoading = useBookingStore((state) => state.isLoading)
  const cancelBooking = useBookingStore((state) => state.cancelBooking)

  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all')

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true
    return b.status === filterStatus
  })

  const getCourtName = (courtId: number) => {
    const court = courts.find((c) => c.id === courtId)
    return court ? `${court.name} (${court.location})` : `Court #${courtId}`
  }

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Approved:
        return (
          <span className="bg-[#EAF6EC] text-[#078A63] border border-[#078A63]/30 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-emerald-950 dark:text-emerald-300">
            ✓ Approved & Confirmed
          </span>
        )
      case BookingStatus.Pending:
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-amber-950 dark:text-amber-300">
            ⏳ Pending Verification
          </span>
        )
      case BookingStatus.Completed:
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-blue-950 dark:text-blue-300">
            ★ Completed Session
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#064A8C] bg-white dark:bg-slate-800 p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded bg-[#EAF6EC] dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 mb-1">
              📋 Reservation Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
              MY COURT BOOKINGS ({bookings.length})
            </h1>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
              View and manage all active reservations for player account <strong>{user?.name ?? 'Player'}</strong>.
            </p>
          </div>

          <Link
            to="/booking"
            className="shrink-0 rounded-xl bg-[#0876D1] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#064A8C] transition-colors"
          >
            + New Reservation
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterStatus === 'all'
              ? 'bg-[#064A8C] text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All Bookings ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus(BookingStatus.Approved)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterStatus === BookingStatus.Approved
              ? 'bg-[#078A63] text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Approved
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus(BookingStatus.Pending)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            filterStatus === BookingStatus.Pending
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Pending
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <MyBookingsSkeletonCard />
      ) : filteredBookings.length === 0 ? (
        <MyBookingsEmptyState onAction={() => navigate('/booking')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-[#0876D1] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0876D1] uppercase tracking-wider">
                    Ticket #{b.id}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <div className="rounded-xl bg-[#F5FAF6] dark:bg-slate-700/60 p-4 border border-slate-200 dark:border-slate-600 space-y-2">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Court Facility</p>
                    <p className="text-base font-black text-[#064A8C] dark:text-blue-300">
                      {getCourtName(b.courtId)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-600">
                    <p>📅 <strong>Date:</strong> {new Date(b.bookingDate).toLocaleDateString()}</p>
                    <p>⏱️ <strong>Duration:</strong> {b.durationHours} Hours</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  Player ID: {b.userId}
                </span>

                <button
                  type="button"
                  onClick={() => cancelBooking(b.id)}
                  className="rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
