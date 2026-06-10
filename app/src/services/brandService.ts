/**
 * Brand Service — single source of truth for brand logos, colors, gradients.
 */
interface BrandLogoData {
  logo: string | null
  initials: string
  gradient: string
}

const BRAND_METADATA: Record<string, { logo: string; color: string }> = {
  'SCHNEIDER ELECTRIC': { logo: '/logos/schneider.png', color: '#3DCD58' },
  'ABB': { logo: '/logos/abb.png', color: '#FF000F' },
  'SIEMENS': { logo: '/logos/siemens.png', color: '#009999' },
  'MITSUBISHI ELECTRIC': { logo: '/logos/mitsubishi.png', color: '#E60012' },
  'IFM ELECTRONIC': { logo: '/logos/ifm.png', color: '#0050AA' },
  'PEPPERL+FUCHS': { logo: '/logos/pepperl.png', color: '#0066CC' },
  'PHILIPS LIGHTING': { logo: '/logos/philips.png', color: '#0B5394' },
  'LEDVANCE': { logo: '/logos/ledvance.png', color: '#003366' },
  'ZEMPER': { logo: '/logos/zemper.png', color: '#006633' },
  'WALLBOX': { logo: '/logos/wallbox.png', color: '#00BFFF' },
  'HAGER': { logo: '/logos/hager.png', color: '#0055A4' },
  'FRONIUS': { logo: '/logos/fronius.png', color: '#00A3E0' },
  'SMA SOLAR': { logo: '/logos/sma.png', color: '#009640' },
  'PYLONTECH': { logo: '/logos/pylontech.png', color: '#336699' },
  'LEGRAND': { logo: '/logos/legrand.png', color: '#E0001A' },
  'EATON': { logo: '/logos/eaton.svg', color: '#DA291C' },
  'FINDER': { logo: '/logos/finder.svg', color: '#005A9C' },
  'CIRCUTOR': { logo: '/logos/circutor.png', color: '#E30613' },
  'PHOENIX CONTACT': { logo: '/logos/phoenix.svg', color: '#007A58' },
}

const GRADIENT_PAIRS: [string, string][] = [
  ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'], ['#ffecd2', '#fcb69f'], ['#fbc2eb', '#a6c1ee'],
  ['#ff6b6b', '#feca57'], ['#84fab0', '#8fd3f4'], ['#cfd9df', '#e2ebf0'],
  ['#a1c4fd', '#c2e9fb'], ['#d4fc79', '#96e6a1'], ['#e0c3fc', '#8ec5fc'],
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function getInitials(name: string): string {
  if (!name) return '??'
  const words = name.trim().toUpperCase().split(/\s+/)
  return words.length >= 2 ? words[0][0] + words[1][0] : words[0].substring(0, 2).padEnd(2, '?')
}

function getGradient(name: string): string {
  if (!name) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  const [a, b] = GRADIENT_PAIRS[hash(name) % GRADIENT_PAIRS.length]
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}

export function getBrandLogoData(name: string): BrandLogoData {
  const meta = name ? BRAND_METADATA[name.trim().toUpperCase()] : undefined
  return {
    logo: meta?.logo || null,
    initials: getInitials(name),
    gradient: getGradient(name),
  }
}

export function getBrandColor(name: string): string {
  if (!name) return '#667eea'
  return BRAND_METADATA[name.trim().toUpperCase()]?.color || GRADIENT_PAIRS[hash(name) % GRADIENT_PAIRS.length][0]
}
