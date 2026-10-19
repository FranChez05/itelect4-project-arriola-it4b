import type { Court, Booking, User } from '../types'
import { BookingStatus } from '../types'
import type {
  ApiBooking,
  CreateCourtInput,
  CreateBookingInput,
  CreateUserInput,
} from '../types'
import { useAuthStore } from '../store/authStore'

const ENV_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '')
const API_URL = ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`

export interface RequestOptions extends RequestInit {
  isPrivate?: boolean
}

/**
 * Universal request helper that reads VITE_API_URL and automatically attaches
 * the Bearer token authorization header on private calls.
 */
export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { isPrivate = true, headers: customHeaders, ...fetchOptions } = options
  const token = useAuthStore.getState().token

  const headers = new Headers(customHeaders || {})

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Attach Bearer header on every private call when token exists
  if (isPrivate && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_URL}${cleanEndpoint}`

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let errorMessage = text || `API Error ${response.status}: ${response.statusText}`
    try {
      const json = JSON.parse(text)
      if (json && typeof json === 'object') {
        errorMessage = json.error || json.message || errorMessage
      }
    } catch {
      // plain text message
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export function parseBooking(apiBooking: any): Booking {
  return {
    ...apiBooking,
    id: apiBooking.id ?? apiBooking._id,
    userId: apiBooking.userId,
    courtId: Number(apiBooking.courtId),
    bookingDate: new Date(apiBooking.bookingDate),
    durationHours: Number(apiBooking.durationHours),
    status: apiBooking.status as BookingStatus,
  }
}

export function parseCourt(court: any): Court {
  return {
    ...court,
    id: court.id ?? court._id,
  }
}

export function parseUser(user: any): User {
  return {
    ...user,
    id: user.id ?? user._id,
  }
}

const FALLBACK_COURTS: Court[] = [
  { id: 1, name: 'Court A - Main Arena', location: 'Main Gym (Wood Floor)', isAvailable: true },
  { id: 2, name: 'Court B - Side Arena', location: 'Main Gym (Rubber Floor)', isAvailable: true },
  { id: 3, name: 'Court C - VIP Hall', location: 'VIP Complex (AC Room)', isAvailable: false },
  { id: 4, name: 'Court D - Outdoor Arena', location: 'East Annex (Synthetics)', isAvailable: true },
]

// --- AUTH API ---
export interface LoginResponse {
  token: string
  user: {
    id: string
    role?: string
    name?: string
    email?: string
  }
}

export interface RegisterResponse {
  id: string
  name: string
  email: string
  role?: string
}

export async function loginApi(credentials: { email: string; password: string }): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    isPrivate: false,
    body: JSON.stringify(credentials),
  })
}

export async function registerApi(data: {
  name: string
  email: string
  password: string
  role?: string
}): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    isPrivate: false,
    body: JSON.stringify(data),
  })
}

// --- COURTS API ---
export async function getCourts(): Promise<Court[]> {
  try {
    const courts = await request<Court[]>('/courts', { isPrivate: false })
    return courts.map(parseCourt)
  } catch (err) {
    console.warn('API /courts unreachable, falling back to local facility data:', err)
    return FALLBACK_COURTS
  }
}

export async function getCourtById(id: number | string): Promise<Court> {
  try {
    const court = await request<Court>(`/courts/${id}`, { isPrivate: false })
    return parseCourt(court)
  } catch (err) {
    console.warn(`API /courts/${id} unreachable, falling back to local facility data:`, err)
    const match = FALLBACK_COURTS.find((c) => String(c.id) === String(id))
    if (match) return match
    throw err
  }
}

export async function createCourt(input: CreateCourtInput): Promise<Court> {
  const court = await request<Court>('/courts', {
    method: 'POST',
    isPrivate: true,
    body: JSON.stringify(input),
  })
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
    const rawBookings = await request<ApiBooking[]>('/bookings', { isPrivate: true })
    if (Array.isArray(rawBookings) && rawBookings.length > 0) {
      saveLocalStoredBookings(rawBookings)
    }
    return rawBookings.map(parseBooking)
  } catch (err) {
    console.warn('API /bookings unreachable, falling back to local stored reservations:', err)
    return getLocalStoredBookings().map(parseBooking)
  }
}

export async function getBookingById(id: number | string): Promise<Booking> {
  try {
    const rawBooking = await request<ApiBooking>(`/bookings/${id}`, { isPrivate: true })
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn(`API /bookings/${id} unreachable, using local reservation:`, err)
    const local = getLocalStoredBookings().find((b) => String(b.id) === String(id))
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
    const rawBooking = await request<ApiBooking>('/bookings', {
      method: 'POST',
      isPrivate: true,
      body: JSON.stringify(payload),
    })
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

export async function updateBookingStatus(id: number | string, status: BookingStatus): Promise<Booking> {
  try {
    const rawBooking = await request<ApiBooking>(`/bookings/${id}`, {
      method: 'PATCH',
      isPrivate: true,
      body: JSON.stringify({ status }),
    })
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn(`API /bookings/${id} PATCH failed, updating reservation locally:`, err)
    const current = getLocalStoredBookings()
    const updated = current.map((b) => (String(b.id) === String(id) ? { ...b, status } : b))
    saveLocalStoredBookings(updated)
    const target = updated.find((b) => String(b.id) === String(id))
    if (target) return parseBooking(target)
    throw err
  }
}

export async function deleteBooking(id: number | string): Promise<void> {
  try {
    await request<void>(`/bookings/${id}`, {
      method: 'DELETE',
      isPrivate: true,
    })
  } catch (err) {
    console.warn(`API /bookings/${id} DELETE failed, deleting from local storage:`, err)
    const current = getLocalStoredBookings()
    saveLocalStoredBookings(current.filter((b) => String(b.id) !== String(id)))
  }
}

// --- USERS API ---
export async function getUsers(): Promise<User[]> {
  try {
    const users = await request<User[]>('/users', { isPrivate: true })
    return users.map(parseUser)
  } catch {
    return [
      { id: 1, name: 'Ana Arriola', email: 'arriolaana@gmail.com', role: 'player', isActive: true },
    ]
  }
}

export async function getUserById(id: number | string): Promise<User> {
  const user = await request<User>(`/users/${id}`, { isPrivate: true })
  return parseUser(user)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const user = await request<User>('/users', {
    method: 'POST',
    isPrivate: true,
    body: JSON.stringify(input),
  })
  return parseUser(user)
}
