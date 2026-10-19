import { useState } from 'react'
import type { Booking } from '../types'
import { BookingStatus } from '../types'

export interface UseBookingFilterReturn {
  bookings: Booking[]
  selectedBooking: Booking | null
  statusFilter: BookingStatus | 'all'
  filteredBookings: Booking[]
  setStatusFilter: (status: BookingStatus | 'all') => void
  selectBooking: (bookingId: number) => void
  confirmBooking: (bookingId: number, courtId: number, date: Date) => void
  setBookings: (bookings: Booking[]) => void
}

/**
 * Custom Hook: useBookingFilter
 * Manages bookings, status filtering, and booking confirmation updates.
 * Explicit return type: UseBookingFilterReturn
 */
export function useBookingFilter(initialBookings: Booking[] = []): UseBookingFilterReturn {
  const [bookings, setBookingsState] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    initialBookings.length > 0 ? initialBookings[0] : null
  )
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter)

  const selectBooking = (bookingId: number): void => {
    const found = bookings.find((b) => b.id === bookingId) ?? null
    setSelectedBooking(found)
  }

  const setBookings = (newBookings: Booking[]): void => {
    setBookingsState(newBookings)
    if (newBookings.length > 0) {
      setSelectedBooking(newBookings[0])
    }
  }

  const confirmBooking = (bookingId: number, courtId: number, date: Date): void => {
    setBookingsState((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              courtId,
              bookingDate: date,
              status: BookingStatus.Approved,
            }
          : b,
      ),
    )

    setSelectedBooking((prev) =>
      prev && prev.id === bookingId
        ? {
            ...prev,
            courtId,
            bookingDate: date,
            status: BookingStatus.Approved,
          }
        : prev,
    )
  }

  return {
    bookings,
    selectedBooking,
    statusFilter,
    filteredBookings,
    setStatusFilter,
    selectBooking,
    confirmBooking,
    setBookings,
  }
}
