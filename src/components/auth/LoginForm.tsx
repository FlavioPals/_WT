'use client'

import { useActionState } from 'react'
import { LoaderCircle, Lock } from 'lucide-react'
import { loginAction, type LoginState } from '@/app/login/actions'

interface LoginFormProps {
  callbackUrl: string
}

const initialState: LoginState = {}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="grid gap-2 text-sm text-white">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-muted focus:border-primary h-11 border bg-white px-3 text-black transition-colors outline-none"
          placeholder="admin@studiowt.com.br"
        />
      </label>

      <label className="grid gap-2 text-sm text-white">
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="border-muted focus:border-primary h-11 border bg-white px-3 text-black transition-colors outline-none"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p
          className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary hover:bg-accent inline-flex h-11 items-center justify-center gap-2 px-4 text-sm text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
        ) : (
          <Lock size={16} strokeWidth={1.5} aria-hidden="true" />
        )}
        Entrar no dashboard
      </button>
    </form>
  )
}
