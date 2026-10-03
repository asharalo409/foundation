import { getLang } from './i18n'
import DICT from './dicts'

const ANY = /[\u0980-\u09FF]/
const LET = /[\u0980-\u09E5\u09F0\u09F1\u09F4-\u09FF]/
const DIG = '০১২৩৪৫৬৭৮৯'
const KEYS = Object.keys(DICT).sort((a, b) => b.length - a.length)
const cache = new Map<string, string>()

function repl(s: string, key: string, val: string) {
  let i = s.indexOf(key)
  if (i < 0) return s
  const kl = LET.test(key[0])
  const kr = LET.test(key[key.length - 1])
  let out = ''
  let last = 0
  while (i >= 0) {
    const before = i > 0 ? s[i - 1] : ''
    const after = s[i + key.length] || ''
    if ((kl && before && LET.test(before)) || (kr && after && LET.test(after))) {
      i = s.indexOf(key, i + 1)
      continue
    }
    out += s.slice(last, i) + val
    last = i + key.length
    i = s.indexOf(key, last)
  }
  return out + s.slice(last)
}

export function tr(s: string): string {
  if (!s || !ANY.test(s)) return s
  const hit = cache.get(s)
  if (hit !== undefined) return hit
  let out = s
  for (const k of KEYS) {
    if (out.includes(k)) out = repl(out, k, DICT[k])
    if (!LET.test(out)) break
  }
  out = out.replace(/[০-৯]/g, c => String(DIG.indexOf(c)))
  if (cache.size > 3000) cache.clear()
  cache.set(s, out)
  return out
}

const ATTRS = ['placeholder', 'title', 'alt', 'aria-label']

function fixAttr(el: Element, name: string) {
  const v = el.getAttribute(name)
  if (!v) return
  const o = tr(v)
  if (o !== v) el.setAttribute(name, o)
}

function walk(n: Node) {
  if (n.nodeType === 3) {
    const v = n.nodeValue || ''
    const o = tr(v)
    if (o !== v) n.nodeValue = o
  } else if (n.nodeType === 1) {
    const el = n as Element
    ATTRS.forEach(a => fixAttr(el, a))
    const t = el.tagName
    if (t === 'SCRIPT' || t === 'STYLE' || t === 'TEXTAREA') return
    el.childNodes.forEach(walk)
  }
}

export function startTranslator() {
  if (typeof document === 'undefined') return

  ;['alert', 'confirm', 'prompt'].forEach(name => {
    const w = window as any
    const orig = w[name].bind(window)
    w[name] = (m?: any, ...rest: any[]) =>
      orig(getLang() === 'en' && typeof m === 'string' ? tr(m) : m, ...rest)
  })

  const OPTS: MutationObserverInit = {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  }

  const obs = new MutationObserver(recs => {
    if (getLang() !== 'en') return
    obs.disconnect()
    try {
      for (const r of recs) {
        if (r.type === 'characterData') walk(r.target)
        else if (r.type === 'attributes')
          fixAttr(r.target as Element, r.attributeName || '')
        else r.addedNodes.forEach(walk)
      }
    } finally {
      obs.observe(document.body, OPTS)
    }
  })
  obs.observe(document.body, OPTS)

  setTimeout(() => {
    if (getLang() === 'en') walk(document.body)
  }, 400)
}
