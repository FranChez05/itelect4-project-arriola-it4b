import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { useBookingStore } from '../store/useBookingStore'
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema'
import { registerApi, loginApi } from '../api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'player',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null)
    try {
      const regResponse = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })

      // Log in automatically after successful registration
      const loginResponse = await loginApi({
        email: data.email,
        password: data.password,
      })

      setAuth(loginResponse.token, {
        id: regResponse.id || loginResponse.user.id,
        name: regResponse.name || data.name,
        email: data.email,
        role: regResponse.role || data.role,
      })

      // Fetch fresh court and booking data using newly acquired JWT token
      await useBookingStore.getState().fetchData()

      setIsSuccess(true)
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1000)
    } catch (err) {
      console.error('Registration error:', err)
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <span className="bg-[#078A63] text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
            🏸 BAMICOURT MEMBERSHIP
          </span>
          <h1 className="text-2xl font-black text-[#064A8C] dark:text-blue-300 uppercase pt-2">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Register your player profile to reserve badminton courts anytime.
          </p>
        </div>

        {apiError && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {isSuccess && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-3.5 text-xs font-bold text-[#078A63] dark:text-emerald-300 flex items-center gap-2">
            <span className="text-base">✅</span>
            <span>Account created successfully! Redirecting to court dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label
              htmlFor="register-name"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Full Name
            </Label>
            <Input
              id="register-name"
              type="text"
              placeholder="e.g. John Doe"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
            {errors.name && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="register-email"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Email Address
            </Label>
            <Input
              id="register-email"
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
              htmlFor="register-role"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Role
            </Label>
            <select
              id="register-role"
              {...register('role')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            >
              <option value="player">🏸 Player</option>
              <option value="admin">🛡️ Court Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.role.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="register-password"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Password
            </Label>
            <Input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              {...register('password')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
            {errors.password && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="register-confirm-password"
              className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm Password
            </Label>
            <Input
              id="register-confirm-password"
              type="password"
              placeholder="Re-type your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-[#064A8C] dark:text-white outline-none focus:border-[#0876D1]"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full rounded-xl bg-[#078A63] hover:bg-[#066e4f] py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? '🔄 Creating Account...' : '✨ Create Player Account'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Already have a player account?{' '}
            <Link
              to="/login"
              className="text-[#0876D1] hover:text-[#064A8C] dark:text-blue-400 underline font-black"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
