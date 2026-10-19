import type * as React from 'react'

interface CardProps {
  children: React.ReactNode
  step?: number
  stepTitle?: string
  stepSubTitle?: string
  badgeText?: string
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning'
  className?: string
}

export default function Card({
  children,
  step,
  stepTitle,
  stepSubTitle,
  badgeText,
  badgeVariant = 'primary',
  className = '',
}: CardProps) {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-[#F5FAF6] dark:bg-slate-700 text-[#078A63] dark:text-emerald-400 border border-[#078A63]/30'
      case 'warning':
        return 'bg-amber-50 dark:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-300'
      default:
        return 'bg-[#F5FAF6] dark:bg-slate-700 text-[#0876D1] dark:text-blue-400 border border-[#0876D1]/30'
    }
  }

  return (
    <article
      className={`h-full flex flex-col justify-between rounded-2xl border-2 border-[#064A8C]/20 dark:border-slate-700 border-t-4 border-t-[#064A8C] bg-white dark:bg-slate-800 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-[#064A8C] dark:text-slate-100 transition-all duration-300 ${className}`}
    >
      <div>
        {(step !== undefined || stepTitle || badgeText) && (
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2.5">
              {step !== undefined && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#064A8C] text-xs font-black text-white shadow-sm">
                  {step}
                </span>
              )}
              <div>
                {stepTitle && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#064A8C] dark:text-blue-300 block">
                    {stepTitle}
                  </span>
                )}
                {stepSubTitle && (
                  <h2 className="text-sm font-black text-[#064A8C] dark:text-blue-300 leading-tight">
                    {stepSubTitle}
                  </h2>
                )}
              </div>
            </div>
            {badgeText && (
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold capitalize ${getBadgeStyle()}`}>
                {badgeText}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </article>
  )
}
