import type { Court, Booking, User, AiReview } from '../types'
import { BookingStatus } from '../types'
import type {
  ApiBooking,
  CreateCourtInput,
  CreateBookingInput,
  CreateUserInput,
} from '../types'
import { useAuthStore } from '../store/authStore'

const ENV_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:4000')
).replace(/\/+$/, '')

const API_URL = ENV_URL ? (ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`) : '/api'

export interface RequestOptions extends RequestInit {
  isPrivate?: boolean
  timeoutMs?: number
}

/**
 * Universal request helper that reads VITE_API_URL and automatically attaches
 * the Bearer token authorization header on private calls.
 */
export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { isPrivate = true, timeoutMs = 10000, headers: customHeaders, ...fetchOptions } = options
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

  const controller = new AbortController()
  const callerSignal = fetchOptions.signal
  const abortFromCaller = () => controller.abort()
  if (callerSignal?.aborted) controller.abort()
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true })
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })
  } finally {
    globalThis.clearTimeout(timeoutId)
    callerSignal?.removeEventListener('abort', abortFromCaller)
  }

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
const COURTS_STORAGE_KEY = 'itelect4_local_courts'
const DELETED_COURTS_KEY = 'itelect4_deleted_courts'
function getDeletedCourtIds(): string[] {
  try { return JSON.parse(window.localStorage.getItem(DELETED_COURTS_KEY) || '[]') as string[] } catch { return [] }
}
function markCourtDeleted(id: number | string): void {
  try { const ids = new Set(getDeletedCourtIds()); ids.add(String(id)); window.localStorage.setItem(DELETED_COURTS_KEY, JSON.stringify([...ids])); window.localStorage.setItem(COURTS_STORAGE_KEY, JSON.stringify(readLocalCourts().filter((court) => String(court.id) !== String(id)))) } catch { /* Best effort for local-only mode. */ }
}
function readLocalCourts(): Court[] {
  try { return JSON.parse(window.localStorage.getItem(COURTS_STORAGE_KEY) || '[]') as Court[] }
  catch { return [] }
}
function saveLocalCourt(court: Court): void {
  try {
    const courts = readLocalCourts().filter((item) => String(item.id) !== String(court.id))
    window.localStorage.setItem(COURTS_STORAGE_KEY, JSON.stringify([court, ...courts]))
  } catch { /* Storage may be full; the current session still receives the court. */ }
}

export async function getCourts(): Promise<Court[]> {
  const localCourts = readLocalCourts()
  try {
    const serverCourts = (await request<Court[]>('/courts', { isPrivate: false })).map(parseCourt)
    const byId = new Map(serverCourts.map((court) => [String(court.id), court]))
    localCourts.forEach((court) => byId.set(String(court.id), { ...byId.get(String(court.id)), ...court }))
    return [...byId.values()].filter((court) => !getDeletedCourtIds().includes(String(court.id)))
  } catch (err) {
    console.warn('API /courts unreachable, using locally saved facility data:', err)
    return [...localCourts, ...FALLBACK_COURTS.filter((court) => !localCourts.some((saved) => String(saved.id) === String(court.id)))].filter((court) => !getDeletedCourtIds().includes(String(court.id)))
  }
}

export async function getCourtById(id: number | string): Promise<Court> {
  if (getDeletedCourtIds().includes(String(id))) throw new Error('This court has been removed.')
  const local = readLocalCourts().find((court) => String(court.id) === String(id))
  try {
    const court = parseCourt(await request<Court>(`/courts/${id}`, { isPrivate: false }))
    return local ? { ...court, ...local } : court
  } catch (err) {
    console.warn(`API /courts/${id} unavailable, checking local facility data:`, err)
    if (local) return local
    const match = FALLBACK_COURTS.find((c) => String(c.id) === String(id))
    if (match) return match
    throw err
  }
}

export async function createCourt(input: CreateCourtInput): Promise<Court> {
  try {
    const response = await request<Court>('/courts', {
      method: 'POST', isPrivate: true, body: JSON.stringify(input),
    })
    const court = { ...parseCourt(response), ...input }
    saveLocalCourt(court)
    return court
  } catch (err) {
    console.warn('API /courts POST failed, saving the new court in this browser:', err)
    const court: Court = { id: Date.now(), ...input }
    saveLocalCourt(court)
    return court
  }
}

export async function updateCourt(id: number | string, input: CreateCourtInput): Promise<Court> {
  try {
    const response = await request<Court>(`/courts/${id}`, {
      method: 'PATCH', isPrivate: true, body: JSON.stringify(input),
    })
    const court = { ...parseCourt(response), ...input }
    saveLocalCourt(court)
    return court
  } catch (err) {
    console.warn(`API /courts/${id} PATCH failed; updating it in this browser only:`, err)
    const existing = (await getCourts()).find((court) => String(court.id) === String(id))
    if (!existing) throw new Error('Court could not be found to edit.')
    const updated = { ...existing, ...input, id: existing.id }
    saveLocalCourt(updated)
    return updated
  }
}


export async function deleteCourt(id: number | string): Promise<boolean> {
  try {
    await request<void>(`/courts/${id}`, { method: 'DELETE', isPrivate: true })
    markCourtDeleted(id)
    return true
  } catch (err) {
    console.warn(`API /courts/${id} DELETE failed; removing it from this browser only:`, err)
    markCourtDeleted(id)
    return false
  }
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

function readSavedBookings(): ApiBooking[] {
  try { const raw = window.localStorage.getItem('itelect4_local_bookings'); return raw ? JSON.parse(raw) as ApiBooking[] : [] } catch { return [] }
}

const LOCAL_BOOKING_STATUS_KEY = 'itelect4_local_booking_status_overrides'
function readLocalBookingStatusOverrides(): Record<string, BookingStatus> {
  try { return JSON.parse(window.localStorage.getItem(LOCAL_BOOKING_STATUS_KEY) || '{}') as Record<string, BookingStatus> } catch { return {} }
}
function writeLocalBookingStatusOverrides(overrides: Record<string, BookingStatus>): void {
  try { window.localStorage.setItem(LOCAL_BOOKING_STATUS_KEY, JSON.stringify(overrides)) } catch { /* Browser storage can be unavailable. */ }
}
function setLocalBookingStatusOverride(id: number | string, status: BookingStatus): void {
  writeLocalBookingStatusOverrides({ ...readLocalBookingStatusOverrides(), [String(id)]: status })
}
function clearLocalBookingStatusOverride(id: number | string): void {
  const overrides = readLocalBookingStatusOverrides()
  delete overrides[String(id)]
  writeLocalBookingStatusOverrides(overrides)
}
const LOCAL_DELETED_BOOKINGS_KEY = 'itelect4_local_deleted_bookings'
function readDeletedBookingIds(): string[] {
  try { return JSON.parse(window.localStorage.getItem(LOCAL_DELETED_BOOKINGS_KEY) || '[]') as string[] } catch { return [] }
}
function markBookingDeleted(id: number | string): void {
  const deleted = new Set(readDeletedBookingIds())
  deleted.add(String(id))
  try { window.localStorage.setItem(LOCAL_DELETED_BOOKINGS_KEY, JSON.stringify([...deleted])) } catch { /* Browser storage can be unavailable. */ }
}function mergeBookingsWithLocalStatus(serverBookings: ApiBooking[]): ApiBooking[] {
  const merged = new Map(readSavedBookings().map((booking) => [String(booking.id), booking]))
  serverBookings.forEach((booking) => merged.set(String(booking.id), booking))
  const deleted = new Set(readDeletedBookingIds())
  for (const id of deleted) merged.delete(id)
  const overrides = readLocalBookingStatusOverrides()
  for (const [id, booking] of merged) {
    const status = overrides[id]
    if (!status) continue
    if (booking.status === status) delete overrides[id]
    else merged.set(id, { ...booking, status })
  }
  writeLocalBookingStatusOverrides(overrides)
  return [...merged.values()]
}
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
    const serverBookings = await request<ApiBooking[]>('/bookings', { isPrivate: true })
    const merged = mergeBookingsWithLocalStatus(Array.isArray(serverBookings) ? serverBookings : [])
    saveLocalStoredBookings(merged)
    return merged.map(parseBooking)
  } catch (err) {
    console.warn('API /bookings unreachable, falling back to local stored reservations:', err)
    return mergeBookingsWithLocalStatus(getLocalStoredBookings()).map(parseBooking)
  }
}
// Admin endpoints return the complete facility queue. Older API deployments may
// expose the same role-authorized collection at /bookings instead.
export async function getAdminBookings(): Promise<Booking[]> {
  let serverBookings: ApiBooking[] | null = null
  try {
    serverBookings = await request<ApiBooking[]>('/admin/bookings', { isPrivate: true })
  } catch {
    try { serverBookings = await request<ApiBooking[]>('/bookings', { isPrivate: true }) }
    catch { serverBookings = null }
  }
  if (!serverBookings) {
    console.warn('Admin booking endpoints unavailable; using browser reservations.')
    return mergeBookingsWithLocalStatus(getLocalStoredBookings()).map(parseBooking)
  }
  const allBookings = mergeBookingsWithLocalStatus(serverBookings)
  saveLocalStoredBookings(allBookings)
  return allBookings.map(parseBooking)
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

export async function updateBookingStatus(id: number | string, status: BookingStatus): Promise<Booking & { localOnly?: boolean }> {
  try {
    const response = await request<ApiBooking>('/bookings/' + id, {
      method: 'PATCH',
      isPrivate: true,
      body: JSON.stringify({ status }),
    })
    // Keep the accepted status until a later GET confirms the server has it.
    // This prevents stale booking reads from undoing a successful UI action.
    setLocalBookingStatusOverride(id, response.status ?? status)
    const current = readSavedBookings()
    const existing = current.find((booking) => String(booking.id) === String(id))
    const responseId = (response as ApiBooking & { _id?: number | string })._id
    const rawBooking = {
      ...(existing || {}),
      ...response,
      id: response.id ?? responseId ?? existing?.id ?? Number(id),
      status: response.status ?? status,
    } as ApiBooking
    const updated = current.some((booking) => String(booking.id) === String(id))
      ? current.map((booking) => String(booking.id) === String(id) ? rawBooking : booking)
      : [rawBooking, ...current]
    saveLocalStoredBookings(updated)
    return parseBooking(rawBooking)
  } catch (err) {
    console.warn('API booking status update failed, updating reservation locally:', err)
    setLocalBookingStatusOverride(id, status)
    const current = getLocalStoredBookings()
    const updated = current.map((booking) => String(booking.id) === String(id) ? { ...booking, status } : booking)
    saveLocalStoredBookings(updated)
    const target = updated.find((booking) => String(booking.id) === String(id))
    if (target) return { ...parseBooking(target), localOnly: true }
    throw err
  }
}
export async function deleteBooking(id: number | string): Promise<{ localOnly: boolean }> {
  let localOnly = false
  try {
    await request<void>('/bookings/' + id, {
      method: 'DELETE',
      isPrivate: true,
    })
  } catch (err) {
    console.warn('API booking delete failed; deleting reservation from this browser:', err)
    localOnly = true
  }
  const current = getLocalStoredBookings()
  saveLocalStoredBookings(current.filter((booking) => String(booking.id) !== String(id)))
  clearLocalBookingStatusOverride(id)
  markBookingDeleted(id)
  return { localOnly }
}
// --- USERS API ---
const LOCAL_USERS_KEY = 'itelect4_local_users'
export function saveLocalStoredUser(user: User): void {
  try {
    const users = JSON.parse(window.localStorage.getItem(LOCAL_USERS_KEY) || '[]') as User[]
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([user, ...users.filter((item) => String(item.id) !== String(user.id))]))
  } catch { /* Continue if browser storage is unavailable. */ }
}
function getLocalStoredUsers(): User[] {
  try { return JSON.parse(window.localStorage.getItem(LOCAL_USERS_KEY) || '[]') as User[] }
  catch { return [] }
}

export async function getAdminUsers(): Promise<User[]> {
  let serverUsers: User[]
  try {
    serverUsers = (await request<User[]>('/admin/users', { isPrivate: true })).map(parseUser)
  } catch {
    serverUsers = (await request<User[]>('/users', { isPrivate: true })).map(parseUser)
  }
  const byId = new Map(serverUsers.map((user) => [String(user.id), user]))
  getLocalStoredUsers().forEach((user) => byId.set(String(user.id), { ...byId.get(String(user.id)), ...user }))
  return [...byId.values()]
}

export async function getUsers(): Promise<User[]> {
  try { return await getAdminUsers() }
  catch {
    const localUsers = getLocalStoredUsers()
    if (localUsers.length) return localUsers
    throw new Error('Could not load accounts. Check that the admin users API is available.')
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

// --- SESSION 11: AI booking readiness review ---
export async function askAi(prompt: string): Promise<AiReview> {
  return request<AiReview>('/ai', {
    method: 'POST',
    isPrivate: true,
    timeoutMs: 60000,
    body: JSON.stringify({ prompt }),
  })
}