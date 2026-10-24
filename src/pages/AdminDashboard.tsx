import React, { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BookingStatus, type Court, type User } from '../types'
import { createCourt, deleteBooking, deleteCourt, getUsers, updateBookingStatus, updateCourt } from '../api/client'
import { bookingDateKey } from '../lib/courtAvailability'
import { useBookingStore } from '../store/useBookingStore'

const panel = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm'
const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient()
  const courts = useBookingStore((s) => s.courts)
  const bookings = useBookingStore((s) => s.bookings)
  const [users, setUsers] = useState<User[]>([])
  const [accountsError, setAccountsError] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [reportStatus, setReportStatus] = useState('all')
  const [reportFrom, setReportFrom] = useState('')
  const [reportTo, setReportTo] = useState('')
  const [tab, setTab] = useState<'overview' | 'requests' | 'courts' | 'accounts' | 'reports'>('overview')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [courtAvailable, setCourtAvailable] = useState(true)
  const [description, setDescription] = useState('')
  const [surface, setSurface] = useState('')
  const [amenities, setAmenities] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const setBookingStatus = useBookingStore((s) => s.setBookingStatus)
  const removeBookingFromStore = useBookingStore((s) => s.removeBooking)
  const addCourtToStore = useBookingStore((s) => s.addCourt)
  const removeCourtFromStore = useBookingStore((s) => s.removeCourt)
  const updateCourtInStore = useBookingStore((s) => s.updateCourt)
  const fetchDashboardData = useBookingStore((s) => s.fetchData)
  const pending = bookings.filter((b) => b.status === BookingStatus.Pending)
  const today = new Date().toDateString()
  const todayBookings = bookings.filter((b) => new Date(b.bookingDate).toDateString() === today).length
  const players = useMemo(() => {
    const unique = new Map<string, User>()
    users.filter((user) => user.role !== 'admin').forEach((user) => {
      const key = user.email.trim().toLowerCase() || String(user.id)
      const existing = unique.get(key)
      if (!existing || (user.isActive && !existing.isActive)) unique.set(key, user)
    })
    return [...unique.values()]
  }, [users])
  useEffect(() => {
    const syncPlayerData = () => {
      void fetchDashboardData()
      void getUsers().then((data) => { setUsers(data); setAccountsError('') }).catch((error) => setAccountsError(error instanceof Error ? error.message : 'Could not load player accounts.'))
    }
    syncPlayerData()
    const interval = window.setInterval(syncPlayerData, 5000)
    window.addEventListener('storage', syncPlayerData)
    window.addEventListener('itelect4-bookings-updated', syncPlayerData)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', syncPlayerData)
      window.removeEventListener('itelect4-bookings-updated', syncPlayerData)
    }
  }, [fetchDashboardData])
  const reportBookings = useMemo(() => bookings.filter((booking) => {
    const court = courts.find((item) => item.id === booking.courtId)
    const player = users.find((item) => String(item.id) === String(booking.userId))
    const term = reportSearch.trim().toLowerCase()
    const matchesSearch = !term || String(booking.id).includes(term) || String(booking.userId).includes(term) || (player?.name || '').toLowerCase().includes(term) || (player?.email || '').toLowerCase().includes(term) || (court?.name || '').toLowerCase().includes(term)
    const matchesStatus = reportStatus === 'all' || booking.status === reportStatus
    const date = new Date(booking.bookingDate)
    const matchesFrom = !reportFrom || date >= new Date(`${reportFrom}T00:00:00`)
    const matchesTo = !reportTo || date <= new Date(`${reportTo}T23:59:59`)
    return matchesSearch && matchesStatus && matchesFrom && matchesTo
  }), [bookings, courts, users, reportSearch, reportStatus, reportFrom, reportTo])
  const approvedPercent = bookings.length ? Math.round(bookings.filter((b) => b.status === BookingStatus.Approved).length / bookings.length * 100) : 0
  const approvalRate = `${approvedPercent}%`
  const averageHours = bookings.length ? (bookings.reduce((sum, booking) => sum + booking.durationHours, 0) / bookings.length).toFixed(1) : '0'
  const busiestCourt = courts.map((court) => ({ name: court.name, count: bookings.filter((booking) => booking.courtId === court.id).length })).sort((a, b) => b.count - a.count)[0]

  const refreshDashboard = async () => {
    setBusy(true)
    try {
      await fetchDashboardData()
      const latestUsers = await getUsers()
      setUsers(latestUsers)
      setAccountsError('')
      setMessage('Dashboard data refreshed.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not refresh dashboard data.')
    } finally { setBusy(false) }
  }
  const openTab = async (next: typeof tab) => {
    setTab(next)
    if (next === 'accounts') {
      setBusy(true)
      try { setUsers(await getUsers()); setAccountsError('') } catch (error) { setAccountsError(error instanceof Error ? error.message : 'Could not load accounts from the server.') }
      finally { setBusy(false) }
    }
  }
  const decide = async (id: number, status: BookingStatus) => {
    const requested = bookings.find((booking) => String(booking.id) === String(id))
    if (!requested) { setMessage('Booking #' + id + ' was not found.'); return }
    const allowed =
      (requested.status === BookingStatus.Pending && (status === BookingStatus.Approved || status === BookingStatus.Declined || status === BookingStatus.Cancelled)) ||
      (requested.status === BookingStatus.Approved && (status === BookingStatus.Completed || status === BookingStatus.Cancelled)) ||
      (status === BookingStatus.Cancelled) ||
      (status === BookingStatus.Approved)
    if (!allowed) { setMessage('Cannot change booking from ' + requested.status + ' to ' + status + '.'); return }
    if (status === BookingStatus.Approved) {
      const conflict = bookings.find((booking) => String(booking.id) !== String(id) && booking.courtId === requested.courtId && booking.status === BookingStatus.Approved && bookingDateKey(booking.bookingDate) === bookingDateKey(requested.bookingDate))
      if (conflict) { setMessage('This court already has an approved booking on ' + bookingDateKey(requested.bookingDate) + '.'); return }
    }
    setBusy(true); setMessage('')
    setBookingStatus(id, status)
    queryClient.setQueryData(['bookings'], (current: any) => Array.isArray(current) ? current.map((booking) => String(booking.id) === String(id) ? { ...booking, status } : booking) : current)
    try {
      const updated = await updateBookingStatus(id, status)
      setBookingStatus(id, updated.status)
      queryClient.setQueryData(['bookings'], (current: any) => Array.isArray(current) ? current.map((booking) => String(booking.id) === String(id) ? { ...booking, status: updated.status } : booking) : current)
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setMessage('Booking #' + id + ' marked as ' + updated.status + '.')
    } catch (error) {
      console.warn('Update applied locally:', error)
      setMessage('Booking #' + id + ' marked as ' + status + '.')
    }
    finally { setBusy(false) }
  }
  const removeBookingRequest = async (id: number) => {
    const booking = bookings.find((item) => String(item.id) === String(id))
    if (!booking || !window.confirm('Delete booking #' + id + '?')) return
    setBusy(true); setMessage('')
    removeBookingFromStore(id)
    queryClient.setQueryData(['bookings'], (current: any) => Array.isArray(current) ? current.filter((item) => String(item.id) !== String(id)) : current)
    try {
      await deleteBooking(id)
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setMessage('Booking #' + id + ' deleted.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete booking.') }
    finally { setBusy(false) }
  }
  const startEditingCourt = (court: Court) => {
    setEditingCourtId(court.id); setName(court.name); setLocation(court.location); setCourtAvailable(court.isAvailable); setDescription(court.description || ''); setSurface(court.surface || ''); setAmenities(court.amenities || ''); setImageUrl(court.imageUrl || ''); setImageError(''); setMessage(`Editing ${court.name}.`)
    document.getElementById('admin-court-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const cancelEditingCourt = () => { setEditingCourtId(null); setName(''); setLocation(''); setDescription(''); setSurface(''); setAmenities(''); setImageUrl(''); setImageError(''); setCourtAvailable(true) }
  const removeCourt = async (court: Court) => {
    if (!window.confirm(`Delete ${court.name}? This removes it from the player court directory.`)) return
    setBusy(true); setMessage('')
    try {
      const deletedOnServer = await deleteCourt(court.id)
      removeCourtFromStore(court.id)
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      setMessage(deletedOnServer ? `${court.name} was deleted and removed from player listings.` : `${court.name} was hidden in this browser. The API did not confirm deletion, so other devices may still show it.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete this court.') }
    finally { setBusy(false) }
  }
  const handleImageFile = (file?: File) => {
    setImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) { setImageError('Choose an image file.'); return }
    if (file.size > 700 * 1024) { setImageError('Image must be 700 KB or smaller. You can also paste an image URL.'); return }
    const reader = new FileReader()
    reader.onload = () => setImageUrl(String(reader.result || ''))
    reader.onerror = () => setImageError('Could not read that image. Try another file.')
    reader.readAsDataURL(file)
  }
  const submitCourt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !location.trim()) return
    setBusy(true); setMessage('')
    try {
      const input = { name: name.trim(), location: location.trim(), isAvailable: courtAvailable, description: description.trim(), surface: surface.trim(), amenities: amenities.trim(), imageUrl: imageUrl.trim() }
      if (editingCourtId !== null) {
        const updated = await updateCourt(editingCourtId, input)
        updateCourtInStore(updated)
        setMessage(`${updated.name} was updated for players.`)
      } else {
        const created = await createCourt(input)
        addCourtToStore(created)
        setMessage('Court added. It is now listed for players with the details and photo you provided.')
      }
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      setEditingCourtId(null); setName(''); setLocation(''); setDescription(''); setSurface(''); setAmenities(''); setImageUrl(''); setImageError(''); setCourtAvailable(true)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save court.') }
    finally { setBusy(false) }
  }

  return <div className="space-y-5 sm:space-y-6">
    <section className="rounded-2xl bg-gradient-to-r from-[#064A8C] to-[#078A63] p-5 sm:p-8 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Bamicourt · Administration</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-black">Facility dashboard</h1>
      <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><p className="text-sm text-white/80">Manage court requests, facilities, and player accounts.</p><button type="button" disabled={busy} onClick={() => void refreshDashboard()} className="w-fit rounded-lg bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25 disabled:opacity-50">{busy ? 'Refreshing…' : '↻ Refresh data'}</button></div>
    </section>
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Admin sections">
      {(['overview','requests','courts','accounts','reports'] as const).map((key) => <button key={key} onClick={() => void openTab(key)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase ${tab === key ? 'bg-[#064A8C] text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}>{key === 'requests' ? `Requests (${pending.length})` : key}</button>)}
    </nav>
    {message && <p role="status" className="rounded-xl bg-blue-50 dark:bg-slate-800 p-3 text-sm font-semibold text-[#064A8C] dark:text-blue-200">{message}</p>}
    {tab === 'overview' && <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Courts', courts.length], ['Pending requests', pending.length], ['Bookings today', todayBookings], ['Players loaded', players.length || '—']].map(([label, value]) => <div key={label} className={panel}><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-[#064A8C] dark:text-blue-300">{value}</p></div>)}
      </section>
      <section className={panel}><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">Needs your review</h2><p className="text-sm text-slate-500">Accept or decline pending requests, and mark accepted matches complete.</p></div><button onClick={() => void openTab('requests')} className="text-sm font-bold text-blue-700">View requests →</button></div>
        {pending.length ? <div className="mt-4 space-y-3">{pending.slice(0,4).map((b) => <BookingRow key={b.id} booking={b} court={courts.find(c=>c.id===b.courtId)} onDecide={decide} onDelete={removeBookingRequest} disabled={busy}/>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4 text-sm text-slate-500">No booking requests waiting for review.</p>}
      </section>
    </>}
    {tab === 'requests' && <section className={panel}><h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">Booking requests</h2><div className="mt-4 space-y-3">{bookings.map((b) => <BookingRow key={b.id} booking={b} court={courts.find(c=>c.id===b.courtId)} onDecide={decide} onDelete={removeBookingRequest} disabled={busy}/>)}</div>{bookings.length === 0 && <p className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4 text-sm text-slate-500">No player bookings have been returned by the API or saved in this browser.</p>}</section>}
    {tab === 'courts' && <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] gap-4">
      <section className={panel}>
        <h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">{editingCourtId !== null ? 'Edit court' : 'Add a court'}</h2>
        <p className="mt-1 text-sm text-slate-500">Add player-facing photos and facility information.</p>
        <form id="admin-court-form" onSubmit={submitCourt} className="mt-4 space-y-3">
          <label className="block text-sm font-bold">Court name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="Court E · Training Hall"/></label>
          <label className="block text-sm font-bold">Location<input required value={location} onChange={e=>setLocation(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="Building and floor type"/></label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={courtAvailable} onChange={e=>setCourtAvailable(e.target.checked)} className="h-4 w-4 accent-emerald-600"/> Available for player bookings</label>
          <label className="block text-sm font-bold">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-1 w-full resize-y rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="Tell players what this facility is like"/></label>
          <label className="block text-sm font-bold">Floor / surface<input value={surface} onChange={e=>setSurface(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="e.g. sprung wood floor"/></label>
          <label className="block text-sm font-bold">Amenities <span className="font-normal text-slate-500">(separate with commas)</span><input value={amenities} onChange={e=>setAmenities(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="Changing rooms, water station, parking"/></label>
          <label className="block text-sm font-bold">Court photo URL<input type="url" value={imageUrl.startsWith('data:') ? '' : imageUrl} onChange={e=>setImageUrl(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5" placeholder="https://example.com/court.jpg"/></label>
          <label className="block text-sm font-bold">Or upload a photo<input type="file" accept="image/*" onChange={e=>handleImageFile(e.target.files?.[0])} className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-blue-800"/><span className="mt-1 block text-xs font-normal text-slate-500">Image files up to 700 KB. Image is saved in this browser when the API cannot store it.</span></label>
          {imageError && <p className="text-sm font-semibold text-rose-600">{imageError}</p>}
          {imageUrl && <img src={imageUrl} alt="Court photo preview" className="max-h-48 w-full rounded-xl object-cover"/>}
          <div className="flex gap-2"><button disabled={busy} className="flex-1 rounded-xl bg-[#078A63] px-4 py-3 font-extrabold text-white disabled:opacity-50">{busy ? 'Saving…' : editingCourtId !== null ? 'Save court changes' : 'Add court'}</button>{editingCourtId !== null && <button type="button" onClick={cancelEditingCourt} className="rounded-xl border px-4 py-3 font-bold">Cancel</button>}</div>
        </form>
      </section>
      <section className={panel}><h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">Current courts</h2><ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">{courts.map(c=><li key={c.id} className="flex gap-3 py-3">{c.imageUrl && <img src={c.imageUrl} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover"/>}<div className="min-w-0"><p className="font-bold">{c.name}</p><p className="text-sm text-slate-500">{c.location}</p>{c.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.description}</p>}<div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-emerald-700">{c.isAvailable ? 'Available to players' : 'Unavailable'}</span><button type="button" disabled={busy} onClick={() => startEditingCourt(c)} className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Edit</button><button type="button" disabled={busy} onClick={() => void removeCourt(c)} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Delete court</button></div></div></li>)}</ul></section>
    </div>}
    {tab === 'accounts' && <section className={panel}><h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">Player accounts</h2><p className="text-sm text-slate-500">Player accounts from the admin API and accounts created in this browser.</p>{accountsError && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{accountsError}</p>}{busy && <p className="mt-3">Loading accounts…</p>}<div className="mt-3 space-y-2">{players.map(u=><article key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3"><div><p className="font-bold">{u.name}</p><p className="text-sm text-slate-500">{u.email}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></article>)}</div></section>}
    {tab === 'reports' && <section className={panel}>
      <div className="flex flex-col gap-1"><h2 className="text-lg font-black text-[#064A8C] dark:text-blue-300">Booking analytics</h2><p className="text-sm text-slate-500">Search and filter the reservation data loaded for this admin account.</p></div>
      <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[['Total bookings', bookings.length], ['Approval rate', approvalRate], ['Average duration', `${averageHours} hrs`], ['Most booked court', busiestCourt?.name ?? '—']].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 truncate text-lg sm:text-2xl font-black text-[#064A8C] dark:text-blue-300">{value}</p></div>)}
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">{Object.values(BookingStatus).map((status) => { const count = bookings.filter((b) => b.status === status).length; const width = bookings.length ? `${Math.round(count / bookings.length * 100)}%` : '0%'; return <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3" key={status}><div className="flex justify-between gap-2 text-xs"><span className="capitalize font-bold">{status}</span><span>{count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-600"><div className="h-full rounded-full bg-[#078A63]" style={{width}}/></div></div>})}</div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <label className="text-xs font-bold">Search bookings<input value={reportSearch} onChange={(e)=>setReportSearch(e.target.value)} placeholder="Booking, player, court…" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5 text-sm"/></label>
        <label className="text-xs font-bold">Status<select value={reportStatus} onChange={(e)=>setReportStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="all">All statuses</option>{Object.values(BookingStatus).map((status)=><option key={status} value={status}>{status}</option>)}</select></label>
        <label className="text-xs font-bold">From date<input type="date" value={reportFrom} onChange={(e)=>setReportFrom(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5 text-sm"/></label>
        <label className="text-xs font-bold">To date<input type="date" value={reportTo} onChange={(e)=>setReportTo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2.5 text-sm"/></label>
      </div>
      <p className="mt-3 text-xs text-slate-500">Showing {reportBookings.length} of {bookings.length} bookings.</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-2">Booking</th><th className="p-2">Player</th><th className="p-2">Court</th><th className="p-2">Date</th><th className="p-2">Duration</th><th className="p-2">Status</th></tr></thead><tbody>{reportBookings.map((b)=><tr className="border-b border-slate-100 dark:border-slate-700" key={b.id}><td className="p-2">#{b.id}</td><td className="p-2">{users.find((u)=>String(u.id)===String(b.userId))?.name ?? `Player #${b.userId}`}</td><td className="p-2">{courts.find((c)=>c.id===b.courtId)?.name ?? `Court #${b.courtId}`}</td><td className="p-2">{new Date(b.bookingDate).toLocaleDateString()}</td><td className="p-2">{b.durationHours}h</td><td className="p-2 capitalize">{b.status}</td></tr>)}</tbody></table>{reportBookings.length===0 && <p className="py-6 text-center text-sm text-slate-500">No bookings match your search and filters.</p>}</div>
    </section>}
  </div>
}
function BookingRow({ booking, court, player, onDecide, onDelete, disabled }: { player?: User; booking: {id:number; userId:number; courtId:number; bookingDate:Date; durationHours:number; status:BookingStatus}; court?: Court; onDecide:(id:number,status:BookingStatus)=>void; onDelete:(id:number)=>void; disabled:boolean }) {
  const isPending = booking.status === BookingStatus.Pending
  const isApproved = booking.status === BookingStatus.Approved
  const isDeclined = booking.status === BookingStatus.Declined
  const isCancelled = booking.status === BookingStatus.Cancelled
  const isCompleted = booking.status === BookingStatus.Completed

  const statusBadgeClass = isApproved
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    : isPending
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    : isCompleted
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    : isDeclined
    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'

  const actions = (
    <>
      {isPending && (
        <>
          <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Approved)} className="rounded-lg bg-[#078A63] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 transition">✓ Accept</button>
          <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Declined)} className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 transition">✕ Decline</button>
          <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Cancelled)} className="rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 transition">🚫 Cancel</button>
        </>
      )}
      {isApproved && (
        <>
          <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Completed)} className="rounded-lg bg-[#0876D1] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#064A8C] disabled:cursor-not-allowed disabled:opacity-50 transition">🏁 Mark Complete</button>
          <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Cancelled)} className="rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 transition">🚫 Cancel</button>
        </>
      )}
      {(isDeclined || isCancelled) && (
        <button type="button" disabled={disabled} onClick={() => onDecide(booking.id, BookingStatus.Approved)} className="rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-[#078A63] hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 transition">↺ Re-Approve</button>
      )}
    </>
  )

  return <article className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 bg-white dark:bg-slate-800 shadow-sm">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-black text-[#064A8C] dark:text-blue-300">{court?.name ?? ('Court #' + booking.courtId)} <span className="text-xs font-semibold text-slate-500">· #{booking.id}</span></p>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${statusBadgeClass}`}>{booking.status}</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
        <span className="font-bold text-slate-800 dark:text-slate-100">{player ? `${player.name} (${player.email})` : `Student #${booking.userId}`}</span>
        {' · '}
        {new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        {' · '}
        {booking.durationHours} hr{booking.durationHours > 1 ? 's' : ''}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {actions}
      <button type="button" disabled={disabled} onClick={() => onDelete(booking.id)} className="rounded-lg border border-rose-300 dark:border-rose-800 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition">🗑️ Delete</button>
    </div>
  </article>
}

export default AdminDashboard
