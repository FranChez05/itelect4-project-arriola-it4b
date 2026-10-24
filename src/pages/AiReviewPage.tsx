import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { askAi } from '../api/client'
import { aiReviewFormSchema, type AiReviewFormData } from '../schemas/aiReviewSchema'

const panel = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-sm'

export default function AiReviewPage() {
  const reply = useMutation({ mutationFn: ({ prompt }: AiReviewFormData) => askAi(prompt) })
  const { register, handleSubmit, formState: { errors }, watch } = useForm<AiReviewFormData>({
    resolver: zodResolver(aiReviewFormSchema),
    defaultValues: { prompt: '' },
  })
  const promptLength = watch('prompt')?.length ?? 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#064A8C] via-[#0876D1] to-[#078A63] p-6 text-white shadow-lg sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">BAMICOURT · PLAYER AI ASSISTANT</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Ask about courts and bookings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">Ask one or more questions about using BAMICOURT. Gemini answers each question in order using the app’s booking flow.</p>
      </section>

      <section className={panel}>
        <div className="mb-5">
          <h2 className="text-xl font-black text-[#064A8C] dark:text-blue-300">Your questions</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ask about finding courts, booking, availability, your account, or admin decisions. For your personal booking status or live court availability, check My Bookings or contact an administrator.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit((data) => reply.mutate(data))}>
          <div>
            <label htmlFor="ai-prompt" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Ask BAMICOURT AI</label>
            <textarea
              id="ai-prompt"
              rows={6}
              maxLength={2000}
              placeholder="How do I book a court, and where can I check whether my request was approved?"
              aria-invalid={Boolean(errors.prompt)}
              aria-describedby={errors.prompt ? 'ai-prompt-error' : 'ai-prompt-help'}
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#0876D1] focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900"
              {...register('prompt')}
            />
            <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
              {errors.prompt ? <p id="ai-prompt-error" role="alert" className="font-semibold text-rose-600">{errors.prompt.message}</p> : <p id="ai-prompt-help">20–2000 characters. Your question is sent to Gemini through the backend.</p>}
              <span className="shrink-0">{promptLength}/2000</span>
            </div>
          </div>
          <button type="submit" disabled={reply.isPending} className="rounded-xl bg-[#078A63] px-5 py-3 text-sm font-black text-white shadow transition hover:bg-[#066e4f] disabled:cursor-wait disabled:opacity-60">
            {reply.isPending ? 'Getting your answers…' : 'Ask BAMICOURT AI'}
          </button>
        </form>
        {reply.isError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{reply.error.message}</p>}
      </section>

      {reply.data && (
        <section aria-live="polite" className={panel + ' space-y-5'}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Gemini response</p><h2 className="mt-1 text-xl font-black text-[#064A8C] dark:text-blue-300">Answers to your questions</h2></div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Topic: {reply.data.topic}</span>
          </div>
          <ol className="space-y-4">
            {reply.data.answers.map((item, index) => (
              <li key={index + '-' + item.question} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
                <h3 className="font-bold leading-6 text-slate-800 dark:text-slate-100">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{item.answer}</p>
              </li>
            ))}
          </ol>
          <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">Gemini cannot access your account, live court availability, or personal booking records.</p>
        </section>
      )}
    </div>
  )
}
