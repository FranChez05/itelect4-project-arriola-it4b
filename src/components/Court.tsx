import type * as React from 'react'
import type { Court as CourtType } from '../types'

interface CourtProps {
  court: CourtType
  courts: CourtType[]
  selectedDate: string
  onCourtChange: (courtId: number) => void
  onDateChange: (date: string) => void
}

export default function Court({
  court,
  courts,
  selectedDate,
  onCourtChange,
  onDateChange,
}: CourtProps) {
  const handleCourtChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCourtChange(Number(event.target.value))
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value)
  }

  return (
    <article className="card court-card">
      <h2>Choose a court</h2>
      <label>
        Court:
        <select value={court.id} onChange={handleCourtChange}>
          {courts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date:
        <input type="date" value={selectedDate} onChange={handleDateChange} />
      </label>
      <p>{court.isAvailable ? 'Court is available' : 'Court is not available'}</p>
    </article>
  )
}
