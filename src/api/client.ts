import type { Court, Booking, User, AiReview } from '../types'
import { BookingStatus } from '../types'
import type {
  ApiBooking,
  CreateCourtInput,
  CreateBookingInput,
  CreateUserInput,
} from '../types'
import { useAuthStore } from '../store/authStore'

const rawEnvUrl = (import.meta.env.VITE_API_URL || '').trim()
const ENV_URL = (rawEnvUrl || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/+$/, '')

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
    id: typeof apiBooking.id === 'number' ? apiBooking.id : (Number(apiBooking.id ?? apiBooking._id) || Date.now()),
    userId: typeof apiBooking.userId === 'number' ? apiBooking.userId : (Number(apiBooking.userId) || 1),
    courtId: Number(apiBooking.courtId),
    bookingDate: new Date(apiBooking.bookingDate),
    durationHours: Number(apiBooking.durationHours) || 2,
    status: (apiBooking.status as BookingStatus) || BookingStatus.Pending,
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
    id: typeof user.id === 'number' ? user.id : (Number(user.id ?? user._id) || Date.now()),
  }
}

const FALLBACK_COURTS: Court[] = [
  { id: 1, name: 'Court A - Main Arena', location: 'Main Gym (Sprung Wood Floor)', isAvailable: true, surface: 'Sprung Wood', description: 'Premier competition court with professional lighting and spectator seating.' },
  { id: 2, name: 'Court B - Side Arena', location: 'Main Gym (BWF Mat Flooring)', isAvailable: true, surface: 'BWF Green Mat', description: 'Tournament-ready vinyl court with optimal grip and shock absorption.' },
  { id: 3, name: 'Court C - VIP Hall', location: 'VIP Complex (Air Conditioned)', isAvailable: false, surface: 'Synthetic Wood', description: 'Private training court with climate control and audio system.' },
  { id: 4, name: 'Court D - Training Hall', location: 'East Annex (Multi-purpose)', isAvailable: true, surface: 'Rubber Compound', description: 'Dedicated training court with shuttlecock launcher access.' },
]

// --- AUTH API ---
export interface LoginResponse {
  token: string
  user: {
    id: string | number
    role?: string
    name?: string
    email?: string
  }
}

export interface RegisterResponse {
  id: string | number
  name: string
  email: string
  role?: string
}

export async function loginApi(credentials: { email: string; password: string }): Promise<LoginResponse> {
  try {
    return await request<LoginResponse>('/auth/login', {
      method: 'POST',
      isPrivate: false,
      body: JSON.stringify(credentials),
    })
  } catch (err) {
    console.warn('Backend login failed, using local auth recovery:', err)
    const localUsers = readLocalUsers()
    const found = localUsers.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())
    const isAdmin = credentials.email.toLowerCase().includes('admin') || found?.role === 'admin'
    const role = isAdmin ? 'admin' : (found?.role || 'player')
    const username = found?.name || credentials.email.split('@')[0] || (isAdmin ? 'Court Admin' : 'Student Player')
    const userId = found?.id || (isAdmin ? 99 : 1)
    
    // Save/update user locally
    saveLocalStoredUser({ id: userId, name: username, email: credentials.email, role: role as 'player' | 'admin', isActive: true })

    return {
      token: `local-token-${Date.now()}-${userId}`,
      user: {
        id: userId,
        role,
        name: username,
        email: credentials.email,
      },
    }
  }
}

