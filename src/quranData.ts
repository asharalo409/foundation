export type SurahMeta = { n: number; ar: string; en: string; type: string; count: number }
export type Ayah = {
  n: number
  s: number
  i: number
  t: string
  b: string
  e: string
  p: number
  j: number
}
export type Pack = {
  v: number
  savedAt: number
  bytes: number
  bnLabel: string
  surahs: SurahMeta[]
  ayahs: Ayah[]
}

const DB_NAME = 'foundation-kv'
const KEY = 'quran-v1'
const API = 'https://api.alquran.cloud/v1/quran/'
const AUDIO = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/'

const BN_LABEL: Record<string, string> = {
  'bn.bengali': 'মাওলানা মুহিউদ্দিন খান',
  'bn.hoque': 'জহুরুল হক',
}

export const ayahAudio = (n: number) => AUDIO + n + '.mp3'

export const stripDia = (s: string) => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1)
    r.onupgradeneeded = () => { r.result.createObjectStore('kv') }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

async function kvGet(k: string): Promise<any> {
  const d = await open()
  return new Promise((res, rej) => {
    const q = d.transaction('kv', 'readonly').objectStore('kv').get(k)
    q.onsuccess = () => res(q.result)
    q.onerror = () => rej(q.error)
  })
}

async function kvSet(k: string, v: any): Promise<void> {
  const d = await open()
  return new Promise((res, rej) => {
    const tx = d.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(v, k)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

async function kvDel(k: string): Promise<void> {
  const d = await open()
  return new Promise((res, rej) => {
    const tx = d.transaction('kv', 'readwrite')
    tx.objectStore('kv').delete(k)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export async function loadQuran(): Promise<Pack | undefined> {
  try {
    const p = await kvGet(KEY)
    return p && p.ayahs && p.ayahs.length ? (p as Pack) : undefined
  } catch {
    return undefined
  }
}

export async function deleteQuran() {
  await kvDel(KEY)
}

async function edition(id: string) {
  const r = await fetch(API + id)
  if (!r.ok) throw new Error(id + ' (' + r.status + ')')
  const j = await r.json()
  if (!j || !j.data || !j.data.surahs) throw new Error(id + ': ডেটা ঠিক নেই')
  return j.data
}

function cleanName(name: string) {
  const w = (name || '').split(' ')
  if (w.length > 1 && stripDia(w[0]) === 'سورة') w.shift()
  return w.join(' ')
}

export async function downloadQuran(onStep: (n: number, label: string) => void): Promise<Pack> {
  onStep(1, 'আরবি পাঠ নামছে...')
  const ar = await edition('quran-uthmani')

  onStep(2, 'বাংলা অনুবাদ নামছে...')
  let bn: any = null
  let bnId = ''
  for (const id of ['bn.bengali', 'bn.hoque']) {
    try {
      bn = await edition(id)
      bnId = id
      break
    } catch {}
  }
  if (!bn) throw new Error('বাংলা অনুবাদ পাওয়া যায়নি')

  onStep(3, 'ইংরেজি অনুবাদ নামছে...')
  let en: any = null
  try { en = await edition('en.sahih') } catch {}

  const tr = (ed: any) => {
    const m: Record<number, string> = {}
    if (ed) ed.surahs.forEach((s: any) => s.ayahs.forEach((a: any) => { m[a.number] = a.text }))
    return m
  }
  const bm = tr(bn)
  const em = tr(en)

  const surahs: SurahMeta[] = []
  const ayahs: Ayah[] = []
  ar.surahs.forEach((s: any) => {
    surahs.push({
      n: s.number,
      ar: cleanName(s.name),
      en: s.englishName,
      type: s.revelationType,
      count: s.ayahs.length,
    })
    s.ayahs.forEach((a: any) => {
      let t: string = a.text
      if (a.numberInSurah === 1 && s.number !== 1 && s.number !== 9) {
        const w = t.split(' ')
        if (stripDia(w[0]) === 'بسم') t = w.slice(4).join(' ')
      }
      ayahs.push({
        n: a.number,
        s: s.number,
        i: a.numberInSurah,
        t,
        b: bm[a.number] || '',
        e: em[a.number] || '',
        p: a.page,
        j: a.juz,
      })
    })
  })

  if (ayahs.length < 6000) throw new Error('ডেটা অসম্পূর্ণ এসেছে')

  const bytes = new Blob([JSON.stringify({ surahs, ayahs })]).size
  const pack: Pack = {
    v: 1,
    savedAt: Date.now(),
    bytes,
    bnLabel: BN_LABEL[bnId] || 'বাংলা অনুবাদ',
    surahs,
    ayahs,
  }
  await kvSet(KEY, pack)
  try { await (navigator as any).storage?.persist?.() } catch {}
  return pack
}
