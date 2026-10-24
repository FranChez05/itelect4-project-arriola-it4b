import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBooking, getBookings, saveLocalStoredUser } from '../api/client'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/authStore'
import useToggle from '../hooks/useToggle'
import { BookingStatus } from '../types'
import { bookingSchema, type BookingFormData } from '../schemas/bookingSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateBookingInput } from '../types'
import { isCourtBookedOnDate } from '../lib/courtAvailability'

const STEPS = [
  { id: 1, label: 'Select Court', icon: '🏸' },
  { id: 2, label: 'Choose Schedule', icon: '📅' },
  { id: 3, label: 'Confirm Booking', icon: '✅' },
]

const BookingPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const upsertBooking = useBookingStore((state) => state.upsertBooking)
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId)
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: getBookings, refetchInterval: 15000 })
  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)

  const [showNote, toggleShowNote] = useToggle(false)
  const [currentStep, setCurrentStep] = useState(1)

  // useMutation that POSTs a new booking payload and calls invalidateQueries in onSuccess
  const bookingMutation = useMutation({
    mutationFn: (newBooking: CreateBookingInput) => createBooking(newBooking),
    onSuccess: (savedBooking) => {
      upsertBooking(savedBooking)
      // Invalidate queries so TanStack Query refetches updated collections
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['courts'] })
      navigate('/my-bookings')
    },
    onError: (error) => useBookingStore.getState().setStatusMessage(error instanceof Error ? error.message : 'Booking could not be saved to the server.'),
  })

  const getTodayDateStr = () => new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      courtId: selectedCourtId || courts[0]?.id || 1,
      bookingDate: selectedDate || getTodayDateStr(),
      durationHours: 2,
    },
  })

  // Keep form in sync when courts load
  useEffect(() => {
    if (courts.length > 0 && selectedCourtId) {
      setValue('courtId', selectedCourtId)
    } else if (courts.length > 0) {
      setValue('courtId', courts[0].id)
    }
  }, [courts, selectedCourtId, setValue])

  const watchedCourtId = watch('courtId')
  const watchedDate = watch('bookingDate')
  const watchedDuration = watch('durationHours')
  const selectedCourt = courts.find((c) => c.id === watchedCourtId) ?? courts[0]
  const selectedCourtBooked = !!selectedCourt && isCourtBookedOnDate(bookings, selectedCourt.id, watchedDate)
  const selectedCourtAvailable = !!selectedCourt?.isAvailable && !selectedCourtBooked

  useEffect(() => {
    if (watchedDate && watchedDate !== selectedDate) setSelectedDate(watchedDate)
  }, [watchedDate, selectedDate, setSelectedDate])

  // Update step indicator based on form state
  useEffect(() => {
    if (watchedCourtId && watchedDate) {
      setCurrentStep(3)
    } else if (watchedCourtId) {
      setCurrentStep(2)
    } else {
      setCurrentStep(1)
    }
  }, [watchedCourtId, watchedDate])

  // onSubmit only fires when Zod validation passes — invalid forms send NO request
  const onSubmit = (data: BookingFormData) => {
    const court = courts.find((c) => c.id === data.courtId)
    if (!court) return
    if (!court.isAvailable || isCourtBookedOnDate(bookings, court.id, data.bookingDate)) {
      useBookingStore.getState().setStatusMessage(`${court.name} is already booked on ${data.bookingDate}. Please choose another court or date.`)
      return
    }

    const authUser = useAuthStore.getState().user
    const studentId = authUser?.id ? (typeof authUser.id === 'number' ? authUser.id : (Number(authUser.id) || 1)) : (user?.id ?? 1)
    
    // Ensure player profile is known so admin dashboard displays student name and email
    if (authUser && authUser.email) {
      saveLocalStoredUser({
        id: studentId,
        name: authUser.name || authUser.email.split('@')[0] || 'Student Player',
        email: authUser.email,
        role: 'player',
        isActive: true,
      })
    }

    // Execute POST mutation with Pending status
    bookingMutation.mutate({
      userId: studentId,
      courtId: data.courtId,
      bookingDate: `${data.bookingDate}T12:00:00.000Z`,
      durationHours: data.durationHours,
      status: BookingStatus.Pending,
    })
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

      {/* ── STEP INDICATOR ── */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-black transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-[#0876D1] text-white shadow-lg shadow-[#0876D1]/30 scale-110'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider text-center ${currentStep >= step.id
                      ? 'text-[#0876D1] dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mt-[-20px]">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${currentStep > step.id
                        ? 'bg-[#0876D1]'
                        : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* LEFT: Form (larger area) */}
        <div className="lg:col-span-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-5">
          <h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center gap-2">
            <span className="text-xl">📋</span> Reservation Parameters
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Player Info Summary */}
            <div className="rounded-xl bg-[#F5FAF6] dark:bg-slate-700 p-4 border border-[#078A63]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064A8C] text-sm font-black text-white">
                  {user?.name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#078A63] dark:text-emerald-300">Active Player</p>
                  <p className="text-sm font-black text-[#064A8C] dark:text-white">{user?.name ?? 'Loading...'}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-[#078A63] text-white rounded-md">
                {user?.role ?? 'player'}
              </span>
            </div>

            {/* Court Selection */}
            <div>
              <Label
                htmlFor="booking-court"
                className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5"
              >
                🏟️ Choose Facility Court
              </Label>
              <select
                id="booking-court"
                {...register('courtId', { valueAsNumber: true })}
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20 shadow-sm transition-all"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.isAvailable || isCourtBookedOnDate(bookings, c.id, watchedDate)}>
                    {c.name} - {c.location} ({!c.isAvailable ? 'Unavailable' : isCourtBookedOnDate(bookings, c.id, watchedDate) ? `Booked on ${watchedDate}` : 'Available on date'})
                  </option>
                ))}
              </select>
              {errors.courtId && (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.courtId.message}
                </p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <Label
                htmlFor="booking-date"
                className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5"
              >
                📅 Match Date
              </Label>
              <Input
                id="booking-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                {...register('bookingDate', { onChange: (event) => setSelectedDate(event.target.value) })}
                className={`w-full rounded-xl border-2 px-4 py-3 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none shadow-sm transition-all ${watchedDate
                    ? 'border-[#0876D1] ring-2 ring-[#0876D1]/20 bg-blue-50/30 dark:bg-slate-700'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  } focus:border-[#0876D1] focus:ring-2 focus:ring-[#0876D1]/20`}
              />
              {selectedCourtBooked && <p className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-bold text-rose-700 dark:text-rose-300">This court is not available on {new Date(`${watchedDate}T12:00:00`).toLocaleDateString()}. Choose a different court or date.</p>}
              {errors.bookingDate && (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.bookingDate.message}
                </p>
              )}
            </div>

            {/* Duration Display */}
            <div>
              <Label
                htmlFor="booking-duration"
                className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1.5"
              >
                ⏱️ Session Duration
              </Label>
              <Input
                id="booking-duration"
                type="number"
                min={1}
                max={8}
                {...register("durationHours", { valueAsNumber: true })}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200"
              />
              {errors.durationHours && (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.durationHours.message}
                </p>
              )}
            </div>

            {/* Toggle Booking Notes */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={toggleShowNote}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-[#F5FAF6] dark:bg-slate-700 py-2.5 px-4 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {showNote ? '▲ Hide Rules & Notes' : '▼ Read Court Guidelines'}
              </Button>

              {showNote && (
                <div className="mt-2.5 rounded-xl bg-[#EAF6EC] dark:bg-slate-700/80 border border-[#078A63]/40 p-4 text-xs font-medium text-[#078A63] dark:text-emerald-300 space-y-1">
                  <p className="font-bold uppercase">📋 Facility Rules:</p>
                  <p>• Non-marking rubber shoes are strictly mandatory on all court surfaces.</p>
                  <p>• Cancellations must be performed prior to scheduled match time.</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={bookingMutation.isPending || !selectedCourtAvailable}
              className="w-full rounded-xl bg-[#078A63] hover:bg-[#065f46] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              {bookingMutation.isPending ? '⏳ Submitting Reservation...' : selectedCourtAvailable ? '🎟️ Confirm Reservation' : 'Court unavailable for this date'}
            </Button>
            {bookingMutation.isError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{bookingMutation.error instanceof Error ? bookingMutation.error.message : "The booking could not be saved."}</p>}
          </form>
        </div>

        {/* RIGHT: Booking Summary (smaller sticky card) */}
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
            {/* Summary Header */}
            <div className="bg-[#078A63] dark:bg-emerald-950 px-5 py-4 text-white flex items-center justify-between border-b-2 border-[#064A8C]">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#064A8C] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                  🎟️
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                  BOOKING SUMMARY
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 text-amber-950 border border-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-amber-900" />
                Preview
              </span>
            </div>

            {/* Summary Body */}
            <div className="p-5 space-y-4">
              {/* Mini Court Illustration */}
              <div className="overflow-hidden rounded-xl bg-[#064A8C]/5 dark:bg-slate-700/40 border border-[#064A8C]/10 dark:border-slate-600">
                {selectedCourt?.imageUrl ? <img src={selectedCourt.imageUrl} alt={selectedCourt.name} className="h-40 w-full object-cover" /> : <div className="flex h-28 items-center justify-center text-4xl">🏸</div>}
                <div className="p-4 text-left">
                  <p className="text-sm font-black text-[#064A8C] dark:text-blue-300 uppercase">{selectedCourt?.name ?? 'Select a Court'}</p>
                  {selectedCourt && <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">📍 {selectedCourt.location}</p>}
                  {selectedCourt?.description && <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selectedCourt.description}</p>}
                  {selectedCourt?.surface && <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">Floor: {selectedCourt.surface}</p>}
                  {selectedCourt?.amenities && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Amenities: {selectedCourt.amenities}</p>}
                </div>
              </div>

              {/* Details Grid */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-600">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">TICKET STUB</span>
                  <span className="font-black text-[#064A8C] dark:text-blue-300">#PREVIEW</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">PLAYER</span>
                  <span className="font-black text-[#064A8C] dark:text-blue-300">{user?.name ?? '...'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">VENUE</span>
                  <span className="font-black text-[#0876D1] dark:text-blue-400">
                    {selectedCourt?.name ?? 'None'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">DATE</span>
                  <span className={`font-black transition-colors ${watchedDate ? 'text-[#078A63] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                    {watchedDate
                      ? new Date(`${watchedDate}T12:00:00`).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                      : 'Not Set'}
                  </span>
                </div>

                <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-600 my-2 pt-2 flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">DURATION</span>
                  <span className="font-black text-[#078A63] dark:text-emerald-400">{watchedDuration} hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">STATUS</span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full">
                    ⏳ Pending
                  </span>
                </div>
              </div>

              {/* Availability Indicator */}
              <div
                className={`flex items-center justify-between rounded-xl p-3.5 border text-xs shadow-sm transition-colors ${selectedCourtAvailable
                    ? 'bg-[#EAF6EC] dark:bg-slate-700/60 border-[#078A63]/50 text-[#078A63] dark:text-emerald-400'
                    : 'bg-[#FEF2F2] dark:bg-slate-700/60 border-[#EF4444]/50 text-[#B91C1C] dark:text-red-400'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${selectedCourtAvailable ? 'bg-[#078A63] dark:bg-emerald-400 animate-pulse' : 'bg-[#EF4444]'}`} />
                  <span className="font-black text-xs">
                    {selectedCourt
                      ? selectedCourtAvailable
                        ? 'Available on selected date'
                        : selectedCourtBooked ? 'Already approved for this date' : 'Court unavailable'
                      : 'No Court Selected'}
                  </span>
                </div>
                <span className="font-black uppercase tracking-widest text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-current shadow-sm">
                  {selectedCourt ? (selectedCourtAvailable ? '✓ Ready' : '✕ Full') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
