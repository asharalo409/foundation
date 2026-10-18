import { useEffect, useRef, useState } from 'react'

// বাংলাদেশের উপজেলা সীমানা (ওপেন ডেটা, MIT): ifahimreza/bangladesh-geojson
const GEO = 'https://cdn.jsdelivr.net/gh/ifahimreza/bangladesh-geojson@4723ee5f9fecaa79af6266a746cf89c39841a02d/src/data/bangladesh.geojson'
const LCSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LJS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const SAT = '64' // সাতক্ষীরা জেলার আইডি
const PAL = ['#d9f99d', '#fde68a', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa']
const STRONG = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#14b8a6']
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')

// ডেটাসেটের বানান যেখানে প্রচলিত বানানের সঙ্গে মেলে না
const FIX: Record<string, string> = { 'আসসাশুনি': 'আশাশুনি' }
const nm = (x: any) => { const t = String(x || '').trim(); return FIX[t] || t }

let leafletP: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletP) return leafletP
  leafletP = new Promise((res, rej) => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'; l.href = LCSS
    document.head.appendChild(l)
    const s = document.createElement('script')
    s.src = LJS
    s.onload = () => res((window as any).L)
    s.onerror = () => { leafletP = null; rej(new Error('leaflet')) }
    document.head.appendChild(s)
  })
  return leafletP
}

function bbox(g: any) {
  let a = 999, b = 999, c = -999, d = -999
  const walk = (x: any) => {
    if (typeof x[0] === 'number') {
      if (x[0] < a) a = x[0]
      if (x[0] > c) c = x[0]
      if (x[1] < b) b = x[1]
      if (x[1] > d) d = x[1]
    } else x.forEach(walk)
  }
  walk(g.coordinates)
  return [a, b, c, d] // minLng, minLat, maxLng, maxLat
}

let cssDone = false
function ensureCss() {
  if (cssDone) return
  cssDone = true
  const s = document.createElement('style')
  s.textContent =
    '.bd-lbl{display:block;transform:translate(-50%,-50%);white-space:nowrap;pointer-events:none;font:600 11px/1 "Noto Sans Bengali",sans-serif;color:#064e3b;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff}' +
    '.bd-lbl.big{font-size:13px;font-weight:700;color:#0f172a}'
  document.head.appendChild(s)
}

type Meta = { id: string; dist: string; bnName: string; distBn: string; box: number[]; sat: boolean }

