import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { askAi } from '../api/client'
import { aiReviewFormSchema, type AiReviewFormData } from '../schemas/aiReviewSchema'

const panel = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-sm'

export default function AiReviewPage() {
  const review = useMutation({ mutationFn: ({ prompt }: AiReviewFormData) => askAi(prompt) })
  const { register, handleSubmit, formState: { errors }, watch } = useForm<AiReviewFormData>({
    resolver: zodResolver(aiReviewFormSchema),
    defaultValues: { prompt: '' },
  })
  const promptLength = watch('prompt')?.length ?? 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#064A8C] via-[#0876D1] to-[#078A63] p-6 text-white shadow-lg sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">BAMICOURT · AI ASSISTANT</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Booking readiness review</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">Describe your court booking app and get practical feedback on its player experience, availability flow, and admin tools.</p>
      </section>

      <section className={panel}>
        <div className="mb-5">
          <h2 className="text-xl font-black text-[#064A8C] dark:text-blue-300">Describe your app</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Mention how players find courts and book times, how availability is handled, and what admins can manage.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit((data) => review.mutate(data))}>
          <div>
            <label htmlFor="ai-prompt" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Booking app description</label>
            <textarea
              id="ai-prompt"
              rows={7}
              maxLength={2000}
              placeholder="Players can browse badminton courts and see which ones are available. They sign in to reserve a time, while admins manage courts and approve booking requests…"
              aria-invalid={Boolean(errors.prompt)}
              aria-describedby={errors.prompt ? 'ai-prompt-error' : 'ai-prompt-help'}
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#0876D1] focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
              {...register('prompt')}
            />
            <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
              {errors.prompt ? <p id="ai-prompt-error" role="alert" className="font-semibold text-rose-600">{errors.prompt.message}</p> : <p id="ai-prompt-help">20–2000 characters. Your description is sent to the server for review.</p>}
              <span className="shrink-0">{promptLength}/2000</span>
            </div>
          </div>
          <button type="submit" disabled={review.isPending} className="rounded-xl bg-[#078A63] px-5 py-3 text-sm font-black text-white shadow transition hover:bg-[#066e4f] disabled:cursor-wait disabled:opacity-60">
            {review.isPending ? 'Reviewing your app…' : 'Review my booking app'}
          </button>
        </form>
        {review.isError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{review.error.message}</p>}
      </section>

      {review.data && (
        <section aria-live="polite" className={`${panel} space-y-5`}>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">AI assessment</p>
            <h2 className="mt-1 text-xl font-black text-[#064A8C] dark:text-blue-300">Your review</h2>
          </div>
          <p className="rounded-xl bg-slate-50 p-4 text-base font-semibold leading-7 text-slate-800 dark:bg-slate-700/50 dark:text-slate-100">{review.data.summary}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><h3 className="font-black text-emerald-800 dark:text-emerald-300">What’s working</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-200">{review.data.strengths.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>
            <div><h3 className="font-black text-[#064A8C] dark:text-blue-300">Suggested next steps</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-200">{review.data.improvements.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>
          </div>
          <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">AI feedback is a starting point. Confirm recommendations against your actual app behavior.</p>
        </section>
      )}
    </div>
  )
}
