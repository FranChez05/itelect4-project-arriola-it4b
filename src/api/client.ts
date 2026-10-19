import type { Court, Booking, User } from '../types'
import { BookingStatus } from '../types'
import type {
  ApiBooking,
  CreateCourtInput,
  CreateBookingInput,
  CreateUserInput,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`)
  }
  return response.json() as Promise<T>
}

export function parseBooking(apiBooking: ApiBooking): Booking {
  return {
    ...apiBooking,
    id: Number(apiBooking.id),
    userId: Number(apiBooking.userId),
    courtId: Number(apiBooking.courtId),
    bookingDate: new Date(apiBooking.bookingDate),
  }
}

export function parseCourt(court: Court): Court {
  return {
    ...court,
    id: Number(court.id),
  }
}

export function parseUser(user: User): User {
  return {
    ...user,
    id: Number(user.id),
  }
}

const FALLBACK_COURTS: Court[] = [
  { id: 1, name: 'Court A - Main Arena', location: 'Main Gym (Wood Floor)', isAvailable: true },
  { id: 2, name: 'Court B - Side Arena', location: 'Main Gym (Rubber Floor)', isAvailable: true },
  { id: 3, name: 'Court C - VIP Hall', location: 'VIP Complex (AC Room)', isAvailable: false },
  { id: 4, name: 'Court D - Outdoor Arena', location: 'East Annex (Synthetics)', isAvailable: true },
]

// --- COURTS API ---
export async function getCourts(): Promise<Court[]> {
  try {
    const res = await fetch(`${BASE_URL}/courts`)
    const courts = await handleResponse<Court[]>(res)
    return courts.map(parseCourt)
  } catch (err) {
    console.warn('API /courts unreachable, falling back to local facility data:', err)
    return FALLBACK_COURTS
  }
}

export async function getCourtById(id: number): Promise<Court> {
  try {
    const res = await fetch(`${BASE_URL}/courts/${id}`)
    const court = await handleResponse<Court>(res)
    return parseCourt(court)
  } catch (err) {
    console.warn(`API /courts/${id} unreachable, falling back to local facility data:`, err)
    const match = FALLBACK_COURTS.find((c) => c.id === id)
    if (match) return match
    throw err
  }
}

export async function createCourt(input: CreateCourtInput): Promise<Court> {
  const res = await fetch(`${BASE_URL}/courts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const court = await handleResponse<Court>(res)
  return parseCourt(court)
}

const INITIAL_LOCAL_BOOKINGS: ApiBooking[] = [
  {
    id: 102,
    userId: 1,
    courtId: 2,
    bookingDate: '2026-08-23T12:00:00.000Z',
    durationHours: 1,
    status: BookingStatus.Cancelled,
  },
  {
    id: 103,
    userId: 1,
    courtId: 1,
    bookingDate: '2026-08-30T12:00:00.000Z',
    durationHours: 2,
    status: BookingStatus.Cancelled,
  },
  {
    id: 105,
    userId: 1,
    courtId: 2,
    bookingDate: '2026-09-04T12:00:00.000Z',
    durationHours: 2,
    status: BookingStatus.Approved,
  },
  {
    id: 106,
    userId: 1,
    courtId: 1,
    bookingDate: '2026-09-04T12:00:00.000Z',
    durationHours: 2,
    status: BookingStatus.Pending,
  },
  {
    id: 107,
    userId: 1,
    courtId: 1,
    bookingDate: '2026-09-05T12:00:00.000Z',
    durationHours: 2,
    status: BookingStatus.Pending,
  },
]

export function getLocalStoredBookings(): ApiBooking[] {
  try {
    const raw = window.localStorage.getItem('itelect4_local_bookings')
    if (raw) {
      return JSON.parse(raw) as ApiBooking[]
    }
  } catch {
    // ignore
  }
  return INITIAL_LOCAL_BOOKINGS
}

export function saveLocalStoredBookings(bookings: ApiBooking[]): void {
  try {
    window.localStorage.setItem('itelect4_local_bookings', JSON.stringify(bookings))
  } catch {
    // ignore
  }
}

// --- BOOKINGS API ---
export async function getBookings(): Promise<Booking[]> {
  try {
    const res = await fetch(`${BASE_URL}/bookings`)
    const rawBookings = await handleResponse<ApiBooking[]>(res)
    if (Array.isArray(rawBookings) && rawBookings.length > 0) {
      saveLocalStoredBookings(rawBookings)
    }
    return rawBookings.map(parseBooking)
  } catch (err) {
    console.warn('API /bookings unreachable, falling back to local stored reservations:', err)
    return getLocalStoredBookings().map(parseBooking)
  }
}

export async function getBookingById(id: number): Promise<Booking> {
  try {
    const res = await fetch(`${BASE_URL}/bookings/${id}`)
    const rawBooking = await handleResponse<ApiBooking>(res)
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn(`API /bookings/${id} unreachable, using local reservation:`, err)
    const local = getLocalStoredBookings().find((b) => Number(b.id) === id)
    if (local) return parseBooking(local)
    throw err
  }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const payload = {
    ...input,
    bookingDate:
      typeof input.bookingDate === 'string'
        ? input.bookingDate
        : input.bookingDate.toISOString(),
  }
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const rawBooking = await handleResponse<ApiBooking>(res)
    const current = getLocalStoredBookings()
    saveLocalStoredBookings([rawBooking, ...current])
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn('API /bookings POST failed, saving reservation locally:', err)
    const newLocalBooking: ApiBooking = {
      id: Date.now(),
      userId: input.userId,
      courtId: input.courtId,
      bookingDate: payload.bookingDate,
      durationHours: input.durationHours,
      status: input.status,
    }
    const current = getLocalStoredBookings()
    saveLocalStoredBookings([newLocalBooking, ...current])
    return parseBooking(newLocalBooking)
  }
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
  try {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const rawBooking = await handleResponse<ApiBooking>(res)
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn(`API /bookings/${id} PATCH failed, updating reservation locally:`, err)
    const current = getLocalStoredBookings()
    const updated = current.map((b) => (Number(b.id) === id ? { ...b, status } : b))
    saveLocalStoredBookings(updated)
    const target = updated.find((b) => Number(b.id) === id)
    if (target) return parseBooking(target)
    throw err
  }
}

export async function deleteBooking(id: number): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      throw new Error(`Failed to delete booking #${id}`)
    }
  } catch (err) {
    console.warn(`API /bookings/${id} DELETE failed, deleting from local storage:`, err)
    const current = getLocalStoredBookings()
    saveLocalStoredBookings(current.filter((b) => Number(b.id) !== id))
  }
}

// --- USERS API ---
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`)
  const users = await handleResponse<User[]>(res)
  return users.map(parseUser)
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`)
  const user = await handleResponse<User>(res)
  return parseUser(user)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const user = await handleResponse<User>(res)
  return parseUser(user)
}
