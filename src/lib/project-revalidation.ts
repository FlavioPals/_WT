import 'server-only'

import { revalidatePath } from 'next/cache'

export function revalidateProjectPages(slug?: string) {
  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')

  if (slug) {
    revalidatePath(`/portfolio/${slug}`)
  }
}
