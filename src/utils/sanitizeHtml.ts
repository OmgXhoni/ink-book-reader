import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'b', 'i', 'u', 's', 'span', 'div',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'section', 'article', 'header', 'footer', 'nav',
      'sup', 'sub', 'abbr', 'cite',
    ],
    ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
}
