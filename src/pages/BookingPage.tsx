import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BookingComponent from '../components/Booking'
import { createBooking } from '../api/client'
import { useBookingStore } from '../store/useBookingStore'
import useToggle from '../hooks/useToggle'
import { BookingStatus } from '../types'
import type { Booking as BookingType, CreateBookingInput } from '../types'

const BookingPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const isLoading = useBookingStore((state) => state.isLoading)
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId)
  const setSelectedCourtId = useBookingStore((state) => state.setSelectedCourtId)
  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)
  const addBooking = useBookingStore((state) => state.addBooking)

  const [showNote, toggleShowNote] = useToggle(false)

  // useMutation that POSTs a new booking payload and calls invalidateQueries in onSuccess
  const bookingMutation = useMutation({
    mutationFn: (newBooking: CreateBookingInput) => createBooking(newBooking),
    onSuccess: () => {
      // Invalidate queries so TanStack Query refetches updated collections
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['courts'] })
      navigate('/my-bookings')
    },
  })

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? courts[0]

  const activeBookingPreview: BookingType | null = selectedCourt
    ? {
        id: 999,
        userId: user?.id ?? 1,
        courtId: selectedCourt.id,
        bookingDate: new Date(`${selectedDate}T12:00:00`),
        durationHours: 2,
        status: BookingStatus.Pending,
      }
    : null

  const handleSubmitBooking = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedCourt) return

    // Execute POST mutation
    bookingMutation.mutate({
      userId: user?.id ?? 1,
      courtId: selectedCourt.id,
      bookingDate: `${selectedDate}T12:00:00.000Z`,
      durationHours: 2,
      status: BookingStatus.Approved,
    })

    // Also update local store
    addBooking(selectedCourt.id, selectedDate)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#0876D1] bg-white dark:bg-slate-800 p-6 shadow-xl transition-colors duration-300">
        <span className="inline-flex items-center gap-1 rounded bg-[#EAF6EC] dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 mb-1">
          🎟️ Instant Court Reservation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
          BOOK YOUR MATCH SESSION
        </h1>
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
          Configure your reservation details, confirm your court, and lock in your schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Card */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-5">
          <h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-700 pb-3">
            Reservation Parameters
          </h2>

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            {/* Player Info Summary */}
            <div className="rounded-xl bg-[#F5FAF6] dark:bg-slate-700 p-4 border border-[#078A63]/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-[#078A63] dark:text-emerald-300">Active Player Account</p>
                <p className="text-sm font-black text-[#064A8C] dark:text-white">{user?.name ?? 'Loading...'} ({user?.email ?? '...'})</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-[#078A63] text-white rounded-md">
                {user?.role ?? 'player'}
              </span>
            </div>

            {/* Court Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Choose Facility Court
              </label>
              <select
                value={selectedCourtId}
                onChange={(e) => setSelectedCourtId(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20 shadow-sm"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.isAvailable}>
                    {c.name} - {c.location} ({c.isAvailable ? 'Available' : 'Unavailable'})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Match Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20 shadow-sm"
              />
            </div>

            {/* Duration Display */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Session Duration
              </label>
              <input
                type="text"
                disabled
                value="2 Hours Standard Match Block"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-200 cursor-not-allowed"
              />
            </div>

            {/* Toggle Booking Notes */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleShowNote}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-[#F5FAF6] dark:bg-slate-700 py-2.5 px-4 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {showNote ? '▲ Hide Rules & Notes' : '▼ Read Court Guidelines'}
              </button>

              {showNote && (
                <div className="mt-2.5 rounded-xl bg-[#EAF6EC] dark:bg-slate-700/80 border border-[#078A63]/40 p-4 text-xs font-medium text-[#078A63] dark:text-emerald-300 space-y-1">
                  <p className="font-bold uppercase">📋 Facility Rules:</p>
                  <p>• Non-marking rubber shoes are strictly mandatory on all court surfaces.</p>
                  <p>• Cancellations must be performed prior to scheduled match time.</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* GT2 Booking Ticket UI Component */}
        <div className="lg:col-span-1">
          <BookingComponent
            booking={activeBookingPreview}
            userName={user?.name ?? 'Unknown User'}
            courtName={selectedCourt?.name ?? 'None'}
            onConfirm={() => handleSubmitBooking()}
            isConfirming={bookingMutation.isPending}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default BookingPage
