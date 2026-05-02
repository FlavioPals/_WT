import { describe, expect, it } from 'vitest'
import { sanitizeRichText } from '../../lib/sanitize-html'

describe('sanitizeRichText', () => {
  it('keeps allowed formatting tags', () => {
    expect(sanitizeRichText('<p>Hello <strong>world</strong></p>')).toBe(
      '<p>Hello <strong>world</strong></p>'
    )
  })

  it('removes scripts and unsafe attributes', () => {
    expect(sanitizeRichText('<p onclick="alert(1)">Hi</p><script>alert(1)</script>')).toBe(
      '<p>Hi</p>'
    )
  })

  it('normalizes links with safe rel and target attributes', () => {
    const output = sanitizeRichText('<a href="https://example.com">Example</a>')
    expect(output).toContain('href="https://example.com"')
    expect(output).toContain('target="_blank"')
    expect(output).toContain('rel="noopener noreferrer"')
    expect(output).toContain('>Example</a>')
  })

  it('removes javascript URLs', () => {
    const output = sanitizeRichText('<a href="javascript:alert(1)">Bad</a>')
    expect(output).not.toContain('javascript:')
    expect(output).toContain('target="_blank"')
    expect(output).toContain('rel="noopener noreferrer"')
    expect(output).toContain('>Bad</a>')
  })
})
