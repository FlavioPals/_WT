import { describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '../../lib/prisma'
import { slugify, uniqueProjectSlug, uniqueTeamMemberSlug } from '../../lib/slug'

const mockFindFirst = vi.mocked(prisma.project.findFirst)
const mockTeamMemberFindFirst = vi.mocked(prisma.teamMember.findFirst)

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips diacritics', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume')
  })

  it('converts ç to c', () => {
    expect(slugify('Construção')).toBe('construcao')
  })

  it('removes special characters', () => {
    expect(slugify('foo & bar! (2024)')).toBe('foo-bar-2024')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('foo   ---   bar')).toBe('foo-bar')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  -foo bar-  ')).toBe('foo-bar')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })
})

describe('uniqueProjectSlug', () => {
  it('returns the base slug when no conflict', async () => {
    mockFindFirst.mockResolvedValueOnce(null)
    const slug = await uniqueProjectSlug('My Project')
    expect(slug).toBe('my-project')
    expect(mockFindFirst).toHaveBeenCalledTimes(1)
  })

  it('appends -2 on first conflict', async () => {
    mockFindFirst.mockResolvedValueOnce({ id: 'existing' } as never).mockResolvedValueOnce(null)
    const slug = await uniqueProjectSlug('My Project')
    expect(slug).toBe('my-project-2')
  })

  it('keeps incrementing until unique', async () => {
    mockFindFirst
      .mockResolvedValueOnce({ id: 'a' } as never)
      .mockResolvedValueOnce({ id: 'b' } as never)
      .mockResolvedValueOnce({ id: 'c' } as never)
      .mockResolvedValueOnce(null)
    const slug = await uniqueProjectSlug('My Project')
    expect(slug).toBe('my-project-4')
  })

  it('uses "project" as fallback for empty base', async () => {
    mockFindFirst.mockResolvedValueOnce(null)
    const slug = await uniqueProjectSlug('!!!###')
    expect(slug).toBe('project')
  })
})

describe('uniqueTeamMemberSlug', () => {
  it('returns the base slug when no conflict', async () => {
    mockTeamMemberFindFirst.mockResolvedValueOnce(null)
    const slug = await uniqueTeamMemberSlug('Maria Silva')
    expect(slug).toBe('maria-silva')
  })

  it('appends suffixes until the team member slug is unique', async () => {
    mockTeamMemberFindFirst
      .mockResolvedValueOnce({ id: 'a' } as never)
      .mockResolvedValueOnce({ id: 'b' } as never)
      .mockResolvedValueOnce(null)
    const slug = await uniqueTeamMemberSlug('Maria Silva')
    expect(slug).toBe('maria-silva-3')
  })

  it('uses a team-member fallback for empty names', async () => {
    mockTeamMemberFindFirst.mockResolvedValueOnce(null)
    const slug = await uniqueTeamMemberSlug('!!!')
    expect(slug).toBe('team-member')
  })
})
