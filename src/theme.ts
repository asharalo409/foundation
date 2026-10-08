export type Eff = { bg: string; font: string; palette: string; glass: string }

export const BGS: [string, string, string, string][] = [
  ['particles', '✨', 'কণা-জাল', 'নড়াচড়া করা বিন্দু ও রেখা, ছুঁলে জুড়ে যায়'],
  ['aurora', '🌌', 'অরোরা', 'ধীরে বদলানো রঙিন আলো'],
  ['stars', '🌙', 'তারা-রাত', 'মিটমিটে তারা, চাঁদ ও উল্কা'],
  ['petals', '🌸', 'ফুলের পাপড়ি', 'ঝরে পড়া পাপড়ি'],
  ['bubbles', '🔵', 'বুদবুদ', 'ভেসে ওঠা স্বচ্ছ বুদবুদ'],
  ['waves', '🌊', 'ঢেউ', 'নিচে বয়ে চলা ঢেউ'],
  ['geo', '🕌', 'ইসলামি নকশা', 'ধীরে সরে যাওয়া জ্যামিতিক নকশা'],
  ['none', '⬜', 'সরল', 'কোনো অ্যানিমেশন নয় (ব্যাটারি সাশ্রয়)'],
]

export const FONTS: Record<string, { label: string; head: string; body: string; css: string }> = {
  classic: {
    label: 'ক্লাসিক (নোটো সান্স)',
    head: "'Noto Sans Bengali'", body: "'Noto Sans Bengali'",
    css: 'family=Noto+Sans+Bengali:wght@400;600;700',
  },
  modern: {
    label: 'আধুনিক (আনেক বাংলা)',
    head: "'Anek Bangla'", body: "'Anek Bangla'",
    css: 'family=Anek+Bangla:wght@400;600;700',
  },
  elegant: {
    label: 'মার্জিত (তিরো বাংলা + হিন্দ সিলিগুড়ি)',
    head: "'Tiro Bangla'", body: "'Hind Siliguri'",
    css: 'family=Tiro+Bangla&family=Hind+Siliguri:wght@400;600;700',
  },
  friendly: {
    label: 'বন্ধুসুলভ (বালু দা)',
    head: "'Baloo Da 2'", body: "'Hind Siliguri'",
    css: 'family=Baloo+Da+2:wght@500;700;800&family=Hind+Siliguri:wght@400;600;700',
  },
  literary: {
    label: 'সাহিত্যিক (নোটো সেরিফ)',
    head: "'Noto Serif Bengali'", body: "'Noto Sans Bengali'",
    css: 'family=Noto+Serif+Bengali:wght@600;700;800&family=Noto+Sans+Bengali:wght@400;600;700',
  },
  artistic: {
    label: 'শৈল্পিক (গালাদা)',
    head: "'Galada'", body: "'Hind Siliguri'",
    css: 'family=Galada&family=Hind+Siliguri:wght@400;600;700',
  },
  round: {
    label: 'নরম গোল (আত্মা)',
    head: "'Atma'", body: "'Hind Siliguri'",
    css: 'family=Atma:wght@500;700&family=Hind+Siliguri:wght@400;600;700',
  },
}

const KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const R = (a: string[]) => Object.fromEntries(KEYS.map((k, i) => [k, a[i]])) as Record<string, string>

export const PALETTES: Record<string, { label: string; main: string | null; ramp?: Record<string, string> }> = {
  green: { label: 'সবুজ', main: null },
  blue: {
    label: 'নীল', main: '#1d4ed8',
    ramp: R(['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']),
  },
  violet: {
    label: 'বেগুনি', main: '#6d28d9',
    ramp: R(['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']),
  },
  rose: {
    label: 'গোলাপি', main: '#be123c',
    ramp: R(['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337']),
  },
  orange: {
    label: 'কমলা', main: '#c2410c',
    ramp: R(['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']),
  },
  teal: {
    label: 'টিল', main: '#0f766e',
    ramp: R(['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']),
  },
  maroon: {
    label: 'মেরুন', main: '#861f3d',
    ramp: R(['#fdf2f4', '#fbe5e9', '#f6c9d2', '#ec9aab', '#dd6a85', '#c93f63', '#a82a4c', '#861f3d', '#6b1a33', '#4a1224']),
  },
}

export function resolveTheme(ui: any, s: any): Eff {
  return {
    bg: ui?.bg || s?.ui_bg || 'particles',
    font: ui?.font || s?.ui_font || 'classic',
    palette: ui?.palette || s?.ui_palette || 'green',
    glass: ui?.glass || s?.ui_glass || 'flat',
  }
}

export const accentOf = (e: Eff, base: string) => PALETTES[e.palette]?.main || base

export function loadFont(key: string) {
  const f = FONTS[key]
  if (!f || document.getElementById('gf-' + key)) return
  const l = document.createElement('link')
  l.id = 'gf-' + key
  l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?' + f.css + '&display=swap'
  document.head.appendChild(l)
}

export function applyTheme(e: Eff) {
  const f = FONTS[e.font] || FONTS.classic
  loadFont(e.font)

  let st = document.getElementById('ui-style') as HTMLStyleElement | null
  if (!st) {
    st = document.createElement('style')
    st.id = 'ui-style'
    document.head.appendChild(st)
  }
  st.textContent =
    `body{font-family:${f.body},'Noto Sans Bengali',system-ui,sans-serif !important}` +
    `h1,h2,h3,h4,.fx-head{font-family:${f.head},${f.body},'Noto Sans Bengali',system-ui,sans-serif !important}` +
    `html.glass .bg-white{background-color:rgba(255,255,255,.68) !important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}` +
    `html.dark.glass .bg-white{background-color:rgba(22,32,51,.66) !important}`

  document.documentElement.classList.toggle('glass', e.glass === 'glass')

  const p = PALETTES[e.palette]
  const root = document.documentElement.style
  KEYS.forEach(k => {
    if (p && p.ramp) root.setProperty('--color-green-' + k, p.ramp[k])
    else root.removeProperty('--color-green-' + k)
  })
}
