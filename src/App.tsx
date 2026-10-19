import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const CSS = `
@keyframes lb-x1{from{transform:translateX(-100%)}to{transform:translateX(200%)}}
@keyframes lb-y1{from{transform:translateY(-100%)}to{transform:translateY(200%)}}
@keyframes lb-x2{from{transform:translateX(200%)}to{transform:translateX(-200%)}}
@keyframes lb-y2{from{transform:translateY(200%)}to{transform:translateY(-200%)}}
@keyframes lb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes lp-pull{0%{transform:translateY(0)}35%{transform:translateY(14px)}100%{transform:translateY(0)}}
@keyframes lp-sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
.lb{position:absolute;animation-duration:3.4s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;filter:blur(1px)}
.lb-t{top:0;left:0;height:3px;width:50%;background:linear-gradient(90deg,transparent,#fff,transparent);animation-name:lb-x1}
.lb-r{top:0;right:0;width:3px;height:50%;background:linear-gradient(180deg,transparent,#fff,transparent);animation-name:lb-y1;animation-delay:.85s}
.lb-b{bottom:0;right:0;height:3px;width:50%;background:linear-gradient(90deg,transparent,#fff,transparent);animation-name:lb-x2;animation-delay:1.7s}
.lb-l{bottom:0;left:0;width:3px;height:50%;background:linear-gradient(180deg,transparent,#fff,transparent);animation-name:lb-y2;animation-delay:2.55s}
.lb-logo{animation:lb-float 4s ease-in-out infinite}
.lp-cord{transform-origin:118px 84px;animation:lp-sway 3.6s ease-in-out infinite}
.lp-cord.pull{animation:lp-pull .45s ease}
.lp-fade{transition:opacity .6s ease, fill .6s ease}
@media (prefers-reduced-motion:reduce){.lb,.lb-logo,.lp-cord,.lp-cord.pull{animation:none}}
`

function CuteLamp({ isOn, onToggle, shy }: { isOn: boolean; onToggle: () => void; shy?: boolean }) {
  const [pull, setPull] = useState(false)

  const toggle = () => {
    setPull(true)
    onToggle()
    setTimeout(() => setPull(false), 450)
  }

  const shade = isOn ? '#7fb08a' : '#3f5547'
  const eyesClosed = !isOn || shy

  return (
    <div className="flex flex-col items-center justify-center select-none shrink-0 mb-2">
      <svg viewBox="0 0 160 205" width="180" height="230" role="img" aria-label="Cute Lamp">
        <defs>
          <linearGradient id="lp-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9f99d" stopOpacity=".5" />
            <stop offset="1" stopColor="#d9f99d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lp-pole" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#cbd5e1" />
            <stop offset=".5" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* আলোর শঙ্কু (Light Cone) */}
        <polygon
          points="46,86 114,86 150,200 10,200"
          fill="url(#lp-cone)"
          className="lp-fade"
          style={{ opacity: isOn ? 1 : 0 }}
        />

        {/* স্ট্যান্ড ও বেস */}
        <rect x="76" y="92" width="8" height="84" rx="3" fill="url(#lp-pole)" />
        <ellipse cx="80" cy="180" rx="30" ry="8" fill="#94a3b8" />
        <ellipse cx="80" cy="177" rx="30" ry="8" fill="#e2e8f0" />

        {/* ল্যাম্প শেড */}
        <path d="M52 30 H108 L124 86 H36 Z" fill={shade} className="lp-fade" />
        <ellipse cx="80" cy="86" rx="44" ry="6" fill={isOn ? '#fef9c3' : '#1f2a24'} className="lp-fade" />

        {/* চোখ ও অভিব্যক্তি */}
        {eyesClosed ? (
          <g fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round">
            {shy ? (
              <>
                <path d="M58 52 q6 6 12 0" />
                <path d="M90 52 q6 6 12 0" />
              </>
            ) : (
              <>
                <path d="M58 54 h12" />
                <path d="M90 54 h12" />
              </>
            )}
          </g>
        ) : (
          <g fill="#0f172a">
            <ellipse cx="64" cy="52" rx="4" ry="5" />
            <ellipse cx="96" cy="52" rx="4" ry="5" />
            <circle cx="65.5" cy="50" r="1.4" fill="#fff" />
            <circle cx="97.5" cy="50" r="1.4" fill="#fff" />
          </g>
        )}

        {/* লজ্জা পেলে গালের ব্লাশ */}
        {shy && isOn && (
          <g fill="#f87171" opacity=".55">
            <ellipse cx="56" cy="62" rx="6" ry="3.5" />
            <ellipse cx="104" cy="62" rx="6" ry="3.5" />
          </g>
        )}

        {/* মুখভঙ্গি */}
        {isOn ? (
          <g>
            <path d="M68 62 q12 14 24 0 z" fill="#0f172a" />
            <path d="M74 68 q6 7 12 0 q-6 -3 -12 0 z" fill="#fb7185" />
          </g>
        ) : (
          <path d="M72 66 q8 4 16 0" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
        )}

        {/* সুইচ দড়ি (Cord) */}
        <g className={'lp-cord' + (pull ? ' pull' : '')} style={{ cursor: 'pointer' }} onClick={toggle}>
          <line x1="118" y1="86" x2="118" y2="126" stroke="#cbd5e1" strokeWidth="1.6" />
          <circle cx="118" cy="130" r="5.5" fill="#f8fafc" stroke="#94a3b8" />
          <rect x="104" y="90" width="28" height="48" fill="transparent" />
        </g>
      </svg>
      <span className="text-[11px] text-white/40 -mt-2">দড়িতে চাপ দিয়ে আলো নিয়ন্ত্রণ করুন</span>
    </div>
  )
}

