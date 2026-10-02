import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'
import { fmtDT } from './time'
import { DISTRICTS, DIVISIONS } from './districts'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const DISASTERS = ['বন্যা', 'ঘূর্ণিঝড়', 'শীত', 'অগ্নিকাণ্ড', 'ভূমিধস', 'নদীভাঙন', 'অন্যান্য']

const OUTLINE: [number, number][] = [
  [88.10, 26.30], [88.50, 26.60], [89.00, 26.38], [89.75, 26.22], [89.85, 25.30],
  [90.70, 25.15], [91.50, 25.18], [92.05, 25.10], [92.40, 24.85], [92.25, 24.40],
  [92.00, 24.15], [91.70, 23.75], [91.40, 23.35], [91.45, 23.05], [91.78, 23.30],
  [92.05, 23.65], [92.35, 23.35], [92.55, 22.80], [92.60, 22.00], [92.35, 21.45],
  [92.33, 20.65], [92.00, 21.00], [91.95, 21.45], [91.85, 22.00], [91.80, 22.30],
  [91.40, 22.80], [91.00, 22.40], [90.60, 22.15], [90.10, 21.85], [89.80, 21.80],
  [89.50, 21.85], [89.10, 21.80], [88.95, 22.15], [88.80, 22.45], [88.85, 23.15],
  [88.60, 23.60], [88.30, 24.00], [88.00, 24.55], [88.40, 24.95], [88.05, 25.30],
  [88.10, 25.80],
]
const W = 270
const H = 384
const px = (lng: number) => ((lng - 87.9) / 4.9) * W
const py = (lat: number) => ((26.8 - lat) / 6.4) * H
const PATH =
  OUTLINE.map(([x, y], i) => (i ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(y).toFixed(1)).join(' ') + 'Z'

export default function ReliefMap({ supabase, member }: any) {
  const editor = ['admin', 'president', 'general_secretary'].includes(member?.role)
  const [rows, setRows] = useState<any[]>([])
  const [div, setDiv] = useState('all')
  const [sel, setSel] = useState('')
  const [form, setForm] = useState<any>(null)

  async function load() {
    const { data } = await supabase.from('relief_locations').select('*')
      .order('created_at', { ascending: false })
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  const list = rows.filter(r => div === 'all' || r.division === div)
  const cur = list.find(r => r.id === sel) || list[0]
  const totFam = list.reduce((t, r) => t + Number(r.families_helped || 0), 0)
  const totAmt = list.reduce((t, r) => t + Number(r.amount_distributed || 0), 0)

  async function remove(id: string) {
    if (!confirm('রেকর্ডটি মুছে ফেলবেন?')) return
    await supabase.from('relief_locations').delete().eq('id', id)
    setSel('')
    load()
  }

  const edited = cur?.updated_at && cur?.created_at &&
    new Date(cur.updated_at).getTime() - new Date(cur.created_at).getTime() > 60000

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">📍 ফিল্ড অ্যাক্টিভিটি ও ত্রাণ ট্র্যাকিং</p>
        <h2 className="text-xl font-bold">সাহায্য প্রদান লোকেশন ট্র্যাকিং ও ইন্টারেক্টিভ ম্যাপ</h2>
        <p className="text-sm text-gray-500">
          বাংলাদেশের কোন কোন জেলায় ত্রাণ ও পুনর্বাসন পৌঁছেছে তার তথ্য, ছবি ও ভিডিও প্রমাণসহ দেখুন।
        </p>
      </div>

      {editor && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + নতুন লোকেশন রেকর্ড যুক্ত করুন
        </button>
      )}
      {form && (
        <ReliefForm supabase={supabase} row={form.id ? form : null}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...DIVISIONS].map(d => (
          <button key={d} onClick={() => { setDiv(d); setSel('') }}
            className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (div === d ? 'bg-green-700 text-white' : 'bg-white border')}>
            {d === 'all' ? 'সমগ্র বাংলাদেশ' : d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-2 shadow-sm">
          <p className="text-[11px] text-gray-500">লোকেশন</p>
          <p className="font-bold text-sm">{bn(list.length)}টি</p>
        </div>
        <div className="bg-white rounded-xl p-2 shadow-sm">
          <p className="text-[11px] text-gray-500">উপকৃত পরিবার</p>
          <p className="font-bold text-sm text-green-700">{bn(totFam)}</p>
        </div>
        <div className="bg-white rounded-xl p-2 shadow-sm">
          <p className="text-[11px] text-gray-500">মোট সহায়তা</p>
          <p className="font-bold text-sm text-blue-700">{taka(totAmt)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm">
        <p className="text-xs font-semibold mb-1">🟢 বাংলাদেশ ত্রাণ বিতরণ জোন ও লোকেশন পিন</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
          <path d={PATH} fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2" strokeDasharray="3 2" />
          {list.filter(r => r.lat != null && r.lng != null).map(r => {
            const x = px(r.lng)
            const y = py(r.lat)
            const on = cur?.id === r.id
            return (
              <g key={r.id} onClick={() => setSel(r.id)} style={{ cursor: 'pointer' }}>
                {on && <circle cx={x} cy={y} r="16" fill="#16a34a" opacity="0.25" />}
                <circle cx={x} cy={y} r={on ? 10 : 8} fill="#16a34a" stroke="#fff" strokeWidth="2" />
                <circle cx={x} cy={y} r="3" fill="#fff" />
                {on && (
                  <text x={x} y={y - 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">
                    {r.district}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        <p className="text-[10px] text-gray-400 text-center">আনুমানিক রেখাচিত্র · পিনে ট্যাপ করে বিস্তারিত দেখুন</p>
        <div className="flex gap-2 overflow-x-auto pt-2">
          {list.map(r => (
            <button key={r.id} onClick={() => setSel(r.id)}
              className={'border rounded-lg px-3 py-1.5 text-xs whitespace-nowrap ' +
                (cur?.id === r.id ? 'border-green-600 text-green-700 font-semibold' : 'text-gray-600')}>
              📍 {r.district || r.title} ({bn(r.families_helped)} পরিবার)
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">এখনও কোনো লোকেশন রেকর্ড নেই</p>
      )}

      {cur && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-green-700 to-slate-800">
            {cur.photo_url && (
              <img src={cur.photo_url} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute top-2 left-2 bg-green-700 text-white text-xs rounded-full px-3 py-1">
              {cur.division || 'বাংলাদেশ'}
            </span>
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <p className="text-xs">📍 {cur.district} জেলা{cur.disaster_type ? ' · ' + cur.disaster_type : ''}</p>
              <h3 className="font-bold text-lg leading-tight">{cur.title}</h3>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-[11px] text-gray-500">সাহায্যপ্রাপ্ত পরিবার</p>
                <p className="font-bold text-green-700">{bn(cur.families_helped)} টি পরিবার</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-[11px] text-gray-500">মোট সহায়তার পরিমাণ</p>
                <p className="font-bold text-blue-700">{taka(cur.amount_distributed)}</p>
              </div>
            </div>

            {cur.summary && (
              <div>
                <p className="text-sm font-semibold">ত্রাণ কার্যক্রমের সারসংক্ষেপ:</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{cur.summary}</p>
              </div>
            )}
            {cur.materials && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-semibold">বিতরণকৃত সামগ্রী:</p>
                <p className="text-sm text-gray-600">{cur.materials}</p>
              </div>
            )}

            <div className="text-[11px] text-gray-400 space-y-0.5">
              {cur.coordinator && <p>👤 সমন্বয়ক: <b className="text-gray-600">{cur.coordinator}</b></p>}
              {cur.distributed_on && <p>🗓️ বিতরণের তারিখ: {bnd(cur.distributed_on)}</p>}
              <p>📅 রেকর্ড প্রকাশ: {fmtDT(cur.created_at)}</p>
              {edited && <p>✏️ সম্পাদিত: {fmtDT(cur.updated_at)}</p>}
            </div>

            {cur.video_url && (
              <a href={cur.video_url} target="_blank" rel="noreferrer"
                className="block text-center bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold">
                ▶ মাঠপর্যায়ের ভিডিও প্রতিবেদন দেখুন
              </a>
            )}
            {cur.proof_url && (
              <a href={cur.proof_url} target="_blank" rel="noreferrer"
                className="block text-center border border-green-700 text-green-700 rounded-lg py-2.5 text-sm font-semibold">
                🧾 প্রমাণ/ডকুমেন্ট দেখুন
              </a>
            )}

            {editor && (
              <div className="flex gap-4 text-xs pt-1">
                <button className="underline" onClick={() => setForm(cur)}>সম্পাদনা</button>
                <button className="underline text-red-600" onClick={() => remove(cur.id)}>মুছুন</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReliefForm({ supabase, row, onDone, onCancel }: any) {
  const [f, setF] = useState<any>({
    district: row?.district || '',
    division: row?.division || '',
    lat: row?.lat ?? null,
    lng: row?.lng ?? null,
    title: row?.title || '',
    area: row?.area || '',
    disaster_type: row?.disaster_type || 'বন্যা',
    families: row ? String(row.families_helped || 0) : '',
    amount: row ? String(row.amount_distributed || 0) : '',
    summary: row?.summary || '',
    materials: row?.materials || '',
    coordinator: row?.coordinator || '',
    photo_url: row?.photo_url || '',
    video_url: row?.video_url || '',
    proof_url: row?.proof_url || '',
    distributed_on: row?.distributed_on || '',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))

  function pick(name: string) {
    const d = DISTRICTS.find(x => x[1] === name)
    if (!d) { set('district', ''); return }
    setF((p: any) => ({ ...p, district: name, division: d[0], lat: d[2], lng: d[3] }))
  }

  async function save() {
    if (!f.title || !f.district) { setMsg('শিরোনাম ও জেলা বাছাই করুন'); return }
    const payload: any = {
      title: f.title,
      area: f.area || null,
      disaster_type: f.disaster_type,
      division: f.division,
      district: f.district,
      lat: f.lat,
      lng: f.lng,
      families_helped: Number(f.families) || 0,
      amount_distributed: Number(f.amount) || 0,
      summary: f.summary || null,
      materials: f.materials || null,
      coordinator: f.coordinator || null,
      photo_url: f.photo_url || null,
      video_url: f.video_url || null,
      proof_url: f.proof_url || null,
      distributed_on: f.distributed_on || null,
    }
    const { error } = row
      ? await supabase.from('relief_locations').update(payload).eq('id', row.id)
      : await supabase.from('relief_locations').insert(payload)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'রেকর্ড সম্পাদনা' : 'নতুন লোকেশন রেকর্ড'}</h3>
      <select className={input} value={f.district} onChange={e => pick(e.target.value)}>
        <option value="">জেলা বাছাই করুন *</option>
        {DIVISIONS.map(d => (
          <optgroup key={d} label={d}>
            {DISTRICTS.filter(x => x[0] === d).map(x => (
              <option key={x[1]} value={x[1]}>{x[1]}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <input className={input} placeholder="শিরোনাম * (যেমন: ফুলগাজী ও পরশুরাম)" value={f.title}
        onChange={e => set('title', e.target.value)} />
      <input className={input} placeholder="নির্দিষ্ট এলাকা (ঐচ্ছিক)" value={f.area}
        onChange={e => set('area', e.target.value)} />
      <select className={input} value={f.disaster_type} onChange={e => set('disaster_type', e.target.value)}>
        {DISASTERS.map(x => <option key={x}>{x}</option>)}
      </select>
      <input className={input} type="number" placeholder="সাহায্যপ্রাপ্ত পরিবার (সংখ্যা)" value={f.families}
        onChange={e => set('families', e.target.value)} />
      <input className={input} type="number" placeholder="মোট সহায়তার পরিমাণ (টাকা)" value={f.amount}
        onChange={e => set('amount', e.target.value)} />
      <textarea className={input} rows={3} placeholder="ত্রাণ কার্যক্রমের সারসংক্ষেপ" value={f.summary}
        onChange={e => set('summary', e.target.value)} />
      <textarea className={input} rows={2} placeholder="বিতরণকৃত সামগ্রী" value={f.materials}
        onChange={e => set('materials', e.target.value)} />
      <input className={input} placeholder="সমন্বয়কের নাম" value={f.coordinator}
        onChange={e => set('coordinator', e.target.value)} />
      <label className="text-xs text-gray-500">বিতরণের তারিখ</label>
      <input className={input} type="date" value={f.distributed_on}
        onChange={e => set('distributed_on', e.target.value)} />
      {f.photo_url && <img src={f.photo_url} className="w-full h-28 object-cover rounded-lg" />}
      <PhotoPicker supabase={supabase} folder="relief" label="📷 কভার ছবি" onDone={u => set('photo_url', u)} />
      <input className={input} placeholder="ভিডিওর লিংক (YouTube ইত্যাদি)" value={f.video_url}
        onChange={e => set('video_url', e.target.value)} />
      <input className={input} placeholder="প্রমাণ/ডকুমেন্টের লিংক" value={f.proof_url}
        onChange={e => set('proof_url', e.target.value)} />
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
