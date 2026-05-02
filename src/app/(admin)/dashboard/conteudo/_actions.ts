'use server'

import { revalidatePath } from 'next/cache'
import { bulkUpdateSiteContent } from '@/lib/api/site'
import { ApiError } from '@/lib/api-client'

export interface ContentFormState {
  error?: string
  success?: string
}

function extractError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Erro inesperado. Tente novamente.'
}

export async function updateSiteContentAction(
  _state: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const items = [
    { key: 'home:manifesto', value: (formData.get('manifesto') as string) ?? '' },
    { key: 'sobre:about', value: (formData.get('about') as string) ?? '' },
    { key: 'contato:phone', value: (formData.get('contactPhone') as string) ?? '' },
    { key: 'contato:email', value: (formData.get('contactEmail') as string) ?? '' },
    { key: 'contato:city', value: (formData.get('contactCity') as string) ?? '' },
    { key: 'contato:instagram', value: (formData.get('instagram') as string) ?? '' },
  ]

  try {
    await bulkUpdateSiteContent(items)
    revalidatePath('/')
    revalidatePath('/sobre')
    revalidatePath('/dashboard/conteudo')
    return { success: 'Conteúdo salvo.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}
