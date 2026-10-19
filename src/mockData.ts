import { BookingStatus } from './types'
import type { Booking, Court, User } from './types'

export const mockUser: User = {
  id: 1,
  name: 'Ana Arriola',
  email: 'arriolaana@gmail.com',
  role: 'player',
  isActive: true,
}

export const mockCourts: Court[] = [
  { id: 1, name: 'Court A', location: 'Main Gym', isAvailable: true },
  { id: 2, name: 'Court B', location: 'Main Gym', isAvailable: true },
  { id: 3, name: 'Court C', location: 'Main Gym', isAvailable: false },
]

export const buildMockBooking = (userId: number, courtId: number): Booking => ({
  id: 1,
  userId,
  courtId,
  bookingDate: new Date(),
  durationHours: 2,
  status: BookingStatus.Pending,
})

export const loadMockData = async () => {
  return await new Promise<{
    user: User
    courts: Court[]
    booking: Booking
  }>((resolve) => {
    window.setTimeout(() => {
      const initialBooking = buildMockBooking(mockUser.id, mockCourts[0].id)

      resolve({
        user: mockUser,
        courts: mockCourts,
        booking: initialBooking,
      })
    }, 600)
  })
}
