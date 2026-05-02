'use client'

import { FormEvent, useId, useState } from 'react'
import { Send } from 'lucide-react'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/$/,
  ''
)

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export function ContactForm() {
  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const messageId = useId()
  const websiteId = useId()
  const [status, setStatus] = useState<SubmitStatus>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setStatus('submitting')

    try {
      const response = await fetch(`${API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: getString(formData, 'name'),
          email: getString(formData, 'email'),
          phone: getString(formData, 'phone') || undefined,
          message: getString(formData, 'message'),
          website: getString(formData, 'website'),
        }),
      })

      if (!response.ok) throw new Error('Contact request failed.')

      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor={nameId}
            className="text-[11px] tracking-[0.18em] text-[#EFDFBB]/45 uppercase"
          >
            Nome
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            className="border border-[#EFDFBB]/15 bg-transparent px-3 py-3 text-sm text-[#EFDFBB] transition-colors outline-none placeholder:text-[#EFDFBB]/25 focus:border-[#EFDFBB]/55"
            placeholder="Seu nome"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor={emailId}
            className="text-[11px] tracking-[0.18em] text-[#EFDFBB]/45 uppercase"
          >
            E-mail
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="border border-[#EFDFBB]/15 bg-transparent px-3 py-3 text-sm text-[#EFDFBB] transition-colors outline-none placeholder:text-[#EFDFBB]/25 focus:border-[#EFDFBB]/55"
            placeholder="voce@email.com"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={phoneId}
          className="text-[11px] tracking-[0.18em] text-[#EFDFBB]/45 uppercase"
        >
          Telefone
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          className="border border-[#EFDFBB]/15 bg-transparent px-3 py-3 text-sm text-[#EFDFBB] transition-colors outline-none placeholder:text-[#EFDFBB]/25 focus:border-[#EFDFBB]/55"
          placeholder="+55 (11) 99999-9999"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={messageId}
          className="text-[11px] tracking-[0.18em] text-[#EFDFBB]/45 uppercase"
        >
          Mensagem
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          className="resize-none border border-[#EFDFBB]/15 bg-transparent px-3 py-3 text-sm leading-relaxed text-[#EFDFBB] transition-colors outline-none placeholder:text-[#EFDFBB]/25 focus:border-[#EFDFBB]/55"
          placeholder="Conte um pouco sobre o projeto"
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor={websiteId}>Website</label>
        <input id={websiteId} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="hover:text-primary inline-flex min-h-11 items-center justify-center gap-2 border border-[#EFDFBB]/35 px-5 text-sm tracking-[0.16em] text-[#EFDFBB] uppercase transition-colors hover:border-[#EFDFBB] hover:bg-[#EFDFBB] disabled:pointer-events-none disabled:opacity-50"
        >
          <Send size={16} aria-hidden="true" />
          {status === 'submitting' ? 'Enviando' : 'Enviar'}
        </button>

        <p aria-live="polite" className="min-h-5 text-sm text-[#EFDFBB]/55">
          {status === 'success' ? 'Mensagem enviada.' : null}
          {status === 'error' ? 'Nao foi possivel enviar agora.' : null}
        </p>
      </div>
    </form>
  )
}
