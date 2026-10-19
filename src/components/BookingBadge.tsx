import type * as React from 'react'
import type { Booking } from '../types'

interface BookingBadgeProps {
  booking: Booking
  userName: string
  courtName: string
  onConfirm: (bookingId: number) => void
  children?: React.ReactNode
}

const BookingBadge: React.FC<BookingBadgeProps> = ({
  booking,
  userName,
  courtName,
  onConfirm,
  children,
}) => {
  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onConfirm(booking.id)
  }

  return (
    <article className="card booking-card">
      <h2>Booking</h2>
      <p>User: {userName}</p>
      <p>Court: {courtName}</p>
      <p>Date: {booking.bookingDate.toLocaleDateString()}</p>
      <p>Duration: {booking.durationHours} hours</p>
      <p>Status: {booking.status}</p>
      <button type="button" onClick={handleConfirm}>
        Confirm booking
      </button>
      {children}
    </article>
  )
}

export default BookingBadge

