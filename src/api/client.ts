import type { Court, Booking, User } from '../types'
import type {
  ApiBooking,
  CreateCourtInput,
  CreateBookingInput,
  CreateUserInput,
} from '../types'

const BASE_URL = 'http://localhost:3001'

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
    bookingDate: new Date(apiBooking.bookingDate),
  }
}

// --- COURTS API ---
export async function getCourts(): Promise<Court[]> {
  const res = await fetch(`${BASE_URL}/courts`)
  return handleResponse<Court[]>(res)
}

export async function getCourtById(id: number): Promise<Court> {
  const res = await fetch(`${BASE_URL}/courts/${id}`)
  return handleResponse<Court>(res)
}

export async function createCourt(input: CreateCourtInput): Promise<Court> {
  const res = await fetch(`${BASE_URL}/courts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Court>(res)
}

// --- BOOKINGS API ---
export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/bookings`)
  const rawBookings = await handleResponse<ApiBooking[]>(res)
  return rawBookings.map(parseBooking)
}

export async function getBookingById(id: number): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings/${id}`)
  const rawBooking = await handleResponse<ApiBooking>(res)
  return parseBooking(rawBooking)
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const payload = {
    ...input,
    bookingDate:
      typeof input.bookingDate === 'string'
        ? input.bookingDate
        : input.bookingDate.toISOString(),
  }
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const rawBooking = await handleResponse<ApiBooking>(res)
  return parseBooking(rawBooking)
}

export async function deleteBooking(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error(`Failed to delete booking #${id}`)
  }
}

// --- USERS API ---
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`)
  return handleResponse<User[]>(res)
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`)
  return handleResponse<User>(res)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<User>(res)
}
