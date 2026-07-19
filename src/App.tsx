import { useState } from 'react'
import UserComponent from '../src/components/User'
import BookingComponent from '../src/components/Booking'
import CourtComponent from '../src/components/Court'
import { BookingStatus } from './types'
import type { Booking, Court, User } from './types'
import './App.css'

const mockUser: User = {
  id: 1,
  name: 'Ana Arriola',
  email: 'arriolaana@gmail.com',
  role: 'player',
  isActive: true,
}

const mockCourts: Court[] = [
  { id: 1, name: 'Court A', location: 'Main Gym', isAvailable: true },
  { id: 2, name: 'Court B', location: 'Main Gym', isAvailable: true },
  { id: 3, name: 'Court C', location: 'Main Gym', isAvailable: false },
]

const mockBooking: Booking = {
  id: 1,
  userId: mockUser.id,
  courtId: mockCourts[0].id,
  bookingDate: new Date(),
  durationHours: 2,
  status: BookingStatus.Pending,
}

function App() {
  const [selectedCourtId, setSelectedCourtId] = useState<number>(mockCourts[0].id)
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [booking, setBooking] = useState<Booking>(mockBooking)
  const [statusMessage, setStatusMessage] = useState('No actions yet')

  const selectedCourt = mockCourts.find((court) => court.id === selectedCourtId) ?? mockCourts[0]
  const isCourtAvailable = selectedCourt.isAvailable

  const handleSelectCourt = (courtId: number) => {
    setSelectedCourtId(courtId)
    setStatusMessage(`Selected ${mockCourts.find((court) => court.id === courtId)?.name ?? 'court'}`)
  }

  const handleDateChange = (date: string) => {
    setBookingDate(date)
    setStatusMessage(`Selected date ${date}`)
  }

  const handleConfirmBooking = (bookingId: number) => {
    if (!isCourtAvailable) {
      setStatusMessage(`Cannot confirm booking: ${selectedCourt.name} is unavailable`)
      return
    }

    setBooking((currentBooking) =>
      currentBooking.id === bookingId
        ? {
            ...currentBooking,
            courtId: selectedCourt.id,
            bookingDate: new Date(bookingDate),
            status: BookingStatus.Approved,
          }
        : currentBooking,
    )
    setStatusMessage(`Booking ${bookingId} confirmed for ${selectedCourt.name}`)
  }

  return (
    <main className="app-shell">
      <header>
        <h1>🏸Badminton Court Booking System🏸 </h1>
      </header>

      <section className="cards-grid">
        <UserComponent user={mockUser} />
        <CourtComponent
          court={selectedCourt}
          courts={mockCourts}
          selectedDate={bookingDate}
          onCourtChange={handleSelectCourt}
          onDateChange={handleDateChange}
        />
        <BookingComponent
          booking={booking}
          userName={mockUser.name}
          courtName={selectedCourt.name}
          onConfirm={handleConfirmBooking}
        >
          <p>Booked for {mockUser.name}</p>
        </BookingComponent>
      </section>

      <footer className="status-bar">Status: {statusMessage}</footer>
    </main>
  )
}

export default App
