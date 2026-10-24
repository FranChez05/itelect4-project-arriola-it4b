import React from 'react'
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, Trophy, Users, Zap, Phone, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/useBookingStore'
import { BookingStatus } from '../types'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const user = useBookingStore((state) => state.user)
  const courts = useBookingStore((state) => state.courts)
  const bookings = useBookingStore((state) => state.bookings)
  const isLoading = useBookingStore((state) => state.isLoading)

  const availableCourts = courts.filter((court) => court.isAvailable).length
  const pendingCount = bookings.filter((booking) => booking.status === BookingStatus.Pending).length
  const approvedCount = bookings.filter((booking) => booking.status === BookingStatus.Approved).length
  const upcomingBooking = bookings
    .filter((booking) => (booking.status === BookingStatus.Pending || booking.status === BookingStatus.Approved) && new Date(booking.bookingDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())[0]
  const upcomingCourt = upcomingBooking ? courts.find((court) => court.id === upcomingBooking.courtId) : undefined
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Player'

  const stats = [
    { label: 'Courts to play on', value: courts.length, icon: Trophy, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Available now', value: availableCourts, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Your bookings', value: bookings.length, icon: CalendarDays, tone: 'text-[#0876D1] bg-blue-50' },
    { label: 'Awaiting approval', value: pendingCount, icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
  ]

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 pb-8 sm:space-y-9">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#064A8C] shadow-xl shadow-blue-950/15">
        <div className="absolute inset-0 -z-10 lg:left-[38%]">
          <img src="/court-card.jpg" alt="Badminton net and court ready for play" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#064A8C]/95 via-[#064A8C]/85 to-[#064A8C]/55 lg:from-[#064A8C] lg:via-[#064A8C]/55 lg:to-transparent" />
          <div className="absolute inset-0 bg-[#078A63]/10" />
        </div>
        <div className="grid min-h-[26rem] items-center lg:grid-cols-[1.05fr_.95fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR NEXT GAME STARTS HERE
            </div>
            <p className="mb-2 text-sm font-semibold text-blue-200">Good to see you, {firstName}</p>
            <h1 className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find your court.<br /><span className="text-emerald-300">Own the game.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
              Check court details, choose a date, and send a booking request in just a few steps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate('/booking')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-200/40">
                <Zap size={17} /> Book a court <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => navigate('/courts')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20">
                Explore courts
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-200">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-300" /> Live availability</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} className="text-emerald-300" /> Booking updates</span>
            </div>
          </div>
          <div className="hidden min-h-[26rem] lg:block" aria-hidden="true" />
        </div>
        <div className="absolute right-7 top-7 hidden items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur sm:flex">
          <MapPin size={14} className="text-emerald-300" /> Ready when you are
        </div>
      </section>

      <section aria-label="Booking overview" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
            <div className={'mb-4 flex h-10 w-10 items-center justify-center rounded-xl ' + tone}><Icon size={19} /></div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">{isLoading ? '—' : value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Your schedule</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Next session</h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><CalendarDays size={20} /></div>
          </div>
          {upcomingBooking ? (
            <div className="mt-5 flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-900">{upcomingCourt?.name || ('Court #' + upcomingBooking.courtId)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} />{new Date(upcomingBooking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}<span className="text-slate-300">·</span>{upcomingBooking.durationHours} hr</p>
              </div>
              <span className={'w-fit rounded-full px-3 py-1.5 text-xs font-bold ' + (upcomingBooking.status === BookingStatus.Approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                {upcomingBooking.status === BookingStatus.Approved ? 'Confirmed' : 'Pending approval'}
              </span>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center">
              <p className="font-semibold text-slate-800">No upcoming session yet</p>
              <p className="mt-1 text-sm text-slate-500">Pick a date and find a court that works for you.</p>
            </div>
          )}
          <Link to="/my-bookings" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900">View my bookings <ArrowRight size={15} /></Link>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md">
          <div className="flex items-center justify-between bg-[#064A8C] px-4 py-3 text-white sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-[#078A63] p-2"><Users size={17} /></div>
              <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-100">At a glance</p><h2 className="text-base font-extrabold">Player account</h2></div>
            </div>
            <span className="rounded-md border border-emerald-300/30 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">{user?.role || 'player'}</span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#078A63]/20 bg-[#EAF6EC] p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#064A8C] text-lg font-black uppercase text-white shadow-sm">{user?.name?.trim().charAt(0) || 'P'}</div>
              <div className="min-w-0">
                <p className="truncate font-extrabold text-[#064A8C]">{user?.name || 'Player'}</p>
                <p className="truncate text-xs font-medium text-slate-600">{user?.email || 'Account email unavailable'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-2xl font-black text-[#078A63]">{approvedCount}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">Confirmed</p></div>
              <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-2xl font-black text-amber-600">{pendingCount}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">Pending</p></div>
            </div>
            <Link to="/my-bookings" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#064A8C] transition hover:text-[#078A63]">Open my bookings <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Make it a match</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">What would you like to do?</h2></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Find a court', text: 'Compare court locations, photos, and amenities.', href: '/courts', icon: MapPin, color: 'text-emerald-700 bg-emerald-50' },
            { title: 'Reserve a time', text: 'Choose a date and request an available court.', href: '/booking', icon: Zap, color: 'text-blue-700 bg-blue-50' },
            { title: 'Manage bookings', text: 'Review request status and upcoming sessions.', href: '/my-bookings', icon: CalendarDays, color: 'text-[#078A63] bg-[#EAF6EC]' },
          ].map(({ title, text, href, icon: Icon, color }) => (
            <Link key={title} to={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5">
              <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ' + color}><Icon size={21} /></div>
              <div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></div>
              <ArrowRight size={17} className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-bamicourt" className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="group relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#064A8C] via-[#075B9E] to-[#078A63] p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8">
          <div className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border-[28px] border-white/10 transition-transform duration-500 group-hover:scale-110" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-100"><Users size={14} /> About the venue</div>
          <h2 id="about-bamicourt" className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">What is BamiCourt?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base sm:leading-7">BamiCourt makes badminton reservations simple. Explore court details, check date availability, send booking requests, and follow updates from one player account.</p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/15 p-4 backdrop-blur-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-[#064A8C] shadow"><MapPin size={21} /></div>
            <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-emerald-200">Find us</p><p className="mt-0.5 text-base font-extrabold sm:text-lg">Highwood, Batangas</p></div>
          </div>
          <Link to="/courts" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-white transition hover:text-emerald-200">Explore our courts <ArrowRight size={16} /></Link>
        </article>
        <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#078A63] via-emerald-300 to-[#0876D1]" />
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#078A63]">Plan your visit</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#064A8C] sm:text-2xl">Hours & contact</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#064A8C] text-white shadow-sm"><Clock3 size={19} /></div><div><h3 className="font-extrabold text-slate-800">Opening days & time</h3><p className="mt-1 text-sm font-semibold text-[#064A8C]">Daily · 8:00 AM–10:00 PM</p><p className="mt-1 text-xs text-slate-500">Confirm holiday hours with the facility administrator.</p></div></div>
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-[#EAF6EC] to-white p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#078A63] text-white shadow-sm"><Phone size={19} /></div><div className="min-w-0"><h3 className="font-extrabold text-slate-800">Get in touch</h3><a href="mailto:anaarriola@gmail.com" className="mt-2 flex items-center gap-2 break-all text-sm font-semibold text-[#064A8C] hover:underline"><Mail size={14} className="shrink-0" />anaarriola@gmail.com</a><a href="tel:09927400273" className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#064A8C] hover:underline"><Phone size={14} className="shrink-0" />09927400273</a></div></div>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Home
