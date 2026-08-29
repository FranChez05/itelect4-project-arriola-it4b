import { create } from 'zustand'
import { BookingStatus } from '../types'
import type { Booking, Court, User } from '../types'
import { getCourts, getBookings, getUsers } from '../api/client'

export interface BookingStoreState {
  // Data State
  user: User | null
  courts: Court[]
  bookings: Booking[]
  isLoading: boolean
  
  // Selection / Form State
  selectedCourtId: number
  selectedDate: string
  searchQuery: string
  statusMessage: string
  isDarkMode: boolean
  
  // Actions
  fetchData: () => void
  setSearchQuery: (query: string) => void
  setSelectedCourtId: (courtId: number) => void
  setSelectedDate: (date: string) => void
  addBooking: (courtId: number, dateStr: string) => boolean
  cancelBooking: (bookingId: number) => void
  toggleDarkMode: () => void
  setStatusMessage: (msg: string) => void
}

const getTodayDateStr = () => new Date().toISOString().slice(0, 10)

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  user: null,
  courts: [],
  bookings: [],
  isLoading: true,
  selectedCourtId: 1,
  selectedDate: getTodayDateStr(),
  searchQuery: '',
  statusMessage: 'Loading facility resources...',
  isDarkMode: window.localStorage.getItem('badminton-theme') === 'dark',

  fetchData: async () => {
    set({ isLoading: true, statusMessage: 'Fetching data from API server...' })
    try {
      const [courtsData, bookingsData, usersData] = await Promise.all([
        getCourts(),
        getBookings(),
        getUsers(),
      ])
      set({
        courts: courtsData,
        bookings: bookingsData,
        user: usersData[0] ?? null,
        isLoading: false,
        statusMessage: 'Data loaded successfully from API!',
      })
    } catch (err) {
      set({
        courts: [
          { id: 1, name: 'Court A - Main Arena', location: 'Main Gym (Wood Floor)', isAvailable: true },
          { id: 2, name: 'Court B - Side Arena', location: 'Main Gym (Rubber Floor)', isAvailable: true },
          { id: 3, name: 'Court C - VIP Hall', location: 'VIP Complex (AC Room)', isAvailable: false },
          { id: 4, name: 'Court D - Outdoor Arena', location: 'East Annex (Synthetics)', isAvailable: true },
        ],
        user: { id: 1, name: 'Ana Arriola', email: 'arriolaana@gmail.com', role: 'player', isActive: true },
        isLoading: false,
        statusMessage: `API Server offline — using cached data (${err instanceof Error ? err.message : 'offline'})`,
      })
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    if (query.trim()) {
      set({ statusMessage: `Searching courts for "${query}"` })
    } else {
      set({ statusMessage: 'Search cleared' })
    }
  },

  setSelectedCourtId: (courtId: number) => {
    const court = get().courts.find((c) => c.id === courtId)
    set({ selectedCourtId: courtId })
    if (court) {
      set({ statusMessage: `Selected ${court.name}` })
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date, statusMessage: `Booking date set to ${date}` })
  },

  addBooking: (courtId: number, dateStr: string) => {
    const { courts, user, bookings } = get()
    const court = courts.find((c) => c.id === courtId)

    if (!user || !user.isActive) {
      set({ statusMessage: 'Cannot book: Player account is inactive' })
      return false
    }

    if (!court) {
      set({ statusMessage: 'Cannot book: Selected court does not exist' })
      return false
    }

    if (!court.isAvailable) {
      set({ statusMessage: `Cannot book: ${court.name} is currently unavailable` })
      return false
    }

    const newBooking: Booking = {
      id: Date.now(),
      userId: user.id,
      courtId: court.id,
      bookingDate: new Date(`${dateStr}T12:00:00`),
      durationHours: 2,
      status: BookingStatus.Approved,
    }

    set({
      bookings: [newBooking, ...bookings],
      statusMessage: `Successfully reserved ${court.name} for ${dateStr}!`,
    })

    return true
  },

  cancelBooking: (bookingId: number) => {
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
      statusMessage: `Booking #${bookingId} was cancelled`,
    }))
  },

  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode
    set({ isDarkMode: nextDark })
    if (nextDark) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('badminton-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('badminton-theme', 'light')
    }
  },

  setStatusMessage: (msg: string) => set({ statusMessage: msg }),
}))
