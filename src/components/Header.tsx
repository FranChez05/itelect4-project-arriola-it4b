import type React from 'react'

interface HeaderProps {
  hasLoaded?: boolean
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="bg-[#064A8C] text-white shadow-md border-b-4 border-[#078A63]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          {/* Sporty Shuttlecock Icon Badge */}
          <div className="shrink-0 bg-[#078A63] text-white p-2.5 rounded-lg shadow-sm flex items-center justify-center">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="2.5" fill="currentColor" />
              <path d="M9.5 8L6 17h12l-3.5-9H9.5z" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <line x1="9" y1="18" x2="15" y2="18" />
            </svg>
          </div>

          {/* Main Brand Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white leading-none">
              BAMICOURT
            </h1>
            <p className="text-xs font-bold tracking-wide text-[#76E4B8] uppercase mt-1">
              Badminton Court Booking
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
