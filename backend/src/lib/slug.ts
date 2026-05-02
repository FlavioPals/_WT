import { prisma } from './prisma'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çć]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Returns a slug that is unique in the projects table, appending -2, -3 … as needed. */
export async function uniqueProjectSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'project'
  let candidate = root
  let suffix = 1

  while (true) {
    const existing = await prisma.project.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
    suffix += 1
    candidate = `${root}-${suffix}`
  }
}

/** Returns a slug that is unique in the team member table, appending -2, -3 as needed. */
export async function uniqueTeamMemberSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'team-member'
  let candidate = root
  let suffix = 1

  while (true) {
    const existing = await prisma.teamMember.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
    suffix += 1
    candidate = `${root}-${suffix}`
  }
}