function Stage({ children, isOn }: { children: any; isOn: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-4 py-8 flex items-center justify-center min-h-[640px] transition-colors duration-700"
      style={{
        background: isOn
          ? 'radial-gradient(120% 70% at 50% 8%, #123524 0%, #0a1510 55%, #060b09 100%)'
          : '#060a0d',
      }}
    >
      <style>{CSS}</style>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  )
}

function Glass({ children, isOn }: { children: any; isOn: boolean }) {
  const glow = isOn ? '#4ade80' : '#334155'
  return (
    <div className="relative">
      <div
        className="relative bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden text-white transition-all duration-500"
        style={{
          boxShadow: isOn
            ? `0 0 0 1px ${glow}80, 0 0 28px ${glow}55, 0 10px 40px rgba(0,0,0,.5)`
            : '0 0 0 1px #33415580, 0 10px 40px rgba(0,0,0,.6)',
          filter: isOn ? 'none' : 'brightness(.75)',
        }}
      >
        {children}
      </div>
      <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
        <div className="lb lb-t" />
        <div className="lb lb-r" />
        <div className="lb lb-b" />
        <div className="lb lb-l" />
      </div>
    </div>
  )
}

const inputCls =
  'w-full h-11 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 text-white placeholder:text-white/30 outline-none transition'

function Field({ icon, right, ...p }: any) {
  return (
    <div className="relative flex items-center">
      {icon && <span className="absolute left-3 text-white/40 pointer-events-none">{icon}</span>}
      <input {...p} className={inputCls + (icon ? ' pl-10' : ' px-3') + (right ? ' pr-10' : ' pr-3')} />
      {right}
    </div>
  )
}

function Brand({ st, title, sub }: any) {
  return (
    <div className="text-center space-y-1 mb-5">
      <div className="lb-logo mx-auto w-14 h-14 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-white/5">
        {st?.logo_url ? (
          <img src={st.logo_url} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold">{(st?.org_name || 'ফ').slice(0, 1)}</span>
        )}
      </div>
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">{title}</h1>
      <p className="text-white/60 text-xs">{sub}</p>
    </div>
  )
}

function useBrand(supabase: any) {
  const [st, setSt] = useState<any>(null)
  useEffect(() => {
    supabase.from('settings').select('org_name, logo_url').eq('id', 1).single()
      .then(({ data }: any) => setSt(data))
  }, [])
  return st
}

