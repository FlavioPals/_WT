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
            className="text-primary/45 text-[11px] tracking-[0.18em] uppercase"
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
            className="border-primary/15 text-primary placeholder:text-primary/25 focus:border-primary/55 border bg-transparent px-3 py-2 text-sm transition-colors outline-none"
            placeholder="Seu nome"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor={emailId}
            className="text-primary/45 text-[11px] tracking-[0.18em] uppercase"
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
            className="border-primary/15 text-primary placeholder:text-primary/25 focus:border-primary/55 border bg-transparent px-3 py-2 text-sm transition-colors outline-none"
            placeholder="voce@email.com"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={phoneId}
          className="text-primary/45 text-[11px] tracking-[0.18em] uppercase"
        >
          Telefone
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          className="border-primary/15 text-primary placeholder:text-primary/25 focus:border-primary/55 border bg-transparent px-3 py-2 text-sm transition-colors outline-none"
          placeholder="+55 (11) 99999-9999"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={messageId}
          className="text-primary/45 text-[11px] tracking-[0.18em] uppercase"
        >
          Mensagem
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={3}
          className="border-primary/15 text-primary placeholder:text-primary/25 focus:border-primary/55 resize-none border bg-transparent px-3 py-2 text-sm leading-relaxed transition-colors outline-none"
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
          className="border-primary/35 text-primary hover:border-primary hover:bg-primary hover:text-foreground inline-flex min-h-11 items-center justify-center gap-2 border px-5 text-sm tracking-[0.16em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <Send size={16} aria-hidden="true" />
          {status === 'submitting' ? 'Enviando' : 'Enviar'}
        </button>

        <p aria-live="polite" className="text-primary/55 min-h-5 text-sm">
          {status === 'success' ? 'Mensagem enviada.' : null}
          {status === 'error' ? 'Nao foi possivel enviar agora.' : null}
        </p>
      </div>
    </form>
  )
}
