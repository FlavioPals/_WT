'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Props {
  password: string
  onDismiss: () => void
}

export function TempPasswordDisplay({ password, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyPassword() {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <div className="mb-3">
        <p className="text-sm font-medium">Salve esta senha agora</p>
        <p className="mt-1 text-xs text-amber-900/70">Ela sera mostrada uma unica vez.</p>
      </div>

      <div className="flex gap-2">
        <input
          readOnly
          value={password}
          className="min-w-0 flex-1 border border-amber-300 bg-white px-3 py-2 font-mono text-sm outline-none"
        />
        <button
          type="button"
          onClick={copyPassword}
          className="inline-flex h-10 items-center gap-2 border border-amber-300 bg-white px-3 text-sm text-amber-950 transition-colors hover:border-amber-500"
        >
          {copied ? (
            <Check size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Copy size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-xs font-medium text-amber-950 underline-offset-4 transition-colors hover:underline"
      >
        Entendido
      </button>
    </div>
  )
}
