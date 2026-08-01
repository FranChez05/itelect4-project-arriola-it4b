import type * as React from 'react'
import type { Booking as BookingType } from '../types'

interface BookingProps {
  booking: BookingType | null
  userName: string
  courtName: string
  onConfirm: (bookingId: number) => void
  children?: React.ReactNode
}

const Booking: React.FC<BookingProps> = ({
  booking,
  userName,
  courtName,
  onConfirm,
  children,
}) => {
  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (booking) {
      onConfirm(booking.id)
    }
  }

  if (!booking) {
    return (
      <article className="card booking-card">
        <h2>No Booking Selected</h2>
      </article>
    )
  }

  return (
    <article className="card booking-card">
      <h2>Booking #{booking.id}</h2>
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

export default Booking