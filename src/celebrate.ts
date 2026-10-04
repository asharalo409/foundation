import { getLang } from './i18n'

type T = { icon: string; big: boolean; bn: [string, string]; en: [string, string] }

const K: Record<string, T> = {
  donation: {
    icon: '💚', big: true,
    bn: ['অসংখ্য ধন্যবাদ!', 'আপনার মহৎ দান জমা হয়েছে। যাচাই শেষে নির্বাচিত খাতে যোগ হবে।'],
    en: ['Thank you so much!', 'Your generous donation was submitted. It will be added to the selected fund after verification.'],
  },
  apply: {
    icon: '🎉', big: true,
    bn: ['অভিনন্দন!', 'আপনার সদস্য আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করলে আপনি সদস্য হবেন।'],
    en: ['Congratulations!', 'Your membership application was submitted. You will become a member once the admin approves.'],
  },
  member: {
    icon: '🎊', big: true,
    bn: ['অভিনন্দন!', 'নতুন সদস্য যুক্ত হয়েছে। সংগঠন আরও শক্তিশালী হলো।'],
    en: ['Congratulations!', 'A new member has joined. The organization just got stronger.'],
  },
  welcome: {
    icon: '🌸', big: true,
    bn: ['স্বাগতম!', 'আমাদের সদস্য পরিবারে আপনাকে স্বাগতম। মানবতার পাশে থাকার জন্য ধন্যবাদ।'],
    en: ['Welcome!', 'Welcome to our member family. Thank you for standing beside humanity.'],
  },
  report: {
    icon: '🌟', big: true,
    bn: ['ধন্যবাদ!', 'আপনার কাজের রিপোর্ট জমা হয়েছে।'],
    en: ['Thank you!', 'Your work report was submitted.'],
  },
  donor: {
    icon: '🩸', big: true,
    bn: ['ধন্যবাদ, জীবনরক্ষাকারী!', 'রক্তদাতা তালিকায় আপনার তথ্য সংরক্ষিত হয়েছে।'],
    en: ['Thank you, lifesaver!', 'Your details are saved in the blood donor list.'],
  },
  accept: { icon: '✅', big: false, bn: ['দান গ্রহণ সম্পন্ন', ''], en: ['Donation accepted', ''] },
  created: { icon: '🌸', big: false, bn: ['সফলভাবে যুক্ত হয়েছে', ''], en: ['Added successfully', ''] },
  saved: { icon: '✅', big: false, bn: ['সংরক্ষিত হয়েছে', ''], en: ['Saved', ''] },
}

const POST_MAP: Record<string, string> = {
  donation_requests: 'donation',
  applications: 'apply',
  members: 'member',
  field_reports: 'report',
  blood_donors: 'donor',
  projects: 'created',
  project_updates: 'created',
  notices: 'created',
  relief_locations: 'created',
  events: 'created',
  duties: 'created',
  funds: 'created',
  donations: 'created',
  expenses: 'created',
  blood_requests: 'created',
}

const PATCH_OK = new Set([
  'settings', 'members', 'projects', 'relief_locations', 'field_reports', 'events',
  'duties', 'funds', 'notices', 'donations', 'expenses', 'blood_requests',
])

const FLOWERS = ['🌸', '🌺', '🌼', '💐', '🌷', '🎉', '✨', '💚']

let last = 0
let styled = false

function ensureStyle() {
  if (styled) return
  styled = true
  const s = document.createElement('style')
  s.textContent =
    '@keyframes cf-fall{0%{transform:translate3d(0,-10vh,0) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translate3d(var(--dx),112vh,0) rotate(var(--rot));opacity:.9}}' +
    '@keyframes cf-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}' +
    '.cf-bit{position:fixed;top:0;pointer-events:none;z-index:9998;animation:cf-fall linear forwards;will-change:transform}' +
    '.cf-card{animation:cf-pop .35s ease-out}'
  document.head.appendChild(s)
}

