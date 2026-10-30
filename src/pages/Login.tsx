import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { useBookingStore } from '../store/useBookingStore'
import { loginSchema, type LoginFormData } from '../schemas/loginSchema'
import { loginApi, saveLocalStoredUser } from '../api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null)
    try {
      const response = await loginApi({
        email: data.email,
        password: data.password,
      })

      const username = response.user.name || data.email.split('@')[0] || 'Player'
      saveLocalStoredUser({ id: Number(response.user.id) || Date.now(), name: username, email: data.email, role: (response.user.role || 'player') as 'player' | 'admin', isActive: true })
      setAuth(response.token, {
        id: response.user.id,
        name: username,
        email: data.email,
        role: response.user.role || 'player',
      })

      await useBookingStore.getState().fetchData()

      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setApiError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <span className="bg-[#078A63] text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
            🏸 BAMICOURT AUTH
          </span>
          <h1 className="text-2xl font-black text-[#064A8C] dark:text-blue-300 uppercase pt-2">
            PLAYER SIGN IN
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Sign in to access protected court booking services.
          </p>
        </div>

        {apiError && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label
              htmlFor="login-email"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="player@example.com"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
            {errors.email && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="login-password"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
            {errors.password && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#0876D1] hover:bg-[#064A8C] py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? '🔄 Authenticating...' : '🔑 Log In & Authenticate'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Don't have a court account yet?{' '}
            <Link
              to="/register"
              className="text-[#078A63] hover:text-[#065f46] dark:text-emerald-400 underline font-black"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
