import { useMemo, useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const METHODS = ['বিকাশ', 'নগদ', 'রকেট', 'ব্যাংক', 'হাতে হাতে']

const BN = '০১২৩৪৫৬৭৮৯'
const en = (s: string) => s.replace(/[০-৯]/g, d => String(BN.indexOf(d)))
const norm = (s: string) => en(String(s || '')).trim().toLowerCase().replace(/\s+/g, ' ')

// তারিখ: 2024-05-17, 17/05/2024, 17-05-2024, 17.05.2024 (বাংলা অঙ্কও চলবে)
function parseDate(raw: string): string | null {
  const s = en(raw).trim()
  let y = 0, m = 0, d = 0
  let r = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (r) { y = +r[1]; m = +r[2]; d = +r[3] }
  else {
    r = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
    if (!r) return null
    d = +r[1]; m = +r[2]; y = +r[3]
  }
  const t = new Date(y, m - 1, d)
  if (t.getFullYear() !== y || t.getMonth() !== m - 1 || t.getDate() !== d) return null
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0')
}
function parseAmount(raw: string): number {
  const n = Number(en(raw).replace(/[৳,\s]|টাকা|tk/gi, ''))
  return isFinite(n) ? n : 0
}

type Row = {
  line: number
  status: 'ok' | 'dup' | 'bad'
  note: string
  date?: string
  amount?: number
  fund_id?: string
  fundName?: string
  who?: string       // দাতার নাম / খরচের বিবরণ
  extra?: string     // মাধ্যম / খরচের ধরন
}

// পুরোনো হিসাব একসাথে তোলার টুল (শুধু অ্যাডমিনের জন্য)
export default function BulkImport({ supabase, funds, don, exp, member, onDone, onCancel }: any) {
  const [kind, setKind] = useState<'don' | 'exp'>('don')
  const [text, setText] = useState('')
  const [defFund, setDefFund] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const sample = kind === 'don'
    ? '15/03/2024\tরহিম উদ্দিন\t500\tসাধারণ তহবিল\tবিকাশ\n02/04/2024\tকরিম মিয়া\t1,000\t\tহাতে হাতে'
    : '20/03/2024\t2500\tসাধারণ তহবিল\tখাদ্য সামগ্রী\t২৫ পরিবারকে চাল ডাল বিতরণ\n05/04/2024\t800\t\tপরিবহন\tত্রাণ বহনের গাড়ি ভাড়া'

  const rows: Row[] = useMemo(() => {
    const out: Row[] = []
    const fundByName = new Map<string, any>()
    funds.forEach((f: any) => fundByName.set(norm(f.name), f))
    const seen = new Set<string>()
    const key = (date: string, amt: number, who: string) => date + '|' + amt + '|' + norm(who)
    if (kind === 'don') don.forEach((x: any) => seen.add(key(x.donated_on, Number(x.amount), x.donor_name || '')))
    else exp.forEach((x: any) => seen.add(key(x.spent_on, Number(x.amount), x.description || '')))

    text.split(/\r?\n/).forEach((ln, idx) => {
      if (!ln.trim()) return
      const c = (ln.includes('\t') ? ln.split('\t') : ln.split(',')).map(x => x.trim())
      const line = idx + 1
      const date = parseDate(c[0] || '')
      if (!date && idx === 0 && !parseAmount(c[1] || '') && !parseAmount(c[2] || '')) return // শিরোনামের সারি

      let amtS: string, who: string, fundS: string, extra: string
      if (kind === 'don') { who = c[1] || ''; amtS = c[2] || ''; fundS = c[3] || ''; extra = c[4] || '' }
      else { amtS = c[1] || ''; fundS = c[2] || ''; extra = c[3] || ''; who = c[4] || '' }

      const amount = parseAmount(amtS)
      const bad = (note: string) => out.push({ line, status: 'bad', note })
      if (!date) return bad('তারিখ বোঝা যায়নি (যেমন ১৫/০৩/২০২৪)')
      if (!(amount > 0)) return bad('টাকার পরিমাণ ঠিক নেই')
      if (kind === 'exp' && !who) return bad('বিবরণ নেই')

      let fund: any = null
      if (fundS) {
        fund = fundByName.get(norm(fundS))
        if (!fund) return bad('খাত "' + fundS + '" মেলেনি')
      } else if (defFund) {
        fund = funds.find((f: any) => f.id === defFund)
      }
      if (!fund) return bad('খাত নেই (ওপরে ডিফল্ট খাত বাছাই করুন)')

      const k = key(date, amount, who)
      if (seen.has(k)) {
        out.push({ line, status: 'dup', note: 'আগেই আছে, বাদ', date, amount, fundName: fund.name, who, extra })
        return
      }
      seen.add(k)
      out.push({ line, status: 'ok', note: '', date, amount, fund_id: fund.id, fundName: fund.name, who, extra })
    })
    return out
  }, [text, kind, defFund, funds, don, exp])

  const good = rows.filter(r => r.status === 'ok')
  const dups = rows.filter(r => r.status === 'dup').length
  const bads = rows.filter(r => r.status === 'bad').length
  const total = good.reduce((t, r) => t + (r.amount || 0), 0)

  async function run() {
    if (!good.length || busy) return
    if (!confirm(good.length + 'টি হিসাব (মোট ' + taka(total) + ') সংরক্ষণ করবেন?')) return
    setBusy(true); setMsg('')
    const stamp = Date.now().toString(36).toUpperCase()
    const recs = good.map((r, i) => kind === 'don'
      ? {
          receipt_no: 'OLD-' + stamp + '-' + (i + 1),
          member_id: null,
          donor_name: r.who || null,
          amount: r.amount,
          fund_id: r.fund_id,
          method: METHODS.includes(r.extra || '') ? r.extra : 'হাতে হাতে',
          trx_id: null,
          donated_on: r.date,
        }
      : {
          voucher_no: 'OV-' + stamp + '-' + (i + 1),
          amount: r.amount,
          fund_id: r.fund_id,
          category: r.extra || null,
          description: r.who,
          proof_url: null,
          spent_on: r.date,
          approved_by: member?.id || null,
        })
    let saved = 0
    for (let i = 0; i < recs.length; i += 100) {
      const { error } = await supabase.from(kind === 'don' ? 'donations' : 'expenses').insert(recs.slice(i, i + 100))
      if (error) {
        setBusy(false)
        setMsg('ব্যর্থ: ' + error.message + ' (সংরক্ষিত হয়েছে ' + saved + 'টি। আবার চাপলে বাকিগুলো যাবে, আগেরগুলো ডুপ্লিকেট হিসেবে বাদ পড়বে)')
        if (saved) onDone(false)
        return
      }
      saved += recs.slice(i, i + 100).length
    }
    setBusy(false)
    onDone(true)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold">পুরোনো হিসাব একসাথে তোলা</h3>
        <p className="text-xs text-gray-500">
          Excel বা Google Sheets থেকে সারিগুলো কপি করে নিচে বসান। প্রতিটি সারিতে একটা হিসাব।
        </p>
      </div>

      <div className="flex rounded-lg bg-gray-100 p-0.5 text-sm">
        {([['don', 'অনুদান'], ['exp', 'খরচ']] as const).map(([k, l]) => (
          <button key={k} onClick={() => { setKind(k); setText('') }}
            className="flex-1 py-1.5 rounded-md font-semibold"
            style={kind === k ? { background: '#15803d', color: '#fff' } : { color: '#6b7280' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-green-50 p-3 text-xs space-y-1">
        <p className="font-semibold text-green-800">কলামের ক্রম</p>
        <p>
          {kind === 'don'
            ? 'তারিখ | দাতার নাম | টাকা | খাত (ফাঁকা রাখা যায়) | মাধ্যম (ফাঁকা রাখা যায়)'
            : 'তারিখ | টাকা | খাত (ফাঁকা রাখা যায়) | খরচের ধরন (ফাঁকা রাখা যায়) | বিবরণ'}
        </p>
        <p className="text-gray-500">তারিখ লিখুন দিন/মাস/সাল ধরনে। বাংলা বা ইংরেজি, দুই অঙ্কই চলবে। প্রথম সারি শিরোনাম হলে নিজে বাদ যাবে।</p>
        <button className="underline text-green-700" onClick={() => setText(sample)}>নমুনা বসিয়ে দেখুন</button>
      </div>

      <select className={input} value={defFund} onChange={e => setDefFund(e.target.value)}>
        <option value="">ডিফল্ট খাত (যেসব সারিতে খাত ফাঁকা)</option>
        {funds.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>

      <textarea className={input + ' font-mono text-xs'} rows={8} value={text}
        placeholder="এখানে কপি করা সারিগুলো বসান"
        onChange={e => setText(e.target.value)} />

      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-green-50 py-2"><b className="block text-base text-green-700">{good.length}</b>তোলা হবে</div>
            <div className="rounded-lg bg-amber-50 py-2"><b className="block text-base text-amber-700">{dups}</b>আগেই আছে</div>
            <div className="rounded-lg bg-rose-50 py-2"><b className="block text-base text-rose-600">{bads}</b>ত্রুটি</div>
          </div>
          <div className="max-h-64 overflow-auto rounded-lg border divide-y text-xs">
            {rows.slice(0, 300).map(r => (
              <div key={r.line} className="flex items-center gap-2 px-2 py-1.5">
                <span className="w-6 text-gray-400 shrink-0">{r.line}</span>
                <span className="shrink-0 w-2 h-2 rounded-full"
                  style={{ background: r.status === 'ok' ? '#16a34a' : r.status === 'dup' ? '#d97706' : '#e11d48' }} />
                {r.status === 'bad' ? (
                  <span className="text-rose-600">{r.note}</span>
                ) : (
                  <>
                    <span className="shrink-0">{r.date}</span>
                    <span className="flex-1 truncate">{r.who || r.extra || r.fundName}</span>
                    <b className="shrink-0">{taka(r.amount || 0)}</b>
                    {r.status === 'dup' && <span className="text-amber-700 shrink-0">বাদ</span>}
                  </>
                )}
              </div>
            ))}
          </div>
          {rows.length > 300 && <p className="text-[11px] text-gray-400">প্রথম ৩০০টি সারি দেখানো হচ্ছে, বাকিগুলোও একইভাবে তোলা হবে।</p>}
          {bads > 0 && <p className="text-xs text-rose-600">ত্রুটির সারিগুলো তোলা হবে না। ঠিক করে আবার বসাতে পারেন।</p>}
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
          disabled={!good.length || busy} onClick={run}>
          {busy ? 'সংরক্ষণ হচ্ছে...' : good.length + 'টি সংরক্ষণ করুন (' + taka(total) + ')'}
        </button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
