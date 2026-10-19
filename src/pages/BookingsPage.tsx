import React, { useState } from 'react'
import { BookingStatus } from '../types'
import type { Booking, User, Court } from '../types'

interface BookingsPageProps {
  booking?: Booking | null
  user?: User | null
  selectedCourt?: Court | null
  onConfirmBooking?: (bookingId: number) => void
}

interface HistoricalBooking {
  id: number
  courtName: string
  location: string
  date: string
  durationHours: number
  amountPaid: number
  status: BookingStatus | 'cancelled'
}

const mockBookingHistory: HistoricalBooking[] = [
  {
    id: 101,
    courtName: 'Court A - Olympic Arena',
    location: 'Main Gym (Center Court)',
    date: '2026-08-10',
    durationHours: 2,
    amountPaid: 50,
    status: BookingStatus.Completed,
  },
  {
    id: 102,
    courtName: 'Court B - Pro Synthetic',
    location: 'Main Gym (East Wing)',
    date: '2026-08-04',
    durationHours: 1,
    amountPaid: 20,
    status: BookingStatus.Completed,
  },
  {
    id: 103,
    courtName: 'Court C - Hardwood Classic',
    location: 'Main Gym (West Wing)',
    date: '2026-07-28',
    durationHours: 2,
    amountPaid: 36,
    status: 'cancelled',
  },
]

export const BookingsPage: React.FC<BookingsPageProps> = ({
  booking,
  user,
  selectedCourt,
  onConfirmBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [cancelledBookingIds, setCancelledBookingIds] = useState<number[]>([])

  const isCurrentCancelled = booking ? cancelledBookingIds.includes(booking.id) : false

  const handleCancelReservation = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this court reservation?')) {
      setCancelledBookingIds(prev => [...prev, id])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BookingStatus.Approved:
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">✓ Approved</span>
      case BookingStatus.Pending:
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">⏳ Pending Approval</span>
      case BookingStatus.Completed:
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">🏁 Completed</span>
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">✕ Cancelled</span>
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="rounded-2xl bg-[#003580] p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
            <span>📅 Reservation Management</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Court Reservations</h1>
          <p className="mt-1 text-sm text-blue-100/90 max-w-xl">
            Track current court reservations, review status approvals, and inspect past booking receipts.
          </p>
        </div>

        <div className="flex bg-[#00224f] p-1.5 rounded-xl border border-blue-400/20">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'current'
                ? 'bg-[#febb02] text-[#003580] shadow-sm'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Active Booking
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-[#febb02] text-[#003580] shadow-sm'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Past History ({mockBookingHistory.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'current' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Booking Card (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Current Reservation Status</h2>
                  <p className="text-xs text-slate-500">Live booking instance tracked in application state</p>
                </div>
                {booking && getStatusBadge(isCurrentCancelled ? 'cancelled' : booking.status)}
              </div>

              {booking ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Court Facility</span>
                      <p className="text-base font-extrabold text-slate-900">
                        {selectedCourt?.name ?? `Court #${booking.courtId}`}
                      </p>
                      <p className="text-xs text-slate-500">📍 {selectedCourt?.location ?? 'Main Facility Gym'}</p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Reserved Player</span>
                      <p className="text-base font-extrabold text-slate-900">{user?.name ?? 'Ana Arriola'}</p>
                      <p className="text-xs text-slate-500">📧 {user?.email ?? 'arriolaana@gmail.com'}</p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Booking Date</span>
                      <p className="text-base font-extrabold text-slate-900">
                        {new Date(booking.bookingDate).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-500">Standard Slot: 2:00 PM - 4:00 PM</p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Duration & Rate</span>
                      <p className="text-base font-extrabold text-[#003580]">
                        {booking.durationHours} Hours ($25/hr)
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold">Total: ${booking.durationHours * 25}.00</p>
                    </div>
                  </div>

                  {/* Booking ID reference */}
                  <div className="flex items-center justify-between rounded-lg bg-blue-50/50 p-3 border border-blue-100 text-xs">
                    <span className="text-slate-600">Booking Reference ID:</span>
                    <code className="font-mono font-bold text-[#003580] bg-white px-2 py-0.5 rounded border border-blue-200">
                      BK-2026-08-{booking.id}
                    </code>
                  </div>

                  {/* Actions */}
                  {!isCurrentCancelled && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                      {booking.status === BookingStatus.Pending && onConfirmBooking && (
                        <button
                          onClick={() => onConfirmBooking(booking.id)}
                          className="px-5 py-2.5 bg-[#003580] hover:bg-[#00224f] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          Confirm & Approve Booking
                        </button>
                      )}

                      <button
                        onClick={() => handleCancelReservation(booking.id)}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}

                  {isCurrentCancelled && (
                    <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 text-xs font-semibold text-rose-800">
                      ⚠️ This reservation was cancelled. You can select a new court from the Courts directory.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <span className="text-4xl block mb-2">📋</span>
                  <p className="font-bold text-slate-700 text-base">No Active Booking Found</p>
                  <p className="text-xs mt-1 text-slate-500">Go to the Courts page to create a new reservation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Receipt Side Box (Right 1 col) */}
          <div>
            <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🧾</span> Booking Receipt Breakdown
              </h3>

              {booking && !isCurrentCancelled ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Court Hourly Fee ({booking.durationHours} hrs x $25)</span>
                    <span className="font-semibold text-slate-900">${booking.durationHours * 25}.00</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Facility Service Fee</span>
                    <span className="font-semibold text-slate-900">$2.50</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Equipment Rental (Rackets + Shuttles)</span>
                    <span className="font-semibold text-slate-900">Included</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Member Discount (Pro Tier)</span>
                    <span className="font-semibold text-emerald-600">-$2.50</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-extrabold text-slate-900">
                    <span>Total Charged</span>
                    <span className="text-lg text-[#003580]">${booking.durationHours * 25}.00</span>
                  </div>

                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800 font-semibold">
                    ✓ Payment Method: Pay at Counter / Member Account
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  Select or confirm an active booking to preview itemized costs.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Past Court Reservations History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Court Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockBookingHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#003580]">#BK-{item.id}</td>
                    <td className="p-3 font-bold text-slate-900">{item.courtName}</td>
                    <td className="p-3 text-slate-500">{item.location}</td>
                    <td className="p-3 font-medium text-slate-700">{item.date}</td>
                    <td className="p-3 text-slate-600">{item.durationHours} hrs</td>
                    <td className="p-3 font-extrabold text-slate-900">${item.amountPaid}.00</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingsPage
