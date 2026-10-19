import { useRef } from 'react'
import type * as React from 'react'
import type { Court as CourtType } from '../types'

export interface CourseCardProps {
  court: CourtType | null
  courts: CourtType[]
  selectedDate: string
  onCourtChange: (courtId: number) => void
  onDateChange: (date: string) => void
  isLoading?: boolean
  error?: string | null
  variant?: 'default' | 'compact' | 'detailed'
}

export default function CourseCard({
  court,
  courts,
  selectedDate,
  onCourtChange,
  onDateChange,
  isLoading = false,
  error = null,
  variant = 'default',
}: CourseCardProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleCourtChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCourtChange(Number(event.target.value))
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value)
  }

  const handleFocusDateInput = () => {
    dateInputRef.current?.focus()
  }

  // Styled Loading State
  if (isLoading) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </article>
    )
  }

  // Styled Error State
  if (error) {
    return (
      <article className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-colors dark:border-amber-900/50 dark:bg-amber-950/40">
        <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 dark:bg-amber-900/60 dark:text-amber-300">
            ⚠️
          </span>
          <div>
            <h3 className="text-sm font-bold">Court Loading Warning</h3>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        </div>
      </article>
    )
  }

  // Variant: Compact
  if (variant === 'compact') {
    return (
      <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{court?.name ?? 'No Court'}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{court?.location}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            court?.isAvailable
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}>
            {court?.isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            value={court?.id ?? ''}
            onChange={handleCourtChange}
          >
            {courts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </article>
    )
  }

  // Variant: Default / Detailed
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:border-t-blue-500 dark:bg-slate-900">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Choose Court / Course
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select venue & date</p>
          </div>
          <span className="rounded bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs dark:bg-blue-500">
            Step 1 of 2
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Court
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-xs outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
              value={court?.id ?? ''}
              onChange={handleCourtChange}
            >
              {courts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Reservation Date
              </label>
              <button
                className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                type="button"
                onClick={handleFocusDateInput}
              >
                Focus Date
              </button>
            </div>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-xs outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-xs border ${
            court?.isAvailable
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                court?.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold">
              {court ? (court.isAvailable ? 'Available Now' : 'Occupied') : 'No Selection'}
            </span>
          </div>
          <span className="font-extrabold uppercase">
            {court ? (court.isAvailable ? 'Open' : 'Booked') : 'N/A'}
          </span>
        </div>
      </div>
    </article>
  )
}
