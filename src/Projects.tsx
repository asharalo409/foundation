import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => n.toLocaleString('bn-BD')
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
const CATS: Record<string, string> = {
  flood: 'বন্যা ও ত্রাণ',
  winter: 'শীতবস্ত্র',
  edu: 'শিক্ষা ও এতিম',
  medical: 'জরুরি চিকিৎসা',
  other: 'অন্যান্য',
}

export default function Projects({ supabase, member, settings }: any) {
  const [projects, setProjects] = useState<any[]>([])
  const [funds, setFunds] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [ups, setUps] = useState<any[]>([])
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [form, setForm] = useState<any>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [donate, setDonate] = useState(false)

  const role = member?.role
  const editor = ['admin', 'president', 'general_secretary'].includes(role)
  const poster = editor || role === 'publicity'

  async function load() {
    const [p, f, d, e, u] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('funds').select('*').order('name'),
      supabase.from('donations').select('amount, fund_id'),
      supabase.from('expenses').select('amount, fund_id'),
      supabase.from('project_updates').select('*').order('created_at', { ascending: false }),
    ])
    setProjects(p.data || [])
    setFunds(f.data || [])
    setDon(d.data || [])
    setExp(e.data || [])
    setUps(u.data || [])
  }
  useEffect(() => { load() }, [])

  async function removeProject(id: string) {
    if (!confirm('প্রকল্পটি ও এর সব আপডেট মুছে ফেলবেন?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  async function share(p: any) {
    const data = { title: p.title, text: p.title, url: window.location.href }
    if ((navigator as any).share) {
      try { await (navigator as any).share(data) } catch {}
    } else {
      try { await navigator.clipboard.writeText(data.url); alert('লিংক কপি হয়েছে') } catch {}
    }
  }

  const list = projects
    .filter(p => cat === 'all' || p.category === cat)
    .filter(p => !q || (p.title + ' ' + (p.area || '')).includes(q))

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">💚 সক্রিয় প্রকল্প ও অনুদানের খাত</p>
        <h2 className="text-xl font-bold">আর্তমানবতার পাশে দাঁড়ান আপনার সামর্থ্য অনুযায়ী</h2>
        <p className="text-sm text-gray-500">
          আপনার দান সরাসরি বিপন্ন মানুষের খাদ্য, আশ্রয় ও চিকিৎসায় ব্যয় হয়। প্রতিটি প্রকল্পের আপডেট সময়সহ এখানে প্রকাশিত হয়।
        </p>
      </div>

      {editor && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + নতুন প্রকল্প
        </button>
      )}

      {form && (
        <ProjectForm supabase={supabase} member={member} funds={funds} row={form.id ? form : null}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}

      <input className={input} placeholder="🔍 প্রকল্প বা এলাকা খুঁজুন..." value={q}
        onChange={e => setQ(e.target.value)} />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...Object.keys(CATS)].map(k => (
          <button key={k} onClick={() => setCat(k)}
            className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (cat === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {k === 'all' ? 'সকল প্রকল্প' : CATS[k]}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">এখনও কোনো প্রকল্প নেই</p>
      )}

      {list.map(p => {
        const collected = sum(don.filter(d => d.fund_id === p.fund_id && p.fund_id))
        const spent = sum(exp.filter(x => x.fund_id === p.fund_id && p.fund_id))
        const goal = Number(p.goal || 0)
        const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0
        const pUps = ups.filter(u => u.project_id === p.id)
        const lastAt = pUps[0]?.created_at || p.updated_at || p.created_at
        const edited = p.updated_at && new Date(p.updated_at).getTime() - new Date(p.created_at).getTime() > 60000

        return (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-44 bg-gradient-to-br from-green-700 to-slate-800">
              {p.cover_url && <img src={p.cover_url} className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="bg-black/50 text-white text-xs rounded-full px-3 py-1">
                  📍 {p.area || 'বাংলাদেশ'}
                </span>
                <span className="bg-white/90 text-green-800 text-xs rounded-full px-3 py-1">
                  {CATS[p.category] || 'অন্যান্য'}
                </span>
              </div>
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <h3 className="font-bold text-lg leading-tight">{p.title}</h3>
                {p.status === 'done' && <span className="text-xs bg-green-600 rounded px-2 py-0.5">✓ সম্পন্ন</span>}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {p.description && <p className="text-sm text-gray-600 whitespace-pre-line">{p.description}</p>}

              <div className="flex justify-between text-sm">
                <span>সংগৃহীত: <b className="text-green-700">{taka(collected)}</b></span>
                <span>লক্ষ্যমাত্রা: <b>{taka(goal)}</b></span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: pct + '%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>অগ্রগতি: {bn(pct)}% সম্পন্ন · খরচ: {taka(spent)}</span>
                <span>👥 {bn(p.families || 0)} পরিবার উপকৃত</span>
              </div>

              <div className="text-[11px] text-gray-400 space-y-0.5">
                <p>📅 প্রকাশ: {fmtDT(p.created_at)}</p>
                {edited && <p>✏️ সম্পাদিত: {fmtDT(p.updated_at)}</p>}
                <p>🕒 সর্বশেষ আপডেট: {fmtDT(lastAt)}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-green-700 text-white rounded-lg py-2.5 text-sm font-semibold"
                  onClick={() => setDonate(true)}>
                  💚 অনুদানের হাত বাড়ান
                </button>
                <button className="border rounded-lg px-4" onClick={() => share(p)}>🔗</button>
              </div>

              <button className="text-sm font-semibold text-green-700 underline"
                onClick={() => setOpen(open === p.id ? null : p.id)}>
                {open === p.id ? 'আপডেট লুকান' : `আপডেট দেখুন (${bn(pUps.length)})`}
              </button>

              {open === p.id && (
                <UpdateBox supabase={supabase} project={p} member={member} items={pUps}
                  canPost={poster} onDone={load} />
              )}

              {editor && (
                <div className="flex gap-4 text-xs pt-1">
                  <button className="underline" onClick={() => setForm(p)}>সম্পাদনা</button>
                  <button className="underline text-red-600" onClick={() => removeProject(p.id)}>মুছুন</button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {donate && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center"
          onClick={() => setDonate(false)}>
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold">💚 অনুদান পাঠানোর মাধ্যম</h3>
            {settings?.bank_details ? (
              <p className="text-sm whitespace-pre-line">{settings.bank_details}</p>
            ) : (
              <p className="text-sm text-gray-500">এখনও কোনো মাধ্যম যোগ করা হয়নি।</p>
            )}
            {settings?.hotline && (
              <p className="text-sm">📞 <a href={'tel:' + settings.hotline}>{settings.hotline}</a></p>
            )}
            <p className="text-xs text-gray-500">
              টাকা পাঠিয়ে কোষাধ্যক্ষকে জানালে আপনার অনুদানের রসিদ ও এন্ট্রি আয়-ব্যয়ে সময়সহ দেখা যাবে।
            </p>
            <button className="w-full border rounded-lg py-2" onClick={() => setDonate(false)}>বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  )
}

function UpdateBox({ supabase, project, member, items, canPost, onDone }: any) {
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState('')
  const [msg, setMsg] = useState('')

  async function post() {
    if (!text.trim()) { setMsg('আপডেটের লেখা দিন'); return }
    const { error } = await supabase.from('project_updates').insert({
      project_id: project.id,
      body: text.trim(),
      photo_url: photo || null,
      created_by: member?.id || null,
    })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else { setText(''); setPhoto(''); setMsg(''); onDone() }
  }
  async function del(id: string) {
    if (!confirm('আপডেটটি মুছবেন?')) return
    await supabase.from('project_updates').delete().eq('id', id)
    onDone()
  }

  return (
    <div className="border-t pt-3 space-y-3">
      {canPost && (
        <div className="space-y-2">
          <textarea className={input} rows={2} placeholder="নতুন আপডেট লিখুন..." value={text}
            onChange={e => setText(e.target.value)} />
          {photo && <img src={photo} className="w-full h-28 object-cover rounded-lg" />}
          <div className="flex gap-2 items-start">
            <PhotoPicker supabase={supabase} folder="projects" label="📷 ছবি" onDone={setPhoto} />
            <button className="bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold" onClick={post}>
              আপডেট দিন
            </button>
          </div>
          {msg && <p className="text-xs text-red-600">{msg}</p>}
        </div>
      )}
      {items.length === 0 && <p className="text-sm text-gray-500">এখনও কোনো আপডেট নেই</p>}
      {items.map((u: any) => (
        <div key={u.id} className="border-l-2 border-green-600 pl-3 space-y-1">
          <p className="text-[11px] text-gray-400">🕒 {fmtDT(u.created_at)}</p>
          <p className="text-sm whitespace-pre-line">{u.body}</p>
          {u.photo_url && <img src={u.photo_url} className="w-full max-h-56 object-cover rounded-lg" />}
          {canPost && (
            <button className="text-xs text-red-600 underline" onClick={() => del(u.id)}>মুছুন</button>
          )}
        </div>
      ))}
    </div>
  )
}

function ProjectForm({ supabase, member, funds, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    title: row?.title || '',
    area: row?.area || '',
    category: row?.category || 'other',
    description: row?.description || '',
    cover_url: row?.cover_url || '',
    goal: row ? String(row.goal || 0) : '',
    fund_id: row?.fund_id || '',
    families: row ? String(row.families || 0) : '',
    status: row?.status || 'active',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.title) { setMsg('প্রকল্পের নাম দিন'); return }
    const payload: any = {
      title: f.title,
      area: f.area || null,
      category: f.category,
      description: f.description || null,
      cover_url: f.cover_url || null,
      goal: Number(f.goal) || 0,
      fund_id: f.fund_id || null,
      families: Number(f.families) || 0,
      status: f.status,
    }
    const { error } = row
      ? await supabase.from('projects').update(payload).eq('id', row.id)
      : await supabase.from('projects').insert({ ...payload, created_by: member?.id || null })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'প্রকল্প সম্পাদনা' : 'নতুন প্রকল্প'}</h3>
      <input className={input} placeholder="প্রকল্পের নাম *" value={f.title} onChange={e => set('title', e.target.value)} />
      <input className={input} placeholder="এলাকা (যেমন: ফেনী, নোয়াখালী)" value={f.area} onChange={e => set('area', e.target.value)} />
      <select className={input} value={f.category} onChange={e => set('category', e.target.value)}>
        {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <textarea className={input} rows={3} placeholder="বিবরণ" value={f.description} onChange={e => set('description', e.target.value)} />
      {f.cover_url && <img src={f.cover_url} className="w-full h-28 object-cover rounded-lg" />}
      <PhotoPicker supabase={supabase} folder="projects" label="কভার ছবি বাছাই" onDone={u => set('cover_url', u)} />
      <input className={input} type="number" placeholder="লক্ষ্যমাত্রা (টাকা)" value={f.goal} onChange={e => set('goal', e.target.value)} />
      <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
        <option value="">সংযুক্ত খাত (সংগৃহীত টাকা যেখান থেকে আসবে)</option>
        {funds.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <input className={input} type="number" placeholder="উপকৃত পরিবার (সংখ্যা)" value={f.families} onChange={e => set('families', e.target.value)} />
      <select className={input} value={f.status} onChange={e => set('status', e.target.value)}>
        <option value="active">চলমান</option>
        <option value="done">সম্পন্ন</option>
      </select>
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
