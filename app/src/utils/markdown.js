import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  breaks: true,
  gfm: true,
})

function normalizeAiMarkdown(text) {
  return String(text)
    .replace(/\$?\\(?:rightarrow|to)\$?/gi, '→')
    .replace(/\$?\\leftarrow\$?/gi, '←')
}

export function renderMarkdown(text) {
  if (!text) return ''
  const html = marked.parse(normalizeAiMarkdown(text))
  return DOMPurify.sanitize(html)
}

export default renderMarkdown
