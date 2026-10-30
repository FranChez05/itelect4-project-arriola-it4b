import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BookingBadge from './BookingBadge'
import { BookingStatus, type Booking } from '../types'

describe('BookingBadge', () => {
  it('shows the booking status from its typed booking prop', () => {
    const booking: Booking = {
      id: 17,
      userId: 4,
      courtId: 2,
      bookingDate: new Date('2026-10-30T00:00:00'),
      durationHours: 2,
      status: BookingStatus.Approved,
    }

    render(
      <BookingBadge
        booking={booking}
        userName="Alex Player"
        courtName="Court 2"
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByText('Status: approved')).toBeInTheDocument()
  })
})