function burst(n: number) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span')
    el.className = 'cf-bit'
    el.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
    const size = 18 + Math.random() * 22
    const dur = 2.8 + Math.random() * 2.4
    el.style.cssText =
      `left:${Math.random() * 100}vw;font-size:${size}px;animation-duration:${dur}s;` +
      `animation-delay:${Math.random() * 0.9}s;--dx:${(Math.random() - 0.5) * 160}px;` +
      `--rot:${(Math.random() - 0.5) * 720}deg`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), (dur + 1.2) * 1000)
  }
}

function card(icon: string, title: string, text: string) {
  document.getElementById('cf-card')?.remove()

  const wrap = document.createElement('div')
  wrap.id = 'cf-card'
  wrap.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.35)'

  const box = document.createElement('div')
  box.className = 'cf-card'
  box.style.cssText =
    'background:#fff;color:#111;max-width:340px;width:100%;border-radius:20px;padding:22px 20px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.3)'

  const i = document.createElement('div')
  i.style.cssText = 'font-size:52px;line-height:1'
  i.textContent = icon

  const h = document.createElement('div')
  h.style.cssText = 'font-weight:700;font-size:20px;margin-top:8px'
  h.textContent = title

  const p = document.createElement('div')
  p.style.cssText = 'font-size:14px;color:#444;margin-top:6px;line-height:1.5'
  p.textContent = text

  const b = document.createElement('button')
  b.style.cssText =
    'margin-top:14px;background:#16a34a;color:#fff;border:0;border-radius:10px;padding:8px 24px;font-weight:600'
  b.textContent = 'OK'

  box.append(i, h, p, b)
  wrap.appendChild(box)
  const close = () => wrap.remove()
  wrap.addEventListener('click', close)
  document.body.appendChild(wrap)
  setTimeout(close, 5200)
}

function toast(text: string) {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9999;background:#166534;color:#fff;padding:9px 18px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:90vw;text-align:center'
  el.textContent = text
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2400)
}

function fire(kind: string) {
  const now = Date.now()
  if (now - last < 2500) return
  const k = K[kind]
  if (!k || !document.body) return
  last = now
  ensureStyle()
  const [title, text] = getLang() === 'en' ? k.en : k.bn
  if (k.big) {
    burst(46)
    card(k.icon, title, text)
  } else {
    burst(10)
    toast(k.icon + ' ' + title)
  }
}

const SB_HOST = (() => {
  try { return new URL(import.meta.env.VITE_SUPABASE_URL).host } catch { return '' }
})()

async function welcome(res: Response) {
  try {
    const j = await res.clone().json()
    const id = j?.user?.id
    if (!id) return
    const key = 'welcomed-' + id
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    fire('welcome')
  } catch {}
}

function handle(url: string, method: string, res: Response) {
  const u = new URL(url, location.href)
  if (u.host !== SB_HOST) return
  const p = u.pathname

  if (p.startsWith('/auth/v1/token') && u.searchParams.get('grant_type') === 'password' && method === 'POST') {
    welcome(res)
    return
  }

  const m = p.match(/^\/rest\/v1\/(rpc\/)?(\w+)/)
  if (!m) return
  if (m[1]) {
    if (m[2] === 'accept_donation_request') fire('accept')
    return
  }
  const table = m[2]
  if (method === 'POST' && POST_MAP[table]) fire(POST_MAP[table])
  else if (method === 'PATCH' && PATCH_OK.has(table)) fire('saved')
}

if (typeof window !== 'undefined' && SB_HOST && !(window as any).__celebrate) {
  ;(window as any).__celebrate = true
  const orig = window.fetch.bind(window)
  ;(window as any).fetch = async (input: any, init?: any) => {
    const res = await orig(input, init)
    try {
      if (res.ok) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        const method = String(
          (init && init.method) || (typeof input === 'object' && input && input.method) || 'GET'
        ).toUpperCase()
        if (method !== 'GET' && method !== 'HEAD') handle(url, method, res)
      }
    } catch {}
    return res
  }
}
