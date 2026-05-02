import sanitizeHtml from 'sanitize-html'

export function sanitizeRichText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'h2', 'h3', 'blockquote', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
  }).trim()
}
