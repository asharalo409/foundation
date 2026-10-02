import { useEffect, useRef, useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const tm = (s: string) =>
  new Date(s).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
const dy = (s: string) =>
  new Date(s).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })

export default function Chat({ supabase, member, user, onNav }: any) {
  const [people, setPeople] = useState<any[]>([])
  const [mode, setMode] = useState<'room' | 'dm'>('room')
  const [peer, setPeer] = useState<any>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const meId = member?.id
  const isAdmin = member?.role === 'admin'

  useEffect(() => {
    supabase.from('public_members').select('*').order('full_name')
      .then(({ data }: any) => setPeople(data || []))
  }, [])

  async function load() {
    if (!meId) return
    let query = supabase.from('messages').select('*')
      .order('created_at', { ascending: false }).limit(100)
    if (mode === 'room') {
      query = query.is('receiver_id', null)
    } else if (peer) {
      query = query.or(
        `and(sender_id.eq.${meId},receiver_id.eq.${peer.id}),and(sender_id.eq.${peer.id},receiver_id.eq.${meId})`
      )
    } else {
      setMsgs([])
      return
    }
    const { data } = await query
    setMsgs((data || []).reverse())
  }

  useEffect(() => {
    load()
    const ch = supabase
      .channel('chat-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .subscribe()
    const id = setInterval(load, 5000)
    return () => {
      clearInterval(id)
      supabase.removeChannel(ch)
    }
  }, [meId, mode, peer?.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  if (!user)
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-3">
        <div className="text-4xl">💬</div>
        <p className="text-sm text-gray-600">চ্যাট ব্যবহার করতে সদস্য হিসেবে লগইন করুন।</p>
        <button className="bg-green-700 text-white font-semibold rounded-lg px-5 py-2"
          onClick={() => onNav('login')}>
          লগইন
        </button>
      </div>
    )

  if (!member)
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center text-sm text-gray-600">
        অ্যাডমিন আপনাকে সদস্য হিসেবে যুক্ত করলে চ্যাট চালু হবে।
      </div>
    )

  const nameOf = (id: string) => people.find(p => p.id === id)?.full_name || 'সদস্য'

  async function send() {
    const body = text.trim()
    if (!body) return
    if (mode === 'dm' && !peer) return
    setText('')
    const { error } = await supabase.from('messages').insert({
      sender_id: meId,
      receiver_id: mode === 'dm' ? peer.id : null,
      body,
    })
    if (error) setErr('পাঠানো যায়নি: ' + error.message)
    else { setErr(''); load() }
  }

  async function remove(id: string) {
    if (!confirm('বার্তাটি মুছবেন?')) return
    await supabase.from('messages').delete().eq('id', id)
    load()
  }

  const showChat = mode === 'room' || peer
  const list = people
    .filter(p => p.id !== meId)
    .filter(p => !q || p.full_name.includes(q))

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('room'); setPeer(null) }}
          className={'flex-1 py-2 rounded-lg text-sm font-semibold ' +
            (mode === 'room' ? 'bg-green-700 text-white' : 'bg-white border')}>
          🌐 কমিউনিটি রুম
        </button>
        <button
          onClick={() => setMode('dm')}
          className={'flex-1 py-2 rounded-lg text-sm font-semibold ' +
            (mode === 'dm' ? 'bg-green-700 text-white' : 'bg-white border')}>
          ✉️ ব্যক্তিগত
        </button>
      </div>

      {mode === 'dm' && !peer && (
        <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
          <input className={input} placeholder="সদস্যের নাম খুঁজুন..." value={q}
            onChange={e => setQ(e.target.value)} />
          {list.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">কোনো সদস্য পাওয়া যায়নি</p>
          )}
          {list.map(p => (
            <button key={p.id} onClick={() => setPeer(p)}
              className="w-full flex items-center gap-3 border-t pt-2 text-left">
              {p.photo_url ? (
                <img src={p.photo_url} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
              )}
              <span className="text-sm font-semibold">{p.full_name}</span>
            </button>
          ))}
        </div>
      )}

      {showChat && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center gap-2">
            {mode === 'dm' && (
              <button className="text-lg" onClick={() => setPeer(null)}>←</button>
            )}
            <p className="font-bold text-sm">
              {mode === 'room' ? '🌐 কমিউনিটি রুম' : '✉️ ' + peer.full_name}
            </p>
          </div>

          <div className="h-[55vh] overflow-y-auto p-3 space-y-2">
            {msgs.length === 0 && (
              <p className="text-center text-sm text-gray-400 pt-10">এখনও কোনো বার্তা নেই</p>
            )}
            {msgs.map((m, i) => {
              const mine = m.sender_id === meId
              const newDay = i === 0 || dy(msgs[i - 1].created_at) !== dy(m.created_at)
              return (
                <div key={m.id}>
                  {newDay && (
                    <p className="text-center text-[10px] text-gray-400 my-2">{dy(m.created_at)}</p>
                  )}
                  <div className={'flex ' + (mine ? 'justify-end' : 'justify-start')}>
                    <div className={'max-w-[80%] rounded-2xl px-3 py-2 ' +
                      (mine ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-800')}>
                      {!mine && mode === 'room' && (
                        <p className="text-[11px] font-semibold text-green-700">{nameOf(m.sender_id)}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={'text-[10px] mt-0.5 flex gap-2 justify-end ' +
                        (mine ? 'text-white/70' : 'text-gray-400')}>
                        {tm(m.created_at)}
                        {(mine || isAdmin) && (
                          <button onClick={() => remove(m.id)}>🗑</button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>

          <div className="p-2 border-t flex gap-2">
            <input className={input} placeholder="বার্তা লিখুন..." value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }} />
            <button className="bg-green-700 text-white rounded-lg px-4 font-semibold" onClick={send}>
              ➤
            </button>
          </div>
          {err && <p className="text-xs text-red-600 text-center pb-2">{err}</p>}
        </div>
      )}
    </div>
  )
}
