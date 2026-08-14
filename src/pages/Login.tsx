import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const [email, setEmail] = useState('arriolaana@gmail.com')
  const [password, setPassword] = useState('password123')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Perform login with token
    login(`token_${Date.now()}_badminton_pass`)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <span className="bg-[#078A63] text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg">
            🏸 BAMICOURT AUTH
          </span>
          <h1 className="text-2xl font-black text-[#064A8C] dark:text-blue-300 uppercase pt-2">
            PLAYER SIGN IN
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Sign in to access protected court booking services.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#0876D1] hover:bg-[#064A8C] py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors"
          >
            🔑 Log In & Authenticate
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
