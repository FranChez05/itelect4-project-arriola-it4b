import { BookingStatus, type Booking } from '../types'

export function bookingDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function isCourtBookedOnDate(bookings: Booking[], courtId: number, date: string): boolean {
  if (!date) return false
  return bookings.some((booking) =>
    booking.courtId === courtId &&
    booking.status === BookingStatus.Approved &&
    bookingDateKey(booking.bookingDate) === date
  )
}
