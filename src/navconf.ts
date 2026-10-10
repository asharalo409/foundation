import type { Tab } from './menu'

export const NAV_ALLOWED: Tab[] = [
  'home', 'overview', 'finance', 'chat', 'projects', 'ledger', 'groups',
  'volunteers', 'me', 'map', 'works', 'blood', 'islamic', 'notices', 'gallery',
]

export const NAV_DEFAULT: Tab[] = ['home', 'overview', 'finance', 'chat']
export const NAV_MAX = 4

export const NAV_SHORT: Record<string, string> = {
  home: 'হোম',
  overview: 'ওভারভিউ',
  finance: 'আয়-ব্যয়',
  chat: 'চ্যাট',
  projects: 'প্রকল্প',
  ledger: 'খতিয়ান',
  groups: 'গ্রুপ',
  volunteers: 'দায়িত্ব',
  me: 'আমি',
  map: 'ম্যাপ',
  works: 'কাজ',
  blood: 'রক্ত',
  islamic: 'ইসলামিক',
  notices: 'নোটিশ',
  gallery: 'গ্যালারি',
}

export function navKeys(settings: any): Tab[] {
  const raw = settings?.nav_items
  const arr: Tab[] = Array.isArray(raw)
    ? raw.filter((k: any) => NAV_ALLOWED.includes(k))
    : []
  return (arr.length ? arr : NAV_DEFAULT).slice(0, NAV_MAX)
}
