import { useState } from 'react'
import type { Court } from '../types'

export interface UseCourtSelectionReturn {
  selectedCourt: Court | null
  courtsList: Court[]
  availableCourts: Court[]
  selectCourt: (courtId: number) => void
  setCourts: (courts: Court[]) => void
  toggleAvailability: (courtId: number) => void
}

/**
 * Custom Hook: useCourtSelection
 * Manages court selection, list state, and availability filtering.
 * Explicit return type: UseCourtSelectionReturn
 */
export function useCourtSelection(initialCourts: Court[] = []): UseCourtSelectionReturn {
  const [courtsList, setCourtsList] = useState<Court[]>(initialCourts)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(
    initialCourts.length > 0 ? initialCourts[0] : null
  )

  const availableCourts = courtsList.filter((court) => court.isAvailable)

  const selectCourt = (courtId: number): void => {
    const court = courtsList.find((c) => c.id === courtId) ?? null
    setSelectedCourt(court)
  }

  const setCourts = (courts: Court[]): void => {
    setCourtsList(courts)
    if (courts.length > 0) {
      setSelectedCourt(courts[0])
    }
  }

  const toggleAvailability = (courtId: number): void => {
    setCourtsList((prev) =>
      prev.map((c) =>
        c.id === courtId ? { ...c, isAvailable: !c.isAvailable } : c
      )
    )
  }

  return {
    selectedCourt,
    courtsList,
    availableCourts,
    selectCourt,
    setCourts,
    toggleAvailability,
  }
}
