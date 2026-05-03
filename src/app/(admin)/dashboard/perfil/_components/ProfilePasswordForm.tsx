'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Save } from 'lucide-react'
import { changeOwnPasswordAction, type ProfileFormState } from '../_actions'

const initialState: ProfileFormState = {}

interface PasswordFieldProps {
  id: string
  name: string
  label: string
  placeholder: string
  error?: string
  hint?: string
}

function PasswordField({ id, name, label, placeholder, error, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-primary text-sm font-semibold">
        {label}
      </label>
      <div className="border-primary/70 focus-within:border-primary flex h-10 items-center border bg-white">
        <LockKeyhole size={16} strokeWidth={1.6} className="text-primary/55 mx-3 shrink-0" />
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          minLength={name === 'newPassword' ? 8 : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="placeholder:text-primary/25 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="text-primary/35 hover:text-primary grid size-10 place-items-center transition-colors"
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-primary/70 text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProfilePasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPasswordAction, initialState)

  return (
    <form action={formAction} className="grid gap-7">
      <PasswordField
        id="current-password"
        name="currentPassword"
        label="Senha atual"
        placeholder="Informe sua senha atual"
        error={state.fieldErrors?.currentPassword}
      />

      <PasswordField
        id="new-password"
        name="newPassword"
        label="Nova senha"
        placeholder="Defina uma nova senha"
        hint="Minimo de 8 caracteres"
        error={state.fieldErrors?.newPassword}
      />

      <PasswordField
        id="confirm-password"
        name="confirmPassword"
        label="Confirmar nova senha"
        placeholder="Repita a nova senha"
        error={state.fieldErrors?.confirmPassword}
      />

      {state.error && (
        <p className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="border-muted bg-surface border px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-accent inline-flex h-10 items-center gap-2 px-5 text-sm font-medium text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? (
            <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
          ) : (
            <Save size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          Alterar senha
        </button>
      </div>
    </form>
  )
}
