import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'
import { fmtDT } from './time'
import { ROLES } from './Dashboard'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const CATS: Record<string, string> = {
  relief: 'ত্রাণ ও পুনর্বাসন',
  health: 'স্বাস্থ্য সেবা',
  edu: 'শিক্ষা',
  winter: 'শীতবস্ত্র',
  other: 'অন্যান্য',
}
const EMOJI = ['❤️', '🤲', '👏', '👍', '💡']
const EDITORS = ['admin', 'president', 'general_secretary']

const localInput = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function Works({ supabase, member, user, onNav }: any) {
  const isEditor = EDITORS.includes(member?.role)
  const [reports, setReports] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [reacts, setReacts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [cat, setCat] = useState('all')
  const [form, setForm] = useState<any>(null)
  const [openC, setOpenC] = useState('')
  const [ctext, setCtext] = useState('')
  const [note, setNote] = useState('')

  async function load() {
    const [r, p, re, c] = await Promise.all([
      supabase.from('field_reports').select('*').order('activity_at', { ascending: false }),
      supabase.from('public_members').select('id, full_name, role, photo_url'),
      supabase.from('report_reactions').select('*'),
      supabase.from('report_comments').select('*').order('created_at'),
    ])
    setReports(r.data || [])
    setPeople(p.data || [])
    setReacts(re.data || [])
    setComments(c.data || [])
  }
  useEffect(() => { load() }, [])

  const who = (id: string) => people.find(p => p.id === id)

  async function react(rid: string, emoji: string) {
    if (!member) { onNav('login'); return }
    const mine = reacts.some(x => x.report_id === rid && x.member_id === member.id && x.emoji === emoji)
    if (mine)
      await supabase.from('report_reactions').delete()
        .match({ report_id: rid, member_id: member.id, emoji })
    else
      await supabase.from('report_reactions').insert({ report_id: rid, member_id: member.id, emoji })
    load()
  }

  async function addComment(rid: string) {
    const body = ctext.trim()
    if (!body || !member) return
    await supabase.from('report_comments').insert({ report_id: rid, member_id: member.id, body })
    setCtext('')
    load()
  }
  async function delComment(id: string) {
    if (!confirm('মন্তব্যটি মুছবেন?')) return
    await supabase.from('report_comments').delete().eq('id', id)
    load()
  }

  async function verify(r: any, on: boolean) {
    await supabase.from('field_reports').update(
      on
        ? { status: 'verified', verified_by: member.id, verified_at: new Date().toISOString() }
        : { status: 'pending', verified_by: null, verified_at: null }
    ).eq('id', r.id)
    load()
  }
  async function removeReport(id: string) {
    if (!confirm('রিপোর্টটি মুছে ফেলবেন?')) return
    await supabase.from('field_reports').delete().eq('id', id)
    load()
  }

  const list = reports.filter(r => cat === 'all' || r.category === cat)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">✅ ফিল্ড কার্যক্রম ও প্রমাণ দলিল</p>
        <h2 className="text-xl font-bold">সাম্প্রতিক কার্যক্রম ও স্বচ্ছতার রিপোর্ট</h2>
        <p className="text-sm text-gray-500">
          ছবি, ভিডিও ও অডিট ভাউচারের লিংকসহ মাঠপর্যায়ের প্রতিটি সমাজকল্যাণমূলক পদক্ষেপের পূর্ণাঙ্গ প্রতিবেদন।
        </p>
      </div>

      {!user ? (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => onNav('login')}>
          রিপোর্ট জমা দিতে লগইন করুন
        </button>
      ) : member ? (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => { setNote(''); setForm({}) }}>
          + নতুন কাজের প্রমাণ ও পোস্ট যুক্ত করুন
        </button>
      ) : null}

      {note && <p className="text-sm text-green-700">{note}</p>}

      {form && (
        <ReportForm supabase={supabase} member={member} editor={isEditor}
          row={form.id ? form : null}
          onDone={(created: boolean) => {
            setForm(null)
            if (created && !isEditor)
              setNote('✅ রিপোর্ট জমা হয়েছে। সভাপতি বা সাধারণ সম্পাদক যাচাই করলে সবার জন্য প্রকাশিত হবে।')
            load()
          }}
          onCancel={() => setForm(null)} />
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...Object.keys(CATS)].map(k => (
          <button key={k} onClick={() => setCat(k)}
            className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (cat === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {k === 'all' ? 'সকল কার্যক্রম' : CATS[k]}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">এখনও কোনো কাজের রিপোর্ট নেই</p>
      )}

      {list.map(r => {
        const author = who(r.member_id)
        const rr = reacts.filter(x => x.report_id === r.id)
        const cc = comments.filter(x => x.report_id === r.id)
        const verified = r.status === 'verified'
        const verifier = who(r.verified_by)
        const isOwner = r.member_id === member?.id
        const canManage = isEditor || (isOwner && !verified)
        const photos: string[] = r.photo_urls || []
        const edited = r.updated_at &&
          new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 60000

        return (
          <div key={r.id}
            className={'bg-white rounded-2xl shadow-sm p-4 space-y-3 ' + (verified ? '' : 'border border-amber-300')}>
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="bg-green-50 text-green-800 font-semibold rounded-full px-3 py-1">
                {CATS[r.category] || 'অন্যান্য'}
              </span>
              <span className="text-gray-500">📅 {fmtDT(r.activity_at)}</span>
              {r.location && <span className="text-gray-500">📍 {r.location}</span>}
            </div>

            <h3 className="font-bold text-base leading-snug">{r.title}</h3>
            <p className="text-xs text-gray-500">
              প্রতিবেদক: <b>{author?.full_name || 'সদস্য'}</b>
              {author?.role && ' (' + (ROLES[author.role] || author.role) + ')'}
            </p>
            {r.body && <p className="text-sm text-gray-700 whitespace-pre-line">{r.body}</p>}

            <div className="rounded-lg bg-green-50 p-3 space-y-1 text-sm">
              <div className="flex justify-between flex-wrap gap-1">
                <span>💲 মোট ব্যয়িত অনুদান: <b>{taka(r.spent)}</b></span>
                <span>👥 উপকৃত: <b>{bn(r.beneficiaries)} জন</b></span>
              </div>
              {verified ? (
                <p className="text-xs font-semibold text-green-700">
                  ✓ শতভাগ যাচাইকৃত
                  {verifier && ' · ' + verifier.full_name}
                  {r.verified_at && ' · 🕒 ' + fmtDT(r.verified_at)}
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600">⏳ যাচাইয়ের অপেক্ষায় (শুধু জমাদাতা ও যাচাইকারী দেখছেন)</p>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((u, i) => (
                  <div key={u} className="relative">
                    <img src={u} className="w-full h-36 object-cover rounded-lg" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-2 py-0.5">
                      মাঠপর্যায়ের প্রমাণ ছবি #{bn(i + 1)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              {EMOJI.map(e => {
                const n = rr.filter(x => x.emoji === e).length
                const mine = rr.some(x => x.emoji === e && x.member_id === member?.id)
                return (
                  <button key={e} onClick={() => react(r.id, e)}
                    className={'rounded-full border px-2.5 py-1 text-sm ' +
                      (mine ? 'border-green-600 bg-green-50' : '')}>
                    {e} {n > 0 && <span className="text-xs">{bn(n)}</span>}
                  </button>
                )
              })}
              <button className="ml-auto text-sm text-gray-600"
                onClick={() => { setOpenC(openC === r.id ? '' : r.id); setCtext('') }}>
                💬 {bn(cc.length)}টি মন্তব্য
              </button>
            </div>

            {openC === r.id && (
              <div className="space-y-2 border-t pt-2">
                {cc.length === 0 && <p className="text-xs text-gray-400">এখনও কোনো মন্তব্য নেই</p>}
                {cc.map(c => {
                  const p = who(c.member_id)
                  return (
                    <div key={c.id} className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs font-semibold">
                        {p?.full_name || 'সদস্য'}
                        {p?.role && (
                          <span className="ml-1 text-[10px] bg-green-100 text-green-800 rounded px-1.5 py-0.5">
                            {ROLES[p.role] || p.role}
                          </span>
                        )}
                      </p>
                      <p className="text-sm">{c.body}</p>
                      <p className="text-[10px] text-gray-400 flex gap-3">
                        🕒 {fmtDT(c.created_at)}
                        {(c.member_id === member?.id || isEditor) && (
                          <button className="text-red-600 underline" onClick={() => delComment(c.id)}>মুছুন</button>
                        )}
                      </p>
                    </div>
                  )
                })}
                {member ? (
                  <div className="flex gap-2">
                    <input className={input} placeholder="মন্তব্য লিখুন..." value={ctext}
                      onChange={e => setCtext(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addComment(r.id) }} />
                    <button className="bg-green-700 text-white rounded-lg px-4 font-semibold"
                      onClick={() => addComment(r.id)}>➤</button>
                  </div>
                ) : (
                  <button className="text-xs text-green-700 underline" onClick={() => onNav('login')}>
                    মন্তব্য করতে লগইন করুন
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {r.video_url && (
                <a href={r.video_url} target="_blank" rel="noreferrer"
                  className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-semibold">
                  ▶ ভিডিও রিপোর্ট দেখুন
                </a>
              )}
              {r.proof_url && (
                <a href={r.proof_url} target="_blank" rel="noreferrer"
                  className="border border-green-700 text-green-700 rounded-lg px-3 py-2 text-sm font-semibold">
                  🧾 অডিট ভাউচার ডকুমেন্ট
                </a>
              )}
            </div>

            <div className="text-[11px] text-gray-400 space-y-0.5">
              <p>স্বচ্ছতা আইডি: ACT-{r.id.slice(0, 6)}</p>
              <p>📅 প্রকাশ: {fmtDT(r.created_at)}</p>
              {edited && <p>✏️ সম্পাদিত: {fmtDT(r.updated_at)}</p>}
            </div>

            {(isEditor || canManage) && (
              <div className="flex flex-wrap gap-4 text-xs">
                {isEditor && !verified && (
                  <button className="font-semibold text-green-700 underline" onClick={() => verify(r, true)}>
                    ✓ যাচাই করুন
                  </button>
                )}
                {isEditor && verified && (
                  <button className="underline text-amber-600" onClick={() => verify(r, false)}>
                    যাচাই প্রত্যাহার
                  </button>
                )}
                {canManage && (
                  <>
                    <button className="underline" onClick={() => setForm(r)}>সম্পাদনা</button>
                    <button className="underline text-red-600" onClick={() => removeReport(r.id)}>মুছুন</button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReportForm({ supabase, member, editor, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    title: row?.title || '',
    category: row?.category || 'relief',
    location: row?.location || '',
    activity_at: localInput(row?.activity_at),
    body: row?.body || '',
    spent: row ? String(row.spent || 0) : '',
    beneficiaries: row ? String(row.beneficiaries || 0) : '',
    video_url: row?.video_url || '',
    proof_url: row?.proof_url || '',
  })
  const [photos, setPhotos] = useState<string[]>(row?.photo_urls || [])
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  async function save() {
    if (!f.title) { setMsg('শিরোনাম দিন'); return }
    const payload: any = {
      title: f.title,
      category: f.category,
      location: f.location || null,
      activity_at: new Date(f.activity_at).toISOString(),
      body: f.body || null,
      spent: Number(f.spent) || 0,
      beneficiaries: Number(f.beneficiaries) || 0,
      video_url: f.video_url || null,
      proof_url: f.proof_url || null,
      photo_urls: photos,
    }
    let error: any
    if (row) {
      ;({ error } = await supabase.from('field_reports').update(payload).eq('id', row.id))
    } else {
      const extra = editor
        ? { status: 'verified', verified_by: member.id, verified_at: new Date().toISOString() }
        : { status: 'pending' }
      ;({ error } = await supabase.from('field_reports')
        .insert({ ...payload, ...extra, member_id: member.id }))
    }
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone(!row)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'রিপোর্ট সম্পাদনা' : 'নতুন কাজের রিপোর্ট'}</h3>
      <input className={input} placeholder="শিরোনাম *" value={f.title} onChange={e => set('title', e.target.value)} />
      <select className={input} value={f.category} onChange={e => set('category', e.target.value)}>
        {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input className={input} placeholder="জায়গা (যেমন: ফুলগাজী, ফেনী)" value={f.location}
        onChange={e => set('location', e.target.value)} />
      <label className="text-xs text-gray-500">কাজের তারিখ ও সময়</label>
      <input className={input} type="datetime-local" value={f.activity_at}
        onChange={e => set('activity_at', e.target.value)} />
      <textarea className={input} rows={4} placeholder="কাজের বিবরণ" value={f.body}
        onChange={e => set('body', e.target.value)} />
      <input className={input} type="number" placeholder="মোট ব্যয়িত অনুদান (টাকা)" value={f.spent}
        onChange={e => set('spent', e.target.value)} />
      <input className={input} type="number" placeholder="উপকৃত মানুষ/পরিবার (সংখ্যা)" value={f.beneficiaries}
        onChange={e => set('beneficiaries', e.target.value)} />

      <div className="grid grid-cols-2 gap-2">
        {photos.map((u, i) => (
          <div key={u} className="relative">
            <img src={u} className="w-full h-24 object-cover rounded-lg" />
            <button className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-2"
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
      </div>
      {photos.length < 4 && (
        <PhotoPicker supabase={supabase} folder="reports" label="📷 প্রমাণ ছবি যোগ (সর্বোচ্চ ৪টি)"
          onDone={(u: string) => setPhotos(p => [...p, u])} />
      )}

      <input className={input} placeholder="ভিডিও রিপোর্টের লিংক (ঐচ্ছিক)" value={f.video_url}
        onChange={e => set('video_url', e.target.value)} />
      <input className={input} placeholder="অডিট ভাউচার/ডকুমেন্টের লিংক (ঐচ্ছিক)" value={f.proof_url}
        onChange={e => set('proof_url', e.target.value)} />
      {!editor && !row && (
        <p className="text-[11px] text-amber-600">
          জমা দিলে এটি "যাচাইয়ের অপেক্ষায়" থাকবে এবং সভাপতি বা সাধারণ সম্পাদক যাচাই করলে সবার জন্য প্রকাশিত হবে।
        </p>
      )}
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>
          {row ? 'সংরক্ষণ' : editor ? 'প্রকাশ করুন' : 'জমা দিন'}
        </button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
