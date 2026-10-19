import type { User as UserType } from '../types'

export interface UserCardProps {
  user: UserType | null
  isLoading?: boolean
  error?: string | null
  variant?: 'default' | 'compact' | 'detailed'
}

export default function UserCard({
  user,
  isLoading = false,
  error = null,
  variant = 'default',
}: UserCardProps) {
  // Styled Loading State
  if (isLoading) {
    return (
      <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-6 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </article>
    )
  }

  // Styled Error State
  if (error || !user) {
    return (
      <article className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm transition-colors dark:border-red-900/50 dark:bg-red-950/40">
        <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-900/60 dark:text-red-200">
            !
          </span>
          <div>
            <h3 className="text-sm font-bold">User Error</h3>
            <p className="mt-1 text-xs">{error ?? 'No user profile available'}</p>
          </div>
        </div>
      </article>
    )
  }

  // Variant: Compact
  if (variant === 'compact') {
    return (
      <article className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm dark:bg-blue-500">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {user.name}
              <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </p>
            <p className="text-[11px] font-semibold capitalize text-slate-500 dark:text-slate-400">
              {user.role} • {user.email}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {user.role}
        </span>
      </article>
    )
  }

  // Variant: Detailed
  if (variant === 'detailed') {
    return (
      <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              User Profile Card
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user.isActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {user.isActive ? 'Active Member' : 'Inactive Account'}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-base font-bold text-white shadow-md dark:from-blue-500 dark:to-indigo-600">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <p className="mt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">ID: #{user.id}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 dark:bg-slate-800/50">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Role:</span>
              <span className="font-bold capitalize text-slate-900 dark:text-white">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Account Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Variant: Default
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:border-t-blue-500 dark:bg-slate-900">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Info</h2>
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {user.role}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-500">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
        <span className="font-medium text-slate-500 dark:text-slate-400">Status</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>
    </article>
  )
}
