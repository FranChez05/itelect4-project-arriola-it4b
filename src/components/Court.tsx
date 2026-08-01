import { useRef } from 'react'
import type * as React from 'react'
import type { Court as CourtType } from '../types'

interface CourtProps {
  court: CourtType | null
  courts: CourtType[]
  selectedDate: string
  onCourtChange: (courtId: number) => void
  onDateChange: (date: string) => void
  isLoading?: boolean
}

export default function Court({
  court,
  courts,
  selectedDate,
  onCourtChange,
  onDateChange,
  isLoading = false,
}: CourtProps) {
  // DOM reference using useRef to target the date input element directly
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleCourtChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCourtChange(Number(event.target.value))
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value)
  }

  const handleFocusDateInput = () => {
    // Focus the date input DOM element
    dateInputRef.current?.focus()
  }

  if (isLoading) {
    return (
      <article className="card court-card">
        <h2>Choose a court</h2>
        <p>Loading court data...</p>
      </article>
    )
  }

  return (
    <article className="card court-card">
      <h2>Choose a court</h2>
      <label>
        Court:
        <select value={court?.id ?? ''} onChange={handleCourtChange}>
          {courts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date:
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </label>
      <button
        type="button"
        onClick={handleFocusDateInput}
        style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer' }}
      >
        Focus Date Input
      </button>
      <p>{court ? (court.isAvailable ? 'Court is available' : 'Court is not available') : 'No court selected'}</p>
    </article>
  )
}