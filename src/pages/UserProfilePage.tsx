import React, { useState } from 'react'
import type { User } from '../types'

interface UserProfilePageProps {
  user?: User | null
  onUpdateUser?: (updated: Partial<User>) => void
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onUpdateUser }) => {
  const [nameInput, setNameInput] = useState(user?.name ?? 'Ana Arriola')
  const [emailInput, setEmailInput] = useState(user?.email ?? 'arriolaana@gmail.com')
  const [roleInput, setRoleInput] = useState<'player' | 'admin'>(user?.role ?? 'player')
  const [isActiveState, setIsActiveState] = useState(user?.isActive ?? true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (onUpdateUser) {
      onUpdateUser({
        name: nameInput,
        email: emailInput,
        role: roleInput,
        isActive: isActiveState,
      })
    }
    setSaveSuccessMsg('Profile changes saved successfully!')
    setTimeout(() => setSaveSuccessMsg(''), 3000)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#003580] p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#febb02] text-[#003580] font-extrabold text-2xl shadow-md border-2 border-white">
            {nameInput.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 border border-blue-400/30 px-3 py-0.5 text-xs font-semibold text-blue-200">
              <span>👤 Player Profile & Settings</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{nameInput}</h1>
            <p className="text-xs text-blue-100/90">{emailInput} • {roleInput.toUpperCase()} MEMBER</p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-[#00224f] px-4 py-2 rounded-xl border border-blue-400/20">
          <span className={`h-3 w-3 rounded-full ${isActiveState ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-white">
            Account Status: {isActiveState ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Editable Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Update your account credentials and role assignments</p>
              </div>
              {saveSuccessMsg && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ {saveSuccessMsg}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#003580] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#003580] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">System Role</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as 'player' | 'admin')}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#003580]"
                >
                  <option value="player">Player (Regular Member)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Active State</label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsActiveState(!isActiveState)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActiveState ? 'bg-[#003580]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActiveState ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-slate-700">
                    {isActiveState ? 'Account Active' : 'Account Suspended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification preferences section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Email Reservation Alerts</span>
                    <span className="text-[11px] text-slate-500">Receive booking confirmation emails & reminders</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">SMS Quick Updates</span>
                    <span className="text-[11px] text-slate-500">Receive text notifications for court schedule changes</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#003580] hover:bg-[#00224f] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Save Profile Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Player Stats & Badge Highlights */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>📊</span> Player Lifetime Stats
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Total Matches Played</span>
                <span className="font-extrabold text-slate-900">42 Games</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Hours Spent on Court</span>
                <span className="font-extrabold text-[#003580]">68 Hours</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Favorite Venue</span>
                <span className="font-bold text-slate-800">Court A (Olympic Arena)</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Cancellation Rate</span>
                <span className="font-bold text-emerald-600">2.4% (Excellent)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h4 className="font-bold text-amber-900 text-sm">Pro Club Member</h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your account receives 30-day advance court booking privileges and complimentary shuttlecock replenishment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
