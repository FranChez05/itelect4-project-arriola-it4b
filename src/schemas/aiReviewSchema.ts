import { z } from 'zod'

export const aiReviewFormSchema = z.object({
  prompt: z.string().trim()
    .min(20, 'Describe your booking app in at least 20 characters.')
    .max(2000, 'Keep the description under 2000 characters.'),
})

export type AiReviewFormData = z.infer<typeof aiReviewFormSchema>
