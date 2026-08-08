import { useEffect, useRef, useState } from 'react'
import UserComponent from './components/User'
import BookingComponent from './components/Booking'
import CourtComponent from './components/Court'
import usePrevious from './hooks/usePrevious'
import useToggle from './hooks/useToggle'
import { BookingStatus } from './types'
import type { Booking, Court, User } from './types'
import './App.css'

const createMockUser = (): User => ({
  id: 1,
  name: 'Ana Arriola',
  email: 'arriolaana@gmail.com',
  role: 'player',
  isActive: true,
})

const createMockCourts = (): Court[] => [
  { id: 1, name: 'Court A', location: 'Main Gym', isAvailable: true },
  { id: 2, name: 'Court B', location: 'Main Gym', isAvailable: true },
  { id: 3, name: 'Court C', location: 'Main Gym', isAvailable: false },
]

const createMockBooking = (courtId: number, userId: number): Booking => ({
  id: 1,
  userId,
  courtId,
  bookingDate: new Date(),
  durationHours: 2,
  status: BookingStatus.Pending,
})

const getTodayInputValue = () => new Date().toISOString().slice(0, 10)
const STORAGE_KEYS = {
  courtId: 'badminton-selected-court',
  booking: 'badminton-booking',
  date: 'badminton-booking-date',
}