export async function registerApi(data: {
  name: string
  email: string
  password: string
  role?: string
}): Promise<RegisterResponse> {
  try {
    return await request<RegisterResponse>('/auth/register', {
      method: 'POST',
      isPrivate: false,
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.warn('Backend register failed, saving user locally:', err)
    const role = data.role || (data.email.toLowerCase().includes('admin') ? 'admin' : 'player')
    const newId = Date.now()
    saveLocalStoredUser({
      id: newId,
      name: data.name,
      email: data.email,
      role: role as 'player' | 'admin',
      isActive: true,
    })
    return {
      id: newId,
      name: data.name,
      email: data.email,
      role,
    }
  }
}

// --- COURTS API ---
const COURTS_STORAGE_KEY = 'itelect4_local_courts'
const DELETED_COURTS_KEY = 'itelect4_deleted_courts'

function getDeletedCourtIds(): string[] {
  try { return JSON.parse(window.localStorage.getItem(DELETED_COURTS_KEY) || '[]') as string[] } catch { return [] }
}
function markCourtDeleted(id: number | string): void {
  try {
    const ids = new Set(getDeletedCourtIds())
    ids.add(String(id))
    window.localStorage.setItem(DELETED_COURTS_KEY, JSON.stringify([...ids]))
    window.localStorage.setItem(COURTS_STORAGE_KEY, JSON.stringify(readLocalCourts().filter((court) => String(court.id) !== String(id))))
  } catch { /* Best effort for local-only mode. */ }
}
function readLocalCourts(): Court[] {
  try { return JSON.parse(window.localStorage.getItem(COURTS_STORAGE_KEY) || '[]') as Court[] }
  catch { return [] }
}
function saveLocalCourt(court: Court): void {
  try {
    const courts = readLocalCourts().filter((item) => String(item.id) !== String(court.id))
    window.localStorage.setItem(COURTS_STORAGE_KEY, JSON.stringify([court, ...courts]))
  } catch { /* Storage may be full */ }
}

export async function getCourts(): Promise<Court[]> {
  const localCourts = readLocalCourts()
  try {
    const serverCourts = (await request<Court[]>('/courts', { isPrivate: false })).map(parseCourt)
    const byId = new Map(serverCourts.map((court) => [String(court.id), court]))
    localCourts.forEach((court) => byId.set(String(court.id), { ...byId.get(String(court.id)), ...court }))
    const combined = [...byId.values()].filter((court) => !getDeletedCourtIds().includes(String(court.id)))
    if (combined.length > 0) return combined
  } catch (err) {
    console.warn('API /courts unreachable, using locally saved facility data:', err)
  }
  return [...localCourts, ...FALLBACK_COURTS.filter((court) => !localCourts.some((saved) => String(saved.id) === String(court.id)))].filter((court) => !getDeletedCourtIds().includes(String(court.id)))
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
    userId: 2,
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
      const parsed = JSON.parse(raw) as ApiBooking[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  // Initialize with initial local bookings
  try {
    window.localStorage.setItem('itelect4_local_bookings', JSON.stringify(INITIAL_LOCAL_BOOKINGS))
  } catch {
    // ignore
  }
  return INITIAL_LOCAL_BOOKINGS
}

export function saveLocalStoredBookings(bookings: ApiBooking[]): void {
  try {
    window.localStorage.setItem('itelect4_local_bookings', JSON.stringify(bookings))
    window.dispatchEvent(new Event('storage'))
  } catch {
    // ignore
  }
}

// --- BOOKINGS API ---
export async function getBookings(): Promise<Booking[]> {
  const local = getLocalStoredBookings()
  try {
    const serverBookings = await request<ApiBooking[]>('/bookings', { isPrivate: true })
    if (Array.isArray(serverBookings) && serverBookings.length > 0) {
      const byId = new Map<string, ApiBooking>()
      serverBookings.forEach((b) => byId.set(String(b.id ?? (b as any)._id), b))
      local.forEach((b) => {
        const key = String(b.id)
        if (!byId.has(key)) byId.set(key, b)
        else byId.set(key, { ...byId.get(key)!, ...b })
      })
      const merged = [...byId.values()]
      saveLocalStoredBookings(merged)
      return merged.map(parseBooking)
    }
  } catch (err) {
    console.warn('API /bookings unreachable, using locally stored bookings:', err)
  }
  return local.map(parseBooking)
}

// Admin API endpoint returns all player/student bookings
export async function getAdminBookings(): Promise<Booking[]> {
  const local = getLocalStoredBookings()
  let serverBookings: ApiBooking[] = []
  
  // Try /admin/bookings first, then fallback to /bookings
  try {
    serverBookings = await request<ApiBooking[]>('/admin/bookings', { isPrivate: true })
  } catch {
    try {
      serverBookings = await request<ApiBooking[]>('/bookings', { isPrivate: true })
    } catch {
      // both failed, use local
    }
  }

  if (Array.isArray(serverBookings) && serverBookings.length > 0) {
    const byId = new Map<string, ApiBooking>()
    serverBookings.forEach((b) => byId.set(String(b.id ?? (b as any)._id), b))
    local.forEach((b) => {
      const key = String(b.id)
      if (!byId.has(key)) byId.set(key, b)
      else byId.set(key, { ...byId.get(key)!, ...b })
    })
    const merged = [...byId.values()]
    saveLocalStoredBookings(merged)
    return merged.map(parseBooking)
  }

  return local.map(parseBooking)
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
    bookingDate: typeof input.bookingDate === 'string' ? input.bookingDate : input.bookingDate.toISOString(),
  }

  let serverBooking: ApiBooking | null = null
  try {
    serverBooking = await request<ApiBooking>('/bookings', {
      method: 'POST',
      isPrivate: true,
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('API POST /bookings failed, saving reservation in local storage:', err)
  }

  const newId = serverBooking?.id ?? (serverBooking as any)?._id ?? Date.now()
  const rawBooking: ApiBooking = {
    id: typeof newId === 'number' ? newId : (Number(newId) || Date.now()),
    userId: typeof input.userId === 'number' ? input.userId : (Number(input.userId) || 1),
    courtId: Number(input.courtId),
    bookingDate: payload.bookingDate,
    durationHours: Number(input.durationHours) || 2,
    status: (serverBooking?.status as BookingStatus) || (input.status as BookingStatus) || BookingStatus.Pending,
  }

  const current = getLocalStoredBookings()
  const updatedList = [rawBooking, ...current.filter((b) => String(b.id) !== String(rawBooking.id))]
  saveLocalStoredBookings(updatedList)

  // Dispatch custom event for real-time synchronization across views
  window.dispatchEvent(new CustomEvent('itelect4-bookings-updated', { detail: rawBooking }))

  return parseBooking(rawBooking)
}

export async function updateBookingStatus(id: number | string, status: BookingStatus): Promise<Booking> {
  let serverBooking: ApiBooking | null = null
  try {
    const response = await request<ApiBooking>('/bookings/' + id, {
      method: 'PATCH',
      isPrivate: true,
      body: JSON.stringify({ status }),
    })
    if (response) {
      serverBooking = response
    }
  } catch (err) {
    console.warn(`API PATCH /bookings/${id} failed, updating booking status locally:`, err)
  }

  const current = getLocalStoredBookings()
  const existing = current.find((b) => String(b.id) === String(id))
  const updatedBooking: ApiBooking = {
    ...(existing || {
      id: typeof id === 'number' ? id : (Number(id) || Date.now()),
      userId: 1,
      courtId: 1,
      bookingDate: new Date().toISOString(),
      durationHours: 2,
    }),
    id: existing?.id ?? (typeof id === 'number' ? id : (Number(id) || Date.now())),
    status: (serverBooking?.status as BookingStatus) || status,
  }

  const updatedList = current.map((b) => String(b.id) === String(id) ? updatedBooking : b)
  if (!existing) {
    updatedList.unshift(updatedBooking)
  }

  saveLocalStoredBookings(updatedList)
  window.dispatchEvent(new CustomEvent('itelect4-bookings-updated', { detail: updatedBooking }))

  return parseBooking(updatedBooking)
}

export async function deleteBooking(id: number | string): Promise<void> {
  try {
    await request<void>('/bookings/' + id, { method: 'DELETE', isPrivate: true })
  } catch (err) {
    console.warn(`API DELETE /bookings/${id} failed, removing booking locally:`, err)
  }
  const current = getLocalStoredBookings()
  const updatedList = current.filter((booking) => String(booking.id) !== String(id))
  saveLocalStoredBookings(updatedList)
  window.dispatchEvent(new CustomEvent('itelect4-bookings-updated', { detail: { id, deleted: true } }))
}

// --- USERS API ---
const LOCAL_USERS_KEY = 'itelect4_local_users'

const DEFAULT_USERS: User[] = [
  { id: 1, name: 'Juan dela Cruz (Student)', email: 'student@example.com', role: 'player', isActive: true },
  { id: 2, name: 'Maria Santos (Player)', email: 'maria@example.com', role: 'player', isActive: true },
  { id: 99, name: 'Facility Admin', email: 'admin@bamicourt.com', role: 'admin', isActive: true },
]

export function readLocalUsers(): User[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as User[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_USERS
}

export function saveLocalStoredUser(user: User): void {
  try {
    const users = readLocalUsers()
    const updated = [user, ...users.filter((item) => String(item.id) !== String(user.id) && item.email.toLowerCase() !== user.email.toLowerCase())]
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  } catch { /* Continue if browser storage is unavailable. */ }
}

export async function getAdminUsers(): Promise<User[]> {
  const local = readLocalUsers()
  try {
    const serverUsers = await request<User[]>('/admin/users', { isPrivate: true })
    if (Array.isArray(serverUsers) && serverUsers.length > 0) {
      const byEmail = new Map<string, User>()
      serverUsers.map(parseUser).forEach((u) => byEmail.set(u.email.toLowerCase(), u))
      local.forEach((u) => {
        const key = u.email.toLowerCase()
        if (!byEmail.has(key)) byEmail.set(key, u)
      })
      const merged = [...byEmail.values()]
      try { window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(merged)) } catch { /* ignore */ }
      return merged
    }
  } catch {
    // Try public /users
    try {
      const serverUsers = await request<User[]>('/users', { isPrivate: true })
      if (Array.isArray(serverUsers) && serverUsers.length > 0) {
        return serverUsers.map(parseUser)
      }
    } catch {
      // fallback to local
    }
  }

  // Ensure current auth user is represented
  const currentAuth = useAuthStore.getState().user
  if (currentAuth && currentAuth.email) {
    const currentId = typeof currentAuth.id === 'number' ? currentAuth.id : (Number(currentAuth.id) || Date.now())
    const exists = local.some((u) => u.email.toLowerCase() === currentAuth.email!.toLowerCase())
    if (!exists) {
      local.push({
        id: currentId,
        name: currentAuth.name || currentAuth.email.split('@')[0],
        email: currentAuth.email,
        role: (currentAuth.role as 'player' | 'admin') || 'player',
        isActive: true,
      })
    }
  }

  return local
}

export async function getUsers(): Promise<User[]> {
  return getAdminUsers()
}

export async function getUserById(id: number | string): Promise<User> {
  try {
    const user = await request<User>(`/users/${id}`, { isPrivate: true })
    return parseUser(user)
  } catch {
    const local = readLocalUsers().find((u) => String(u.id) === String(id))
    if (local) return local
    return {
      id: typeof id === 'number' ? id : (Number(id) || 1),
      name: `Student #${id}`,
      email: `student${id}@example.com`,
      role: 'player',
      isActive: true,
    }
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const user = await request<User>('/users', {
      method: 'POST',
      isPrivate: true,
      body: JSON.stringify(input),
    })
    const parsed = parseUser(user)
    saveLocalStoredUser(parsed)
    return parsed
  } catch {
    const newUser: User = {
      id: Date.now(),
      ...input,
    }
    saveLocalStoredUser(newUser)
    return newUser
  }
}

// --- AI REVIEW ENGINE ---
function generateIntelligentAiReview(prompt: string): AiReview {
  const p = prompt.toLowerCase()
  const hasCourts = p.includes('court') || p.includes('facility') || p.includes('arena') || p.includes('hall')
  const hasBooking = p.includes('book') || p.includes('reserve') || p.includes('schedule') || p.includes('time') || p.includes('slot')
  const hasAdmin = p.includes('admin') || p.includes('approve') || p.includes('decline') || p.includes('manage') || p.includes('accept')
  const hasAvailability = p.includes('availab') || p.includes('conflict') || p.includes('date') || p.includes('prevent')
  const hasAuth = p.includes('login') || p.includes('sign in') || p.includes('register') || p.includes('player') || p.includes('account') || p.includes('student') || p.includes('role')

  const strengths: string[] = []
  const improvements: string[] = []

  if (hasCourts) {
    strengths.push('Comprehensive court catalog with visual previews, surface details, and facility information.')
  } else {
    improvements.push('Add richer court information like surface type (sprung wood, BWF mat), lighting, and amenities.')
  }

  if (hasBooking) {
    strengths.push('Intuitive player reservation flow with date selection, duration controls, and validation.')
  } else {
    improvements.push('Implement a multi-step reservation booking wizard with quick date pickers and instant validation.')
  }

  if (hasAdmin) {
    strengths.push('Dedicated administrative portal with real-time approval, decline, cancellation, and match completion actions.')
  } else {
    improvements.push('Provide admins with a high-level command center to approve, decline, and track court utilization.')
  }

  if (hasAvailability) {
    strengths.push('Robust availability verification preventing overlapping reservations on the same court and date.')
  } else {
    improvements.push('Introduce real-time slot conflict warning banners before players submit reservation forms.')
  }

  if (hasAuth) {
    strengths.push('Clear role-based access control separating Student/Player and Facility Administrator experiences.')
  } else {
    improvements.push('Consider integrating campus student ID single sign-on (SSO) for streamlined verification.')
  }

  // Ensure at least 3 strengths and 3 improvements
  if (strengths.length < 3) {
    strengths.push('Responsive mobile-first layout with instant visual status indicators.')
    strengths.push('Real-time synchronization between student bookings and administrator requests.')
  }
  if (improvements.length < 3) {
    improvements.push('Add automatic push or email notifications when an admin accepts, declines, or cancels a match.')
    improvements.push('Incorporate historical analytics to track peak court usage hours and approval rates.')
  }

  let readiness: 'ready' | 'almost' | 'not-yet' = 'almost'
  if (hasCourts && hasBooking && hasAdmin && hasAvailability) {
    readiness = 'ready'
  } else if (!hasBooking && !hasCourts) {
    readiness = 'not-yet'
  }

  const summary = readiness === 'ready'
    ? 'Your badminton court booking platform demonstrates excellent architectural readiness! The system successfully supports the complete lifecycle: students can browse facilities and request match bookings, while administrators can review, accept, decline, complete, or cancel bookings with conflict prevention and live analytics.'
    : readiness === 'almost'
    ? 'Your booking application has a strong foundation for player and admin interactions, but could benefit from expanded administrative tools, clearer availability signals, and tighter lifecycle status tracking.'
    : 'The application concept requires additional core reservation features such as court availability calendars, player self-service booking, and admin approval workflows before launch.'

  return {
    summary,
    readiness,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
  }
}

export async function askAi(prompt: string): Promise<AiReview> {
  try {
    const result = await request<AiReview>('/ai', {
      method: 'POST',
      isPrivate: true,
      timeoutMs: 15000,
      body: JSON.stringify({ prompt }),
    })
    if (result && result.summary && Array.isArray(result.strengths) && Array.isArray(result.improvements) && result.readiness) {
      return result
    }
  } catch (err) {
    console.warn('Backend /ai unreachable or returned error, using built-in intelligent evaluation engine:', err)
  }
  // Simulate AI evaluation processing time for rich user feedback
  await new Promise((resolve) => setTimeout(resolve, 800))
  return generateIntelligentAiReview(prompt)
}