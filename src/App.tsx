import { useEffect, useRef, useState } from 'react'
import UserComponent from './components/User'
import BookingComponent from './components/Booking'
import CourtComponent from './components/Court'
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
  // useRef DOM reference for an input element that can be focused
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. List Data State (Court[])
  const [courtsList, setCourtsList] = useState<Court[]>([])

  // 2. Selected Item State (Court | null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)

  // Primitive states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('Initializing system...')
  const [booking, setBooking] = useState<Booking>(mockBooking)

  // useEffect to load mock data on component mount
  useEffect(() => {
    setStatusMessage('Fetching court data...')

    // Simulate async data fetching on mount
    const timer = setTimeout(() => {
      setCourtsList(mockCourts)
      setSelectedCourt(mockCourts[0])
      setStatusMessage('Mock data loaded successfully!')
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  // Explicitly typed onChange handler using React.ChangeEvent<HTMLInputElement>
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchQuery(value)
    setStatusMessage(value ? `Searching: "${value}"` : 'Mock data loaded successfully!')
  }

  const handleFocusSearchInput = () => {
    // Focus the DOM input element directly using useRef
    searchInputRef.current?.focus()
  }

  // Derived value -- recomputed every render from state, not stored in state
  const filteredCourts = courtsList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectCourt = (courtId: number) => {
    const court = courtsList.find((c) => c.id === courtId) ?? null
    setSelectedCourt(court)
    setStatusMessage(court ? `Selected ${court.name}` : 'No court selected')
  }

  const handleConfirmBooking = (bookingId: number) => {
    if (!selectedCourt) {
      setStatusMessage('Cannot confirm booking: No court selected')
      return
    }

    if (!selectedCourt.isAvailable) {
      setStatusMessage(`Cannot confirm booking: ${selectedCourt.name} is unavailable`)
      return
    }

    setBooking((current) => ({
      ...current,
      courtId: selectedCourt.id,
      status: BookingStatus.Approved,
    }))

    setStatusMessage(`Booking ${bookingId} confirmed for ${selectedCourt.name}`)
  }

  return (
    <main className="app-shell">
      <header>
        <h1>🏸 Badminton Court Booking System 🏸</h1>
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search courts..."
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="button"
            onClick={handleFocusSearchInput}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Focus Search Input
          </button>
        </div>
      </header>

      <section className="cards-grid">
        <UserComponent user={mockUser} />
        <CourtComponent
          court={selectedCourt}
          courts={filteredCourts}
          selectedDate={new Date().toISOString().slice(0, 10)}
          onCourtChange={handleSelectCourt}
          onDateChange={() => { }}
        />
        <BookingComponent
          booking={booking}
          userName={mockUser.name}
          courtName={selectedCourt?.name ?? 'None'}
          onConfirm={handleConfirmBooking}
        >
          <p>Booked for {mockUser.name}</p>
        </BookingComponent>
      </section>

      <footer className="status-bar">
        Status: {statusMessage}
      </footer>
    </main>
  )
}

export default App