import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto my-12 text-center">
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl space-y-5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-4xl font-black border-2 border-rose-300">
          404
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-md bg-rose-100 dark:bg-rose-900/40 px-3 py-1 text-xs font-black uppercase text-rose-800 dark:text-rose-300 tracking-wider">
            Page Out of Bounds
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#064A8C] dark:text-blue-300">
            PAGE NOT FOUND
          </h1>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            The URL you requested does not exist or has been moved. Use the navigation buttons below to return safely to the portal.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-[#0876D1] hover:bg-[#064A8C] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors"
          >
            🏠 Go To Home
          </Link>
          <Link
            to="/courts"
            className="rounded-xl bg-[#078A63] hover:bg-[#065f46] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors"
          >
            🏸 Browse Courts
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
