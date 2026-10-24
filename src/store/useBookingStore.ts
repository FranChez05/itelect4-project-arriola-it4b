import { create } from 'zustand'
import { BookingStatus, type UserRole } from '../types'
import type { Booking, Court, User } from '../types'
import { getCourts, getBookings, getAdminBookings } from '../api/client'
import { useAuthStore } from './authStore'
import { isCourtBookedOnDate } from '../lib/courtAvailability'

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
  fetchData: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedCourtId: (courtId: number) => void
  setSelectedDate: (date: string) => void
  addBooking: (courtId: number, dateStr: string) => boolean
  cancelBooking: (bookingId: number) => void
  removeBooking: (bookingId: number) => void
  setBookingStatus: (bookingId: number, status: BookingStatus) => void
  upsertBooking: (booking: Booking) => void
  addCourt: (court: Court) => void
  updateCourt: (court: Court) => void
  removeCourt: (courtId: number) => void
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
    const authState = useAuthStore.getState()
    const authUser = authState.user
    set({ isLoading: true, statusMessage: 'Fetching data from API server...' })
    try {
      const bookingsRequest = authUser?.role === 'admin' ? getAdminBookings() : getBookings()
      const [courtsData, bookingsData] = await Promise.all([getCourts(), bookingsRequest])
      const activeUser: User | null = authUser ? {
        id: typeof authUser.id === 'number' ? authUser.id : (Number(authUser.id) || 1),
        name: authUser.name || authState.userName || 'Player',
        email: authUser.email || 'player@example.com',
        role: (authUser.role as UserRole) || 'player',
        isActive: true,
      } : null
      set({ courts: courtsData, bookings: bookingsData, user: activeUser, isLoading: false, statusMessage: 'Data loaded successfully from API!' })
    } catch (err) {
      console.warn('Could not load from API server, falling back to facility storage:', err)
      try {
        const fallbackCourts = await getCourts()
        const fallbackBookings = await getAdminBookings()
        set({
          courts: fallbackCourts,
          bookings: fallbackBookings,
          isLoading: false,
          statusMessage: 'Loaded reservation data from local facility storage.',
        })
      } catch {
        set({ isLoading: false, statusMessage: 'API unavailable.' })
      }
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

    if (!court.isAvailable || isCourtBookedOnDate(bookings, court.id, dateStr)) {
      set({ statusMessage: `Cannot book: ${court.name} is unavailable on ${dateStr}` })
      return false
    }

    const newBooking: Booking = {
      id: Date.now(),
      userId: user.id,
      courtId: court.id,
      bookingDate: new Date(`${dateStr}T12:00:00`),
      durationHours: 2,
      status: BookingStatus.Pending,
    }

    set({
      bookings: [newBooking, ...bookings],
      statusMessage: `Successfully reserved ${court.name} for ${dateStr}!`,
    })

    return true
  },

  setBookingStatus: (bookingId, status) => {
    set((state) => ({ bookings: state.bookings.map((b) => String(b.id) === String(bookingId) ? { ...b, status } : b), statusMessage: `Booking #${bookingId} ${status}` }))
  },

  upsertBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings.filter((item) => String(item.id) !== String(booking.id))] })),

  addCourt: (court) => {
    set((state) => ({ courts: [court, ...state.courts.filter((item) => item.id !== court.id)], statusMessage: `${court.name} added to court directory` }))
  },

  updateCourt: (court) => {
    set((state) => ({ courts: state.courts.map((item) => item.id === court.id ? court : item), statusMessage: `${court.name} updated` }))
  },

  removeCourt: (courtId) => {
    set((state) => ({ courts: state.courts.filter((court) => court.id !== courtId), statusMessage: `Court #${courtId} removed` }))
  },

  cancelBooking: (bookingId: number) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        String(b.id) === String(bookingId) ? { ...b, status: BookingStatus.Cancelled } : b
      ),
      statusMessage: `Booking #${bookingId} was marked as cancelled`,
    }))
  },

  removeBooking: (bookingId: number) => {
    set((state) => ({
      bookings: state.bookings.filter((booking) => String(booking.id) !== String(bookingId)),
      statusMessage: 'Booking #' + bookingId + ' was deleted',
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