const readStoredBooking = (): Booking | null => {
  const storedBookingValue = window.localStorage.getItem(STORAGE_KEYS.booking)
  if (!storedBookingValue) return null

  try {
    const storedBooking = JSON.parse(storedBookingValue) as Booking
    return { ...storedBooking, bookingDate: new Date(storedBooking.bookingDate) }
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.booking)
    return null
  }
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayInputValue)
  const [user, setUser] = useState<User | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [showBookingNote, toggleShowBookingNote] = useToggle(false)
  const [isDarkMode, toggleDarkMode] = useToggle(
    window.localStorage.getItem('badminton-theme') === 'dark'
  )
  const previousSearchQuery = usePrevious(searchQuery)
  const previousSelectedCourt = usePrevious(selectedCourt)

  // Sync class-based dark mode to documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('badminton-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('badminton-theme', 'light')
    }
  }, [isDarkMode])

  // useEffect to load mock data on component mount
  useEffect(() => {
    setStatusMessage('Fetching court data...')

    // Simulate async data fetching on mount
    const timer = setTimeout(() => {
      const loadedUser = createMockUser()
      const loadedCourts = createMockCourts()
      const storedCourtId = Number(window.localStorage.getItem(STORAGE_KEYS.courtId))
      const restoredBooking = readStoredBooking() ?? createMockBooking(loadedCourts[0].id, loadedUser.id)
      const restoredCourt = loadedCourts.find((court) => court.id === storedCourtId) ??
        loadedCourts.find((court) => court.id === restoredBooking.courtId) ?? loadedCourts[0]

      setUser(loadedUser)
      setCourtsList(loadedCourts)
      setSelectedCourt(restoredCourt)
      setSelectedDate(window.localStorage.getItem(STORAGE_KEYS.date) ?? restoredBooking.bookingDate.toISOString().slice(0, 10))
      setBooking(restoredBooking)
      setHasLoaded(true)
      setStatusMessage(storedCourtId || window.localStorage.getItem(STORAGE_KEYS.booking) ? 'Your saved reservation was restored' : 'Mock data loaded successfully!')
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hasLoaded) return

    if (selectedCourt) {
      window.localStorage.setItem(STORAGE_KEYS.courtId, String(selectedCourt.id))
    }
    window.localStorage.setItem(STORAGE_KEYS.date, selectedDate)
    if (booking) {
      window.localStorage.setItem(STORAGE_KEYS.booking, JSON.stringify(booking))
    }
  }, [booking, hasLoaded, selectedCourt, selectedDate])

  useEffect(() => {
    if (previousSelectedCourt && selectedCourt && previousSelectedCourt.id !== selectedCourt.id) {
      setStatusMessage(`Selected court changed from ${previousSelectedCourt.name} to ${selectedCourt.name}`)
    }
  }, [selectedCourt, previousSelectedCourt])

  useEffect(() => {
    if (previousSearchQuery !== undefined && previousSearchQuery !== searchQuery) {
      setStatusMessage(
        searchQuery.trim()
          ? `Search updated from "${previousSearchQuery}" to "${searchQuery}"`
          : 'Search cleared'
      )
    }
  }, [searchQuery, previousSearchQuery])

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

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setStatusMessage(`Booking date set to ${new Date(`${date}T12:00:00`).toLocaleDateString()}`)
  }

  const handleConfirmBooking = (bookingId: number) => {
    if (isConfirming) return

    if (!user?.isActive) {
      setStatusMessage('Cannot confirm booking: user account is inactive')
      return
    }

    if (!selectedCourt) {
      setStatusMessage('Cannot confirm booking: No court selected')
      return
    }

    if (!selectedCourt.isAvailable) {
      setStatusMessage(`Cannot confirm booking: ${selectedCourt.name} is unavailable`)
      return
    }

    if (booking?.status === BookingStatus.Approved) {
      setStatusMessage(`Booking ${booking.id} is already confirmed`)
      return
    }

    const requestedDate = new Date(`${selectedDate}T12:00:00`)
    const today = new Date(`${getTodayInputValue()}T12:00:00`)
    const latestBookableDate = new Date(today)
    latestBookableDate.setDate(today.getDate() + 30)

    if (Number.isNaN(requestedDate.getTime()) || requestedDate < today) {
      setStatusMessage('Cannot confirm booking: choose today or a future date')
      return
    }

    if (requestedDate > latestBookableDate) {
      setStatusMessage('Cannot confirm booking: reservations are limited to 30 days ahead')
      return
    }

    setIsConfirming(true)
    setStatusMessage('Checking court availability and creating your reservation...')

    window.setTimeout(() => {
      setBooking((current) => {
        const previousBooking = current ?? createMockBooking(selectedCourt.id, user.id)

        return {
          ...previousBooking,
          bookingDate: requestedDate,
          courtId: selectedCourt.id,
          status: BookingStatus.Approved,
        }
      })

      setIsConfirming(false)
      setStatusMessage(`Booking ${bookingId} confirmed for ${selectedCourt.name} on ${requestedDate.toLocaleDateString()}`)
    }, 700)
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <main className="min-h-screen bg-[#EAF6EC] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-300">
        {/* Navbar Header - #064A8C Dark Blue */}
        <header className="bg-[#064A8C] dark:bg-slate-950 text-white shadow-md border-b-2 border-[#00224f] dark:border-slate-800 py-4 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Brand Header */}
            <div className="flex items-center gap-3.5">
              <span className="bg-[#078A63] text-white px-4 py-1.5 text-base sm:text-lg font-black uppercase tracking-wider rounded-lg shadow-sm">
                BAMICOURT
              </span>
              <span className="text-sm sm:text-base font-bold text-blue-100 dark:text-blue-200">Badminton Court Booking System</span>
            </div>

            {/* Class-Based Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 rounded-lg bg-[#078A63] hover:bg-[#065f46] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#078A63]"
              title="Toggle Class-Based Dark Mode"
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>

        {/* Main Container - max-w-7xl Centered */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Prominent Booking Hero Section */}
          <div className="mb-6 rounded-xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#0876D1] bg-white dark:bg-slate-800 p-5 shadow-lg transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-1 rounded bg-[#EAF6EC] dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 mb-1">
                  🏸 Court Reservation Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
                  RESERVE YOUR COURT
                </h1>
                <p className="text-xs font-bold italic text-slate-600 dark:text-slate-300 mt-1">
                  Select your court, pick your schedule, and manage your booking session.
                </p>
              </div>

              {/* Integrated Search Box */}
              <div className="flex min-w-0 flex-1 max-w-md gap-2">
                <input
                  className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-[#F5FAF6] dark:bg-slate-700 px-3.5 py-2 text-xs font-extrabold text-[#064A8C] dark:text-white outline-none placeholder:text-slate-400 focus:border-[#0876D1] focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#0876D1]/20 shadow-sm"
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search court by name (e.g. Court A)..."
                />
                <button
                  className="shrink-0 rounded-lg bg-[#0876D1] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#064A8C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0876D1]"
                  type="button"
                  onClick={handleFocusSearchInput}
                >
                  Focus Search
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Step Indicator */}
          <div className="mb-6 flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-3.5 shadow-md border-2 border-slate-300 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#064A8C] dark:bg-blue-600 text-xs font-black text-white">1</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#064A8C] dark:text-blue-300">Player Profile</span>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-[#0876D1]/30 dark:bg-slate-600 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0876D1] text-xs font-black text-white shadow-sm">2</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0876D1] dark:text-blue-400">Choose Court</span>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-[#078A63]/30 dark:bg-slate-600 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#078A63] text-xs font-black text-white">3</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400">Confirmation Ticket</span>
            </div>
          </div>

          {/* 3 Connected Workflow Cards - Responsive Grid (base: 1 col, sm: 2 cols, lg: 3 cols) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <UserComponent user={user} isLoading={user === null} compact={false} />
            <CourtComponent
              court={selectedCourt}
              courts={filteredCourts}
              selectedDate={selectedDate}
              onCourtChange={handleSelectCourt}
              onDateChange={handleDateChange}
              isLoading={courtsList.length === 0}
            />
            <BookingComponent
              booking={booking}
              userName={user?.name ?? 'Unknown User'}
              courtName={selectedCourt?.name ?? 'None'}
              onConfirm={handleConfirmBooking}
              isConfirming={isConfirming}
            >
              <button
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-[#F5FAF6] dark:bg-slate-700 py-2 px-3 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0876D1]"
                type="button"
                onClick={toggleShowBookingNote}
              >
                {showBookingNote ? 'Hide Booking Note' : 'Show Booking Note'}
              </button>
              {showBookingNote && (
                <div className="rounded-lg bg-[#EAF6EC] dark:bg-slate-700 border border-[#078A63]/40 p-3 text-xs font-semibold text-[#078A63] dark:text-emerald-300">
                  Note: Reservation for <strong>{user?.name ?? 'Unknown User'}</strong> is subject to facility rules.
                </div>
              )}
            </BookingComponent>
          </section>

          {/* Footer Log Bar */}
          <footer className="mt-6 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-md flex items-center justify-center gap-3 transition-colors duration-300">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-extrabold text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30">
              <span className="h-2 w-2 rounded-full bg-[#078A63] animate-pulse" />
              System Log:
            </span>
            <span className="rounded-lg bg-[#F5FAF6] dark:bg-slate-700 px-3 py-1 text-xs font-black text-[#064A8C] dark:text-blue-300 border border-slate-200 dark:border-slate-600 shadow-xs">
              {statusMessage}
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App