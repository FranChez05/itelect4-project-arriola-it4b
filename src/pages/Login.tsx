import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { loginSchema, type LoginFormData } from '../schemas/loginSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'arriolaana@gmail.com',
      password: 'password123',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    // Perform login with token — only fires when Zod validation passes
    const username = data.email.split('@')[0] || 'player'
    login(username)
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
            className="w-full rounded-xl bg-[#0876D1] hover:bg-[#064A8C] py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors"
          >
            🔑 Log In & Authenticate
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
