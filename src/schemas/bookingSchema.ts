import { z } from 'zod'

export const bookingSchema = z
  .object({
    courtId: z.number().min(1, 'Please select a court'),
    bookingDate: z.string().min(1, 'Booking date is required'),
    durationHours: z.number().min(1, 'Duration must be at least 1 hour'),
  })
  .refine(
    (data) => {
      const selected = new Date(data.bookingDate)
      const today = new Date(new Date().toDateString())
      return selected >= today
    },
    {
      message: 'Booking date cannot be in the past',
      path: ['bookingDate'],
    }
  )

export type BookingFormData = z.infer<typeof bookingSchema>
