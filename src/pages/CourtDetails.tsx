import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourtById } from '../api/client'
import { useBookingStore } from '../store/useBookingStore'
import type { Court } from '../types'

// Typed params interface
export type CourtDetailsParams = {
  courtId: string
}

const CourtDetails: React.FC = () => {
  // Read URL parameter using typed useParams<{ courtId: string }>()
  const { courtId } = useParams<CourtDetailsParams>()
  const navigate = useNavigate()
  const setSelectedCourtId = useBookingStore((state) => state.setSelectedCourtId)

  // Typed useQuery call 1: Keyed by courtId URL parameter
  const {
    data: court,
    isLoading,
    isError,
  } = useQuery<Court>({
    queryKey: ['courts', courtId],
    queryFn: () => getCourtById(Number(courtId)),
    enabled: !!courtId && !isNaN(Number(courtId)),
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl text-center space-y-4 animate-pulse">
        <div className="h-6 w-1/3 mx-auto bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-4 w-1/2 mx-auto bg-slate-100 dark:bg-slate-700/60 rounded-md" />
        <p className="text-xs font-bold text-slate-500">Loading court #{courtId} details...</p>
      </div>
    )
  }

  if (isError || !court) {
    return (
      <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-slate-800 p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-2xl font-black">
          ⚠️
        </div>
        <h2 className="text-2xl font-black text-rose-950 dark:text-rose-200 uppercase">
          Court Not Found
        </h2>
        <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
          No facility matching URL parameter ID <code className="bg-rose-200 dark:bg-slate-700 px-2 py-0.5 rounded">{courtId}</code> was found.
        </p>
        <Link
          to="/courts"
          className="inline-block rounded-xl bg-[#064A8C] px-5 py-2.5 text-xs font-black uppercase text-white shadow-md hover:bg-[#0876D1]"
        >
          ← Return to Courts Directory
        </Link>
      </div>
    )
  }

  const handleBookNow = () => {
    setSelectedCourtId(court.id)
    navigate('/booking')
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Route Param Info */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 border-l-8 border-l-[#0876D1] bg-white dark:bg-slate-800 p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30 mb-2">
              📌 Route URL Param: :courtId = {courtId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#064A8C] dark:text-blue-300">
              {court.name} DETAILS
            </h1>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
              Detailed specifications and match schedule for facility ID #{court.id}.
            </p>
          </div>

          <Link
            to="/courts"
            className="shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-slate-300"
          >
            ← Back to Courts
          </Link>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#064A8C] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-700 pb-2">
              Facility Information
            </h3>

            <div className="space-y-2 text-xs font-semibold">
              <p className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 uppercase font-black">Court ID</span>
                <span className="font-extrabold text-[#0876D1]">{court.id}</span>
              </p>
              <p className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 uppercase font-black">Court Name</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{court.name}</span>
              </p>
              <p className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 uppercase font-black">Location</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{court.location}</span>
              </p>
              <p className="flex justify-between py-1.5">
                <span className="text-slate-400 uppercase font-black">Status</span>
                <span
                  className={`font-black uppercase px-2.5 py-0.5 rounded text-[10px] ${
                    court.isAvailable
                      ? 'bg-[#EAF6EC] text-[#078A63] border border-[#078A63]/30'
                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                  }`}
                >
                  {court.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-[#F5FAF6] dark:bg-slate-700/50 p-5 border border-slate-200 dark:border-slate-600 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-[#078A63] dark:text-emerald-300 uppercase">
                ⚡ Court Specifications
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <li>• BWF Standard Court Dimensions (13.4m x 6.1m)</li>
                <li>• Anti-slip professional flooring surface</li>
                <li>• High-grade LED overhead shadowless lights</li>
                <li>• Climate-controlled indoor ventilation system</li>
              </ul>
            </div>

            <button
              type="button"
              disabled={!court.isAvailable}
              onClick={handleBookNow}
              className={`w-full rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors ${
                court.isAvailable
                  ? 'bg-[#078A63] hover:bg-[#065f46]'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {court.isAvailable ? `Book ${court.name} Now →` : 'Court Currently Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourtDetails
