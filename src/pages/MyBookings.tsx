import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, updateBookingStatus } from '../api/client'
import { useBookingStore } from '../store/useBookingStore'
import { BookingStatus } from '../types'
import type { Booking } from '../types'

type TabKey = 'all' | 'pending' | 'approved' | 'declined' | 'cancelled' | 'completed'

function MyBookingsEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 space-y-4 shadow-sm">
      <div className="text-5xl flex items-center justify-center mx-auto">📋</div>
      <div className="space-y-1.5 flex flex-col items-center justify-center text-center mx-auto max-w-md">
        <h3 className="text-lg sm:text-xl font-black text-[#064A8C] dark:text-blue-300 uppercase text-center w-full">
          No Match Reservations Found
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center w-full">
          You currently have no booking tickets matching this filter status.
        </p>
      </div>
      <div className="flex justify-center w-full pt-1">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center rounded-xl bg-[#0876D1] hover:bg-[#064A8C] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          🏸 Reserve Court Now →
        </button>
      </div>
    </div>
  )
}

function MyBookingsSkeletonCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md space-y-4 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700/60 rounded-md" />
          <div className="h-10 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const setBookingStatus = useBookingStore((state) => state.setBookingStatus)
  const { data: allBookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: getBookings,
    refetchInterval: 5000,
  })
  const bookings = allBookings

  useEffect(() => {
    const handleSync = () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('itelect4-bookings-updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('itelect4-bookings-updated', handleSync)
    }
  }, [queryClient])

  const cancelMutation = useMutation({
    mutationFn: (id: number) => updateBookingStatus(id, BookingStatus.Cancelled),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['bookings'] })
      const previous = queryClient.getQueryData<Booking[]>(['bookings'])
      const previousStoreStatus = useBookingStore.getState().bookings.find((booking) => booking.id === id)?.status
      queryClient.setQueryData<Booking[]>(['bookings'], (current = []) =>
        current.map((booking) => String(booking.id) === String(id) ? { ...booking, status: BookingStatus.Cancelled } : booking)
      )
      setBookingStatus(id, BookingStatus.Cancelled)
      return { previous, previousStoreStatus }
    },
    onError: (_error, id, context) => {
      if (context?.previous) queryClient.setQueryData(['bookings'], context.previous)
      if (context?.previousStoreStatus) setBookingStatus(id, context.previousStoreStatus)
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: ['bookings'] }) },
  })

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)


  const filteredBookings = bookings.filter((b) => {
    switch (activeTab) {
      case 'pending': return b.status === BookingStatus.Pending
      case 'approved': return b.status === BookingStatus.Approved
      case 'declined': return b.status === BookingStatus.Declined
      case 'cancelled': return b.status === BookingStatus.Cancelled
      case 'completed': return b.status === BookingStatus.Completed
      default: return true
    }
  })
  const getCourtName = (courtId: number) => {
    const court = courts.find((c) => c.id === courtId)
    return court?.name ?? `Court #${courtId}`
  }

  const getCourtLocation = (courtId: number) => {
    const court = courts.find((c) => c.id === courtId)
    return court?.location ?? 'Unknown Location'
  }

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Approved:
        return (
          <span className="bg-[#EAF6EC] text-[#078A63] border border-[#078A63]/30 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-emerald-950 dark:text-emerald-300">
            ✓ Confirmed
          </span>
        )
      case BookingStatus.Pending:
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-amber-950 dark:text-amber-300">
            ⏳ Pending
          </span>
        )
      case BookingStatus.Declined:
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-rose-950 dark:text-rose-300">
            ✕ Declined
          </span>
        )
      case BookingStatus.Cancelled:
        return (
          <span className="bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-slate-700 dark:text-slate-300">
            ⊘ Cancelled
          </span>
        )
      case BookingStatus.Completed:
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 text-[10px] font-black uppercase rounded-full dark:bg-blue-950 dark:text-blue-300">
            ★ Completed
          </span>
        )
      default:
        return null
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Approved:
        return 'border-l-[#078A63]'
      case BookingStatus.Pending:
        return 'border-l-amber-500'
      case BookingStatus.Declined:
        return 'border-l-rose-500'
      case BookingStatus.Cancelled:
        return 'border-l-slate-400'
      case BookingStatus.Completed:
        return 'border-l-[#0876D1]'
      default:
        return 'border-l-slate-300'
    }
  }

  const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
    { key: 'all', label: 'All', icon: '📋', count: bookings.length },
    { key: 'pending', label: 'Pending', icon: '⏳', count: bookings.filter((b) => b.status === BookingStatus.Pending).length },
    { key: 'approved', label: 'Accepted', icon: '✓', count: bookings.filter((b) => b.status === BookingStatus.Approved).length },
    { key: 'declined', label: 'Declined', icon: '✕', count: bookings.filter((b) => b.status === BookingStatus.Declined).length },
    { key: 'cancelled', label: 'Cancelled', icon: '⊘', count: bookings.filter((b) => b.status === BookingStatus.Cancelled).length },
    { key: 'completed', label: 'Completed', icon: '✅', count: bookings.filter((b) => b.status === BookingStatus.Completed).length },
  ]
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
            className="shrink-0 rounded-xl bg-[#0876D1] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#064A8C] transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            + New Reservation
          </Link>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-md">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-[#064A8C] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BOOKINGS LIST ── */}
      {isLoading ? (
        <MyBookingsSkeletonCard />
      ) : filteredBookings.length === 0 ? (
        <MyBookingsEmptyState onAction={() => navigate('/booking')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border-2 border-l-[6px] ${getStatusColor(
                b.status
              )} border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group`}
            >
              {/* ── Ticket Header ── */}
              <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Shuttlecock icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#064A8C]/10 dark:bg-blue-900/30 text-lg group-hover:scale-110 transition-transform">
                    🏸
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0876D1] dark:text-blue-400">
                      Booking Ref #{b.id}
                    </p>
                    <h3 className="text-base font-black text-[#064A8C] dark:text-blue-300 uppercase">
                      {getCourtName(b.courtId)}
                    </h3>
                  </div>
                </div>
                {getStatusBadge(b.status)}
              </div>

              {/* ── Ticket Body (perforated divider) ── */}
              <div className="mx-5 border-t-2 border-dashed border-slate-200 dark:border-slate-600" />

              <div className="px-5 pt-3 pb-4 space-y-3">
                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/60 p-2.5 border border-slate-200 dark:border-slate-600 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">📅 Date</span>
                    <span className="block text-xs font-black text-[#064A8C] dark:text-blue-300 mt-0.5">
                      {new Date(b.bookingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/60 p-2.5 border border-slate-200 dark:border-slate-600 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">⏱️ Time</span>
                    <span className="block text-xs font-black text-[#078A63] dark:text-emerald-400 mt-0.5">
                      {b.durationHours}h Session
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/60 p-2.5 border border-slate-200 dark:border-slate-600 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">📍 Venue</span>
                    <span className="block text-[10px] font-black text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                      {getCourtLocation(b.courtId).split('(')[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === b.id && (
                  <div className="rounded-xl bg-[#F5FAF6] dark:bg-slate-700/40 p-4 border border-[#078A63]/20 dark:border-slate-600 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Full Venue</span>
                      <span className="font-black text-[#064A8C] dark:text-blue-300">{getCourtLocation(b.courtId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Full Date</span>
                      <span className="font-black text-slate-700 dark:text-slate-200">
                        {new Date(b.bookingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Player ID</span>
                      <span className="font-black text-slate-700 dark:text-slate-200">{b.userId}</span>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    className="text-xs font-black uppercase text-[#0876D1] dark:text-blue-400 hover:underline transition-colors"
                  >
                    {expandedId === b.id ? '▲ Hide Details' : '🔍 View Details'}
                  </button>

                  {b.status === BookingStatus.Cancelled || b.status === BookingStatus.Declined || b.status === BookingStatus.Completed ? (
                    <span className="text-[11px] font-bold text-slate-400 italic">
                      No actions available
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={cancelMutation.isPending && cancelMutation.variables === b.id}
                      onClick={() => {
                        if (window.confirm(b.status === BookingStatus.Pending ? 'Cancel this pending booking request?' : 'Are you sure you want to cancel this confirmed booking?')) {
                          cancelMutation.mutate(b.id)
                        }
                      }}
                      className="rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    >
                      {cancelMutation.isPending && cancelMutation.variables === b.id
                        ? '⏳ Cancelling...'
                        : b.status === BookingStatus.Pending ? '✕ Cancel request' : '✕ Cancel booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
