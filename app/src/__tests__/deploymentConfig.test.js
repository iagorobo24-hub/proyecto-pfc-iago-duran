import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function readAppFile(path) {
  return readFileSync(resolve(appRoot, path), 'utf8')
}

function getSecurityHeader(headers, key) {
  return headers
    .flatMap(entry => entry.headers)
    .find(header => header.key.toLowerCase() === key.toLowerCase())
    ?.value
}

function vercelSourceToRegex(source) {
  return new RegExp(`^${source}$`)
}

describe('deployment configuration', () => {
  it('does not rewrite static asset requests to the SPA html fallback', () => {
    const vercelConfig = JSON.parse(readAppFile('vercel.json'))
    const spaFallback = vercelConfig.rewrites.at(-1)
    const matchesFallback = vercelSourceToRegex(spaFallback.source)

    expect(matchesFallback.test('/app/sonex')).toBe(true)
    expect(matchesFallback.test('/app/fichas')).toBe(true)

    expect(matchesFallback.test('/assets/sonexTurnOrchestrator-CSu_vbHC.js')).toBe(false)
    expect(matchesFallback.test('/sw.js')).toBe(false)
    expect(matchesFallback.test('/registerSW.js')).toBe(false)
    expect(matchesFallback.test('/manifest.webmanifest')).toBe(false)
    expect(matchesFallback.test('/logos/schneider.png')).toBe(false)
  })

  it('does not let PWA updates take control of active tabs mid-session', () => {
    const viteConfig = readAppFile('vite.config.js')

    expect(viteConfig).toContain("registerType: 'prompt'")
    expect(viteConfig).not.toMatch(/registerType:\s*['"]autoUpdate['"]/)
    expect(viteConfig).not.toMatch(/\bskipWaiting:\s*true\b/)
    expect(viteConfig).not.toMatch(/\bclientsClaim:\s*true\b/)
  })

  it('keeps the deployed CSP aligned with runtime browser requests', () => {
    const vercelConfig = JSON.parse(readAppFile('vercel.json'))
    const csp = getSecurityHeader(vercelConfig.headers, 'Content-Security-Policy')

    expect(csp).toContain('https://fonts.googleapis.com')
    expect(csp).toContain('https://fonts.gstatic.com')
    expect(csp).toContain('wss://*.supabase.co')
    expect(csp).toContain('https://api.openrouter.ai')
  })
})
