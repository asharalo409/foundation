import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const KINDS: Record<string, string> = {
  notice: 'সাধারণ নোটিশ',
  resolution: 'রেজুলেশন',
  press: 'প্রেস রিলিজ',
}
const EDITORS = ['admin', 'president', 'publicity']

export function Notices({ supabase, member }: any) {
  const editor = EDITORS.includes(member?.role)
  const [rows, setRows] = useState<any[]>([])
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [form, setForm] = useState<any>(null)

  async function load() {
    const { data } = await supabase.from('notices').select('*').neq('kind', 'gallery')
      .order('created_at', { ascending: false }).limit(100)
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('নোটিশটি মুছে ফেলবেন?')) return
    await supabase.from('notices').delete().eq('id', id)
    load()
  }

  const list = rows
    .filter(r => kind === 'all' || r.kind === kind)
    .filter(r => !q || ((r.title || '') + ' ' + (r.body || '')).includes(q))

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">📢 অফিসিয়াল নোটিশ বোর্ড</p>
        <h2 className="text-xl font-bold">ঘোষণা, রেজুলেশন ও প্রেস রিলিজ</h2>
        <p className="text-sm text-gray-500">সংগঠনের সব অফিসিয়াল ঘোষণা এখানে সময়সহ প্রকাশিত হয়।</p>
      </div>

      {editor && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + নতুন নোটিশ
        </button>
      )}
      {form && (
        <NoticeForm supabase={supabase} member={member} row={form.id ? form : null}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}

      <input className={input} placeholder="🔍 নোটিশ খুঁজুন..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...Object.keys(KINDS)].map(k => (
          <button key={k} onClick={() => setKind(k)}
            className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (kind === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {k === 'all' ? 'সব' : KINDS[k]}
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="text-center text-sm text-gray-500 py-6">কোনো নোটিশ নেই</p>}

      {list.map(n => (
        <div key={n.id}
          className={'bg-white rounded-xl p-4 shadow-sm space-y-2 ' + (n.is_urgent ? 'border border-red-400' : '')}>
          <div className="flex gap-2 items-center text-xs">
            <span className="bg-green-50 text-green-800 font-semibold rounded-full px-3 py-1">
              {KINDS[n.kind] || n.kind}
            </span>
            {n.is_urgent && <span className="bg-red-100 text-red-700 font-semibold rounded-full px-3 py-1">🚨 জরুরি</span>}
          </div>
          <h3 className="font-bold">{n.title}</h3>
          {n.body && <p className="text-sm text-gray-600 whitespace-pre-line">{n.body}</p>}
          {n.media_url && <img src={n.media_url} className="w-full max-h-72 object-cover rounded-lg" />}
          <p className="text-[11px] text-gray-400">🕒 প্রকাশ: {fmtDT(n.created_at)}</p>
          {editor && (
            <div className="flex gap-4 text-xs">
              <button className="underline" onClick={() => setForm(n)}>সম্পাদনা</button>
              <button className="underline text-red-600" onClick={() => remove(n.id)}>মুছুন</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function NoticeForm({ supabase, member, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    kind: row?.kind || 'notice',
    title: row?.title || '',
    body: row?.body || '',
    urgent: !!row?.is_urgent,
    media_url: row?.media_url || '',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }))

  async function save() {
    if (!f.title) { setMsg('শিরোনাম দিন'); return }
    const payload: any = {
      kind: f.kind, title: f.title, body: f.body || null,
      is_urgent: f.urgent, media_url: f.media_url || null,
    }
    const { error } = row
      ? await supabase.from('notices').update(payload).eq('id', row.id)
      : await supabase.from('notices').insert({ ...payload, created_by: member?.id || null })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}</h3>
      <select className={input} value={f.kind} onChange={e => set('kind', e.target.value)}>
        {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input className={input} placeholder="শিরোনাম *" value={f.title} onChange={e => set('title', e.target.value)} />
      <textarea className={input} rows={4} placeholder="বিস্তারিত" value={f.body} onChange={e => set('body', e.target.value)} />
      {f.media_url && <img src={f.media_url} className="w-full h-28 object-cover rounded-lg" />}
      <PhotoPicker supabase={supabase} folder="notices" label="📷 ছবি যোগ (ঐচ্ছিক)" onDone={u => set('media_url', u)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.urgent} onChange={e => set('urgent', e.target.checked)} />
        জরুরি নোটিশ
      </label>
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>
          {row ? 'সংরক্ষণ' : 'প্রকাশ করুন'}
        </button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

export function Gallery({ supabase, member }: any) {
  const editor = EDITORS.includes(member?.role)
  const [rows, setRows] = useState<any[]>([])
  const [big, setBig] = useState<any>(null)

  async function load() {
    const { data } = await supabase.from('notices').select('*').eq('kind', 'gallery')
      .order('created_at', { ascending: false }).limit(100)
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  async function addPhoto(url: string) {
    await supabase.from('notices').insert({
      kind: 'gallery', title: 'ছবি', media_url: url, created_by: member?.id || null,
    })
    load()
  }
  async function addVideo() {
    const url = window.prompt('ভিডিওর লিংক (YouTube/ফেসবুক ইত্যাদি):')
    if (!url) return
    const cap = window.prompt('ভিডিওর শিরোনাম:') || 'ভিডিও'
    await supabase.from('notices').insert({
      kind: 'gallery', title: cap, body: url, created_by: member?.id || null,
    })
    load()
  }
  async function caption(g: any) {
    const c = window.prompt('ক্যাপশন লিখুন:', g.title || '')
    if (c === null) return
    await supabase.from('notices').update({ title: c || 'ছবি' }).eq('id', g.id)
    load()
  }
  async function remove(id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from('notices').delete().eq('id', id)
    setBig(null)
    load()
  }

  const photos = rows.filter(r => r.media_url)
  const videos = rows.filter(r => !r.media_url && r.body)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">🖼️ ছবি ও ভিডিও গ্যালারি</p>
        <h2 className="text-xl font-bold">কার্যক্রমের স্মৃতির ফ্রেম</h2>
      </div>

      {editor && (
        <div className="flex gap-2 items-start">
          <PhotoPicker supabase={supabase} folder="gallery" label="+ ছবি যোগ করুন" onDone={addPhoto} />
          <button className="border border-green-700 text-green-700 rounded-lg px-3 py-2 text-sm font-semibold"
            onClick={addVideo}>
            + ভিডিও লিংক
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">▶ ভিডিও</h3>
          {videos.map(v => (
            <div key={v.id} className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{v.title}</p>
                <p className="text-[11px] text-gray-400">🕒 {fmtDT(v.created_at)}</p>
              </div>
              <div className="flex gap-2 items-center">
                <a href={v.body} target="_blank" rel="noreferrer"
                  className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">▶ দেখুন</a>
                {editor && (
                  <button className="text-xs text-red-600 underline" onClick={() => remove(v.id)}>মুছুন</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm mb-2">📷 ছবি ({photos.length})</h3>
        {photos.length === 0 && <p className="text-sm text-gray-500 text-center py-4">এখনও কোনো ছবি নেই</p>}
        <div className="grid grid-cols-2 gap-2">
          {photos.map(g => (
            <button key={g.id} onClick={() => setBig(g)} className="text-left">
              <img src={g.media_url} className="w-full h-32 object-cover rounded-lg" />
              <p className="text-xs font-semibold truncate">{g.title}</p>
              <p className="text-[10px] text-gray-400">🕒 {fmtDT(g.created_at)}</p>
            </button>
          ))}
        </div>
      </div>

      {big && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setBig(null)}>
          <img src={big.media_url} className="max-h-[75vh] max-w-full object-contain rounded-lg" />
          <p className="text-white text-sm mt-3">{big.title}</p>
          <p className="text-gray-400 text-xs">🕒 {fmtDT(big.created_at)}</p>
          {editor && (
            <div className="flex gap-6 mt-3 text-sm" onClick={e => e.stopPropagation()}>
              <button className="text-white underline" onClick={() => caption(big)}>ক্যাপশন বদলান</button>
              <button className="text-red-400 underline" onClick={() => remove(big.id)}>মুছুন</button>
            </div>
          )}
          <button className="absolute top-4 right-4 text-white text-2xl">✕</button>
        </div>
      )}
    </div>
  )
}