export function Apply({ supabase, onLogin }: any) {
  const st = useBrand(supabase)
  const [isOn, setIsOn] = useState(true)
  const [f, setF] = useState({
    full_name: '', phone: '', email: '', blood_group: '', district: '', message: '',
  })
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function submit(e: any) {
    e.preventDefault()
    setOk(false)
    if (!f.full_name || !f.phone) { setMsg('নাম ও মোবাইল নম্বর দিন'); return }
    setBusy(true)
    const { error } = await supabase.from('applications').insert(f)
    setBusy(false)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else {
      setOk(true)
      setMsg('আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করলে আপনি সদস্য হবেন।')
      setF({ full_name: '', phone: '', email: '', blood_group: '', district: '', message: '' })
    }
  }

  return (
    <Stage isOn={isOn}>
      <CuteLamp isOn={isOn} onToggle={() => setIsOn(o => !o)} />
      <Glass isOn={isOn}>
        <Brand st={st} title="সদস্য হওয়ার আবেদন" sub={(st?.org_name || '') + ' পরিবারে যুক্ত হোন'} />
        <form onSubmit={submit} className="space-y-3">
          <Field placeholder="পূর্ণ নাম *" value={f.full_name} onChange={(e: any) => set('full_name', e.target.value)} />
          <Field placeholder="মোবাইল নম্বর *" value={f.phone} onChange={(e: any) => set('phone', e.target.value)} />
          <Field type="email" placeholder="ইমেইল (ঐচ্ছিক)" value={f.email} onChange={(e: any) => set('email', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select className={inputCls + ' px-3'} value={f.blood_group}
              onChange={e => set('blood_group', e.target.value)}>
              <option value="">রক্তের গ্রুপ</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
            </select>
            <Field placeholder="জেলা" value={f.district} onChange={(e: any) => set('district', e.target.value)} />
          </div>
          <textarea rows={3} className={inputCls + ' px-3 py-2 h-auto'} placeholder="কেন সদস্য হতে চান?"
            value={f.message} onChange={e => set('message', e.target.value)} />
          <button type="submit" disabled={busy}
            className="w-full bg-white text-black font-semibold h-11 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60">
            {busy ? 'জমা হচ্ছে...' : <>আবেদন জমা দিন <ArrowRight className="w-4 h-4" /></>}
          </button>
          {msg && <p className={'text-xs text-center ' + (ok ? 'text-green-300' : 'text-red-300')}>{msg}</p>}
        </form>
        {onLogin && (
          <p className="text-center text-xs text-white/60 mt-4">
            আগে থেকেই সদস্য?{' '}
            <button className="text-white font-semibold underline" onClick={onLogin}>লগইন করুন</button>
          </p>
        )}
      </Glass>
    </Stage>
  )
}

export function Login({ supabase, onDone, onApply }: any) {
  const st = useBrand(supabase)
  const [isOn, setIsOn] = useState(true)
  const [shy, setShy] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  async function go(e: any) {
    e.preventDefault()
    setOk(false)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass })
    setBusy(false)
    if (error) setMsg('লগইন ব্যর্থ: ইমেইল বা পাসওয়ার্ড ভুল')
    else onDone()
  }

  async function forgot() {
    setOk(false)
    if (!email.trim()) { setMsg('আগে উপরে আপনার ইমেইল লিখুন'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname,
    })
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setOk(true)
    setMsg('ইমেইলে লিংক পাঠানো হয়েছে। লিংকে ট্যাপ করলে ঢুকে যাবেন, তারপর প্রোফাইল → পাসওয়ার্ড পরিবর্তন করুন।')
  }

  return (
    <Stage isOn={isOn}>
      <CuteLamp isOn={isOn} onToggle={() => setIsOn(o => !o)} shy={shy} />
      <Glass isOn={isOn}>
        <Brand st={st} title="স্বাগতম" sub={(st?.org_name || '') + '-এ লগইন করুন'} />
        <form onSubmit={go} className="space-y-3">
          <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="ইমেইল ঠিকানা"
            value={email} onChange={(e: any) => setEmail(e.target.value)} autoComplete="email" />
          <Field icon={<Lock className="w-4 h-4" />} type={show ? 'text' : 'password'} placeholder="পাসওয়ার্ড"
            value={pass} onChange={(e: any) => setPass(e.target.value)} autoComplete="current-password"
            onFocus={() => setShy(true)}
            onBlur={() => setShy(false)}
            right={
              <button type="button" className="absolute right-3 text-white/40" onClick={() => setShow(!show)}>
                {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            } />
          <div className="text-right">
            <button type="button" className="text-xs text-white/60 hover:text-white" onClick={forgot}>
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>
          <button type="submit" disabled={busy}
            className="w-full bg-white text-black font-semibold h-11 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60">
            {busy ? 'অপেক্ষা করুন...' : <>লগইন <ArrowRight className="w-4 h-4" /></>}
          </button>
          {msg && <p className={'text-xs text-center ' + (ok ? 'text-green-300' : 'text-red-300')}>{msg}</p>}
        </form>
        {onApply && (
          <p className="text-center text-xs text-white/60 mt-5">
            সদস্য নন?{' '}
            <button className="text-white font-semibold underline" onClick={onApply}>সদস্য হওয়ার আবেদন করুন</button>
          </p>
        )}
      </Glass>
    </Stage>
  )
}
