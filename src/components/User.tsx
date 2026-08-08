import type { User as UserType } from '../types'

interface UserProps {
  user: UserType | null
  isLoading?: boolean
  compact?: boolean
}

export default function User({ user, isLoading = false, compact = false }: UserProps) {
  if (isLoading) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="relative mb-3">
          <svg className="animate-spin h-9 w-9 text-[#064A8C] dark:text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-slate-700 px-3 py-0.5 text-xs font-extrabold text-[#064A8C] dark:text-blue-300 uppercase tracking-wider mb-1">
          Loading Profile
        </span>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading player credentials...</p>
      </article>
    )
  }

  if (!user) {
    return (
      <article className="h-full flex flex-col justify-center items-center rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-slate-800 p-6 shadow-md text-center transition-colors duration-300 min-h-[320px]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 dark:bg-amber-900/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
          Profile Unavailable
        </span>
        <h3 className="text-base font-black text-amber-950 dark:text-amber-200">No Player Loaded</h3>
        <p className="mt-1 text-xs font-semibold text-amber-800/80 dark:text-amber-300/80 max-w-xs">
          Unable to retrieve player profile. Please refresh or log in again.
        </p>
      </article>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 rounded-md bg-[#064A8C] px-3 py-1.5 border border-emerald-500/20 text-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#078A63] text-xs font-black text-white">
          {user.name.charAt(0)}
        </div>
        <div className="text-left leading-tight">
          <p className="text-xs font-bold text-white flex items-center gap-1">
            {user.name}
            <span className="h-1.5 w-1.5 rounded-full bg-[#078A63]" title="Active" />
          </p>
          <p className="text-[10px] font-semibold text-blue-200 capitalize">{user.role}</p>
        </div>
      </div>
    )
  }

  return (
    <article className="h-full flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Sport Magazine Asymmetric Banner Header */}
      <div className="bg-[#064A8C] dark:bg-slate-950 px-5 py-4 text-white flex items-center justify-between border-b-2 border-[#078A63]">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#078A63] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
            01
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-blue-100">
            PLAYER PROFILE
          </span>
        </div>
        <span className="rounded-md bg-white/10 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
          {user.role}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Athlete Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#064A8C] text-2xl font-black text-white shadow-md ring-4 ring-[#078A63]/20">
              {user.name.charAt(0)}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 bg-[#078A63]" title="Active Member" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-[#064A8C] dark:text-blue-300 truncate tracking-tight">{user.name}</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#078A63] dark:bg-emerald-400" />
              Badminton Player
            </div>
          </div>
        </div>

        {/* Credentials & Membership Stat Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/60 p-3 border border-slate-200/80 dark:border-slate-600/60">
            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">Account</span>
            <span className="mt-1 block text-xs font-black text-[#064A8C] dark:text-blue-300 capitalize">{user.role}</span>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/60 p-3 border border-slate-200/80 dark:border-slate-600/60">
            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">Status</span>
            <span className="mt-1 flex items-center gap-1 text-xs font-black text-[#078A63] dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#078A63] dark:bg-emerald-400" />
              {user.isActive ? 'Active Pass' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Footer Athlete Pass Badge */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>BAMICOURT ATHLETE</span>
          <span className="text-[#078A63] dark:text-emerald-400 flex items-center gap-1">
            ✓ Verified
          </span>
        </div>
      </div>
    </article>
  )
}
