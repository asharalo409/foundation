import { useEffect, useState } from 'react'

export type Role = {
  key: string
  label: string
  rank: number
  perms: string[]
  show_on_home: boolean
  is_system: boolean
}

export const PERMS: [string, string][] = [
  ['manage_members', 'সদস্য ও আবেদন ব্যবস্থাপনা'],
  ['manage_roles', 'পদবী তৈরি ও পরিবর্তন'],
  ['manage_settings', 'সংগঠনের সেটিংস ও ফিচার'],
  ['edit_finance', 'আয়-ব্যয় ও অনুদান এন্ট্রি'],
  ['manage_blood', 'রক্তদান ব্যবস্থাপনা'],
  ['moderate_chat', 'চ্যাটের বার্তা মোছা'],
  ['post_notices', 'নোটিশ প্রকাশ'],
  ['verify_reports', 'কাজের রিপোর্ট যাচাই ও সম্পাদনা'],
]

const FALLBACK: Role[] = [
  { key: 'admin', label: 'অ্যাডমিন', rank: 1, perms: ['*'], show_on_home: true, is_system: true },
  { key: 'president', label: 'সভাপতি', rank: 2, perms: [], show_on_home: true, is_system: false },
  { key: 'general_secretary', label: 'সাধারণ সম্পাদক', rank: 3, perms: [], show_on_home: true, is_system: false },
  { key: 'cashier', label: 'কোষাধ্যক্ষ', rank: 4, perms: ['edit_finance'], show_on_home: true, is_system: false },
  { key: 'health', label: 'স্বাস্থ্য ও রক্তদান সমন্বয়ক', rank: 5, perms: ['manage_blood'], show_on_home: true, is_system: false },
  { key: 'sports', label: 'ক্রীড়া ও সাংস্কৃতিক সম্পাদক', rank: 6, perms: [], show_on_home: true, is_system: false },
  { key: 'publicity', label: 'প্রচার ও প্রকাশনা সম্পাদক', rank: 7, perms: [], show_on_home: true, is_system: false },
  { key: 'member', label: 'সদস্য', rank: 100, perms: [], show_on_home: false, is_system: true },
]

let store: Role[] = FALLBACK

export const getRoles = () => store
export const setRoles = (r: Role[]) => { store = r && r.length ? r : FALLBACK }
export const roleLabel = (key: string) => store.find(r => r.key === key)?.label || key

export function can(member: any, perm: string): boolean {
  if (!member || member.is_active === false) return false
  const r = store.find(x => x.key === member.role)
  return !!r && (r.perms.includes('*') || r.perms.includes(perm))
}

export function useRoles(supabase: any) {
  const [, bump] = useState(0)
  const reload = () =>
    supabase.from('roles').select('*').order('rank').then(({ data, error }: any) => {
      if (!error && data) setRoles(data)
      bump(n => n + 1)
    })
  useEffect(() => { reload() }, [])
  return { roles: store, reload }
}

// বর্তমান লগইন করা ইউজারের জন্য পারমিশন হেল্পার
let me: any = null
export const setMe = (m: any) => { me = m }
export const canMe = (perm: string) => can(me, perm)
