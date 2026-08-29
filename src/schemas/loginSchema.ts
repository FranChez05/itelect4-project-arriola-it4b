import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Must be a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine(
    (data) => {
      const username = data.email.split('@')[0]?.toLowerCase() ?? ''
      return !username || !data.password.toLowerCase().includes(username)
    },
    {
      message: 'Password must not contain your username',
      path: ['password'],
    }
  )

export type LoginFormData = z.infer<typeof loginSchema>
