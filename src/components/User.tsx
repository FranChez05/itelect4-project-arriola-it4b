import React from 'react'
import type { User as UserType } from '../types'

interface UserProps {
  user: UserType | null
  isLoading?: boolean
  compact?: boolean
}

function UserLoadingSpinner() {
  return (
    <div className="h-full flex flex-col justify-center items-center rounded-2xl border-2 border-blue-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl text-center min-h-[300px] space-y-4 animate-pulse">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-[#0876D1]/20 border-t-[#0876D1] animate-spin" />
        <span className="absolute text-xl">🏸</span>
      </div>
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EC] dark:bg-slate-700 px-3 py-1 text-xs font-black text-[#078A63] dark:text-emerald-300 uppercase tracking-widest border border-[#078A63]/30">
          <span className="h-2 w-2 rounded-full bg-[#078A63] animate-ping" />
          LOADING PROFILE
        </span>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">Fetching player credentials & pass details...</p>
      </div>
    </div>
  )
}

function UserErrorAlert({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-slate-800 p-6 shadow-xl text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 shadow-sm border border-rose-300">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-1">
        <span className="inline-block rounded-md bg-rose-200/80 dark:bg-rose-900/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-300">
          ⚠️ Action Required
        </span>
        <h3 className="text-base font-black text-rose-950 dark:text-rose-200 uppercase pt-1">{title}</h3>
        <p className="text-xs font-bold text-rose-800/90 dark:text-rose-300 max-w-sm mx-auto">{message}</p>
      </div>
    </div>
  )
}

export default function User({ user, isLoading = false, compact = false }: UserProps) {
  if (isLoading) {
    return <UserLoadingSpinner />
  }

  if (!user) {
    return (
      <UserErrorAlert
        title="No Player Profile Loaded"
        message="Unable to retrieve active player pass. Please refresh or verify login status."
      />
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