export default function BdMap({ rows, curId, onSelect }: { rows: any[]; curId?: string; onSelect: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const S = useRef<any>({ mode: 'all' })
  const [state, setState] = useState<'load' | 'ok' | 'nogeo' | 'fail'>('load')
  const [mode, setMode] = useState<'all' | 'sat'>('all')
  const [info, setInfo] = useState<{ up: string; dist: string } | null>(null)
  const [q, setQ] = useState('')
  const [sMsg, setSMsg] = useState('')
  const [ups, setUps] = useState<{ id: string; name: string }[]>([])

  // জেলা অনুযায়ী পরিবার সংখ্যা
  const fam = new Map<string, number>()
  rows.forEach(r => {
    const k = String(r.district || '').trim()
    if (k) fam.set(k, (fam.get(k) || 0) + Number(r.families_helped || 0))
  })

  function styleOf(p: any) {
    const sat = p.district_id === SAT
    if (S.current.mode === 'sat') {
      if (!sat) return { weight: 0.4, color: '#cbd5e1', fillColor: '#f1f5f9', fillOpacity: 0.55 }
      const i = S.current.satIds.indexOf(p.upazila_id)
      return { weight: 1.6, color: '#0f172a', fillColor: STRONG[i % STRONG.length], fillOpacity: 0.5 }
    }
    const f = S.current.fam.get(String(p.district_bn_name || '').trim()) || 0
    return f > 0
      ? { weight: 0.5, color: '#475569', fillColor: '#16a34a', fillOpacity: 0.5 }
      : { weight: 0.5, color: '#64748b', fillColor: PAL[Number(p.district_id) % PAL.length], fillOpacity: 0.5 }
  }

  function labels() {
    const { L, map, lbl, metas } = S.current
    if (!map || !metas) return
    lbl.clearLayers()
    const z = map.getZoom()
    const b = map.getBounds()
    const add = (lng: number, lat: number, text: string, big?: boolean) =>
      L.marker([lat, lng], {
        interactive: false,
        icon: L.divIcon({ className: '', iconSize: [0, 0], html: '<span class="bd-lbl' + (big ? ' big' : '') + '">' + text + '</span>' }),
      }).addTo(lbl)
    if (S.current.mode === 'sat') {
      metas.filter((m: Meta) => m.sat).forEach((m: Meta) =>
        add((m.box[0] + m.box[2]) / 2, (m.box[1] + m.box[3]) / 2, m.bnName, true))
      return
    }
    if (z <= 8) {
      const seen = new Map<string, number[]>()
      metas.forEach((m: Meta) => {
        const x = seen.get(m.dist)
        seen.set(m.dist, x
          ? [Math.min(x[0], m.box[0]), Math.min(x[1], m.box[1]), Math.max(x[2], m.box[2]), Math.max(x[3], m.box[3]), x[4]]
          : [...m.box, 0])
      })
      metas.forEach((m: Meta) => {
        const x = seen.get(m.dist)
        if (!x || x[4]) return
        x[4] = 1
        add((x[0] + x[2]) / 2, (x[1] + x[3]) / 2, m.distBn, false)
      })
    } else {
      metas.forEach((m: Meta) => {
        const cx = (m.box[0] + m.box[2]) / 2, cy = (m.box[1] + m.box[3]) / 2
        if (b.contains([cy, cx])) add(cx, cy, m.bnName, z >= 11)
      })
    }
  }

  function pins() {
    const { L, map, pinLayer } = S.current
    if (!map) return
    pinLayer.clearLayers()
    S.current.rows.filter((r: any) => r.lat != null && r.lng != null).forEach((r: any) => {
      const on = S.current.curId === r.id
      const m = L.circleMarker([r.lat, r.lng], {
        radius: on ? 11 : 8, color: '#fff', weight: 2.5, fillColor: on ? '#dc2626' : '#16a34a', fillOpacity: 1,
      }).addTo(pinLayer)
      m.on('click', () => S.current.onSelect(r.id))
      m.bindTooltip(String(r.district || r.title || ''), { direction: 'top', offset: [0, -8] })
    })
  }

  useEffect(() => {
    let dead = false
    ensureCss()
    loadLeaflet().then(async L => {
      if (dead || !box.current) return
      const map = L.map(box.current, {
        minZoom: 6, maxZoom: 18, preferCanvas: true, zoomSnap: 0.5,
        maxBounds: [[19.3, 86.5], [27.6, 93.6]],
      }).setView([23.7, 90.35], 7)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(map)
      const lbl = L.layerGroup().addTo(map)
      const pinLayer = L.layerGroup().addTo(map)
      Object.assign(S.current, { L, map, lbl, pinLayer, fam, rows, curId, onSelect, satIds: [], metas: null, geoLayer: null })
      map.on('zoomend moveend', labels)
      setTimeout(() => map.invalidateSize(), 200)
      pins()
      setState('ok')
      try {
        const res = await fetch(GEO)
        if (!res.ok) throw new Error('geo')
        const geo = await res.json()
        if (dead) return
        const metas: Meta[] = geo.features.map((f: any) => ({
          id: f.properties.upazila_id,
          dist: f.properties.district_id,
          bnName: nm(f.properties.bn_name),
          distBn: String(f.properties.district_bn_name || '').trim(),
          box: bbox(f.geometry),
          sat: f.properties.district_id === SAT,
        }))
        S.current.metas = metas
        S.current.satIds = metas.filter(m => m.sat).map(m => m.id)
        setUps(metas.filter(m => m.sat).map(m => ({ id: m.id, name: m.bnName })))
        const layer = L.geoJSON(geo, {
          style: (f: any) => styleOf(f.properties),
          onEachFeature: (f: any, ly: any) => {
            ly.on('click', () => {
              const p = f.properties
              setInfo({ up: nm(p.bn_name), dist: String(p.district_bn_name || '').trim() })
            })
          },
        }).addTo(map)
        layer.bringToBack()
        S.current.geoLayer = layer
        labels()
      } catch {
        if (!dead) setState('nogeo')
      }
    }).catch(() => { if (!dead) setState('fail') })
    return () => {
      dead = true
      try { S.current.map?.remove() } catch {}
      S.current = { mode: 'all' }
    }
  }, [])

  // তথ্য বদলালে পিন ও রঙ হালনাগাদ
  useEffect(() => {
    Object.assign(S.current, { fam, rows, curId, onSelect })
    if (!S.current.map) return
    pins()
    S.current.geoLayer?.setStyle((f: any) => styleOf(f.properties))
  }, [rows, curId])

  function go(m: 'all' | 'sat') {
    setMode(m)
    S.current.mode = m
    setInfo(null)
    const { map, metas } = S.current
    if (!map) return
    S.current.geoLayer?.setStyle((f: any) => styleOf(f.properties))
    if (m === 'sat' && metas) {
      const bs = metas.filter((x: Meta) => x.sat).map((x: Meta) => x.box)
      map.fitBounds([[Math.min(...bs.map((b: number[]) => b[1])), Math.min(...bs.map((b: number[]) => b[0]))],
        [Math.max(...bs.map((b: number[]) => b[3])), Math.max(...bs.map((b: number[]) => b[2]))]], { padding: [10, 10] })
    } else if (m === 'all') map.setView([23.7, 90.35], 7)
    setTimeout(labels, 350)
  }

  function zoomUp(id: string) {
    const m = S.current.metas?.find((x: Meta) => x.id === id)
    if (!m) return
    S.current.map.fitBounds([[m.box[1], m.box[0]], [m.box[3], m.box[2]]], { padding: [14, 14] })
  }

  async function find() {
    const t = q.trim()
    if (!t) return
    setSMsg('খোঁজা হচ্ছে...')
    try {
      const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&accept-language=bn&q=' + encodeURIComponent(t))
      const j = await r.json()
      if (!j.length) { setSMsg('জায়গাটি পাওয়া যায়নি। ইংরেজিতে বা উপজেলাসহ লিখে দেখুন'); return }
      const { L, map } = S.current
      const lat = Number(j[0].lat), lng = Number(j[0].lon)
      map.flyTo([lat, lng], 15, { duration: 1.2 })
      L.popup().setLatLng([lat, lng]).setContent('<b>' + String(j[0].display_name || t).split(',').slice(0, 3).join(', ') + '</b>').openOn(map)
      setSMsg('')
    } catch {
      setSMsg('অনুসন্ধান করা যায়নি, ইন্টারনেট দেখুন')
    }
  }

  if (state === 'fail') {
    return <p className="text-sm text-center text-gray-500 py-6">মানচিত্র লোড করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => go('all')}
          className={'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ' + (mode === 'all' ? 'bg-green-700 text-white border-green-700' : 'bg-white')}>
          সারা বাংলাদেশ
        </button>
        <button onClick={() => go('sat')}
          className={'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ' + (mode === 'sat' ? 'bg-green-700 text-white border-green-700' : 'bg-white')}>
          সাতক্ষীরা জেলা, উপজেলাভিত্তিক
        </button>
      </div>

      {mode === 'sat' && ups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ups.map((u, i) => (
            <button key={u.id} onClick={() => zoomUp(u.id)}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs bg-white">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: STRONG[i % STRONG.length] }} />
              {u.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') find() }}
          placeholder="গ্রাম, ইউনিয়ন বা বাজারের নাম (যেমন: শোভনালী)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-600" />
        <button onClick={find} className="px-4 rounded-lg bg-green-700 text-white text-sm font-semibold">খুঁজুন</button>
      </div>
      {sMsg && <p className="text-xs text-gray-500">{sMsg}</p>}

      <div className="relative rounded-xl overflow-hidden border">
        <div ref={box} style={{ height: 440, background: '#e5f3ea' }} />
        {state === 'load' && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-white/70">মানচিত্র লোড হচ্ছে...</div>
        )}
        <div className="absolute left-2 bottom-6 bg-white/90 rounded-lg px-2 py-1 text-[10px] leading-tight space-y-0.5 shadow" style={{ zIndex: 500 }}>
          <p className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 border border-white" /> ত্রাণ পৌঁছানো স্থান</p>
          <p className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" /> নির্বাচিত</p>
          <p className="text-gray-500">সবুজ জেলায় আমাদের কাজ হয়েছে</p>
        </div>
      </div>

      {info && (
        <p className="text-sm bg-green-50 rounded-lg px-3 py-2">
          <b>{info.up}</b> উপজেলা, {info.dist} জেলা
          {fam.get(info.dist) ? ' · এই জেলায় ' + bn(fam.get(info.dist) || 0) + ' পরিবার সহায়তা পেয়েছে' : ''}
        </p>
      )}
      {state === 'nogeo' && (
        <p className="text-[11px] text-amber-700">জেলা-উপজেলার সীমানা লোড হয়নি, শুধু সাধারণ মানচিত্র দেখানো হচ্ছে।</p>
      )}
      <p className="text-[10px] text-gray-400 text-center">
        আঙুলে চিমটি দিয়ে বা + চিহ্নে জুম করলে উপজেলা থেকে গ্রাম পর্যন্ত দেখা যাবে। মানচিত্র: OpenStreetMap।
      </p>
    </div>
  )
}
