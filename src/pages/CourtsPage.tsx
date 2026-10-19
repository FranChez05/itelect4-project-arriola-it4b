import React, { useState } from 'react'
import type { Court } from '../types'

interface CourtsPageProps {
  courts?: Court[]
  onSelectCourt?: (courtId: number) => void
}

export interface DetailedCourt extends Court {
  hourlyRate: number
  floorType: string
  lighting: string
  netType: string
  maxCapacity: number
  amenities: string[]
  description: string
  rating: number
}

const detailedCourtsData: DetailedCourt[] = [
  {
    id: 1,
    name: 'Court A - Olympic Arena',
    location: 'Main Gym (Center Court)',
    isAvailable: true,
    hourlyRate: 25,
    floorType: 'BWF Certified Yonex Mat',
    lighting: '1000-Lux Anti-Glare Sports LED',
    netType: 'Yonex Tournament Net',
    maxCapacity: 4,
    amenities: ['Air Conditioning', 'Live Stream Camera', 'Umpire Chair', 'Player Bench'],
    description: 'Premier center court used for official club tournaments and championship practice.',
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Court B - Pro Synthetic',
    location: 'Main Gym (East Wing)',
    isAvailable: true,
    hourlyRate: 20,
    floorType: 'Taraflex Sports Floor',
    lighting: '800-Lux LED Lighting',
    netType: 'Victor Pro Mesh',
    maxCapacity: 4,
    amenities: ['Air Conditioning', 'Player Bench', 'Scoreboard'],
    description: 'High-traction synthetic court perfect for competitive singles and doubles training.',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Court C - Hardwood Classic',
    location: 'Main Gym (West Wing)',
    isAvailable: false,
    hourlyRate: 18,
    floorType: 'Premium Maple Hardwood',
    lighting: 'Standard Sports LED',
    netType: 'Standard Nylon Net',
    maxCapacity: 4,
    amenities: ['Spectator Seating', 'Player Bench'],
    description: 'Traditional sprung maple wood floor offering excellent shock absorption.',
    rating: 4.6,
  },
  {
    id: 4,
    name: 'Court D - Training Suite',
    location: 'Annex Building (2nd Floor)',
    isAvailable: true,
    hourlyRate: 15,
    floorType: 'Rubber Cushion Turf',
    lighting: 'Soft Eco LED',
    netType: 'Training Net',
    maxCapacity: 4,
    amenities: ['Shuttle Machine', 'Target Mirrors', 'Cooling Fan'],
    description: 'Dedicated training studio outfitted with shuttle feeding equipment for solo practice.',
    rating: 4.7,
  },
]

export const CourtsPage: React.FC<CourtsPageProps> = ({ onSelectCourt }) => {
  const [searchFilter, setSearchFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [selectedCourtDetail, setSelectedCourtDetail] = useState<DetailedCourt | null>(detailedCourtsData[0])

  const filteredCourts = detailedCourtsData.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      court.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
      court.floorType.toLowerCase().includes(searchFilter.toLowerCase())

    if (availabilityFilter === 'available') return matchesSearch && court.isAvailable
    if (availabilityFilter === 'unavailable') return matchesSearch && !court.isAvailable
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl bg-[#003580] p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
            <span>🏸 Facility Directory</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Courts & Specifications</h1>
          <p className="mt-1 text-sm text-blue-100/90 max-w-xl">
            Browse our full lineup of BWF-certified badminton courts, inspect technical surface specs, and reserve your playing slot.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-[#00224f] p-3 rounded-xl border border-blue-400/20">
          <div className="text-right">
            <span className="block text-[11px] uppercase font-bold text-blue-300">Total Available</span>
            <span className="text-2xl font-extrabold text-[#febb02]">
              {detailedCourtsData.filter(c => c.isAvailable).length} / {detailedCourtsData.length} Open
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search court, surface, or location..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:border-[#003580] focus:ring-2 focus:ring-blue-100"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            {(['all', 'available', 'unavailable'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setAvailabilityFilter(status)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold capitalize rounded-md transition-colors ${
                  availabilityFilter === status
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid + Detail Panel Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Cards List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
            <span>Select a Court ({filteredCourts.length})</span>
            <span className="text-xs text-slate-500 font-normal">Click any card to inspect full technical specs</span>
          </h2>

          {filteredCourts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <span className="text-4xl block mb-2">🏸</span>
              <p className="text-base font-bold text-slate-700">No courts match your search filter</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword or switching availability filter.</p>
              <button
                onClick={() => { setSearchFilter(''); setAvailabilityFilter('all'); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourts.map((court) => {
                const isSelected = selectedCourtDetail?.id === court.id
                return (
                  <div
                    key={court.id}
                    onClick={() => setSelectedCourtDetail(court)}
                    className={`cursor-pointer rounded-xl border p-5 transition-all ${
                      isSelected
                        ? 'border-[#003580] bg-blue-50/40 ring-2 ring-[#003580]/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          ★ {court.rating} / 5.0
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{court.name}</h3>
                        <p className="text-xs font-medium text-slate-500">📍 {court.location}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          court.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {court.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Floor Surface:</span>
                        <span className="font-semibold text-slate-800">{court.floorType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rate:</span>
                        <span className="font-extrabold text-[#003580]">${court.hourlyRate}/hour</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isSelected ? '✓ Currently Selected' : 'Click to inspect'}
                      </span>

                      {court.isAvailable && onSelectCourt && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectCourt(court.id)
                          }}
                          className="px-3 py-1.5 bg-[#febb02] text-[#003580] font-bold text-xs rounded hover:bg-[#e0a800] transition-colors"
                        >
                          Select for Booking
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Court Inspector Side Panel (Right 1 Column) */}
        <div>
          {selectedCourtDetail ? (
            <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                    Court Details
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      selectedCourtDetail.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedCourtDetail.isAvailable ? 'Ready for Booking' : 'Currently Unavailable'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedCourtDetail.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">📍 {selectedCourtDetail.location}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedCourtDetail.description}
              </p>

              {/* Technical Specifications list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical Specs</h4>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500 font-medium">Floor Material</span>
                    <span className="font-bold text-slate-800">{selectedCourtDetail.floorType}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500 font-medium">Lighting System</span>
                    <span className="font-bold text-slate-800">{selectedCourtDetail.lighting}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500 font-medium">Net Equipment</span>
                    <span className="font-bold text-slate-800">{selectedCourtDetail.netType}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500 font-medium">Max Capacity</span>
                    <span className="font-bold text-slate-800">{selectedCourtDetail.maxCapacity} Players</span>
                  </div>
                </div>
              </div>

              {/* Amenities tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Court Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourtDetail.amenities.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium text-slate-700">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Price Rate</span>
                  <span className="text-2xl font-extrabold text-[#003580]">${selectedCourtDetail.hourlyRate} <span className="text-xs font-normal text-slate-500">/ hr</span></span>
                </div>

                {onSelectCourt && (
                  <button
                    disabled={!selectedCourtDetail.isAvailable}
                    onClick={() => onSelectCourt(selectedCourtDetail.id)}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-md ${
                      selectedCourtDetail.isAvailable
                        ? 'bg-[#003580] text-white hover:bg-[#00224f] active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {selectedCourtDetail.isAvailable ? 'Confirm Court Selection' : 'Court Unavailable'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              Select a court from the list to inspect specs.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourtsPage
