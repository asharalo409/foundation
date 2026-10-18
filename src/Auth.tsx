import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

// কিউট ল্যাম্প SVG কম্পোনেন্ট (ইন্টারেক্টিভ সুতো/কর্ড সহ)
function CuteLamp({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  const [pulling, setPulling] = useState(false)

  const handlePull = () => {
    setPulling(true)
    setTimeout(() => setPulling(false), 200)
    onToggle()
  }

  return (
    <div className="relative flex flex-col items-center select-none w-48 sm:w-56 shrink-0 my-4 sm:my-0">
      {/* ল্যাম্পের আলোর বিম (Light Beam) */}
      <div
        className={`absolute top-28 w-44 sm:w-52 h-64 pointer-events-none transition-all duration-500 origin-top ${
          isOn
            ? 'opacity-100 scale-y-100'
            : 'opacity-0 scale-y-75'
        }`}
        style={{
          background: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
          backgroundGradient: 'linear-gradient(to bottom, rgba(74, 222, 128, 0.45), rgba(74, 222, 128, 0.02))',
          backgroundColor: 'rgba(74, 222, 128, 0.18)',
          filter: 'blur(10px)',
        }}
      />

      <svg viewBox="0 0 200 240" className="w-full h-auto drop-shadow-2xl z-10 overflow-visible">
        {/* ল্যাম্পের শেড (Head / Shade) */}
        <defs>
          <linearGradient id="shadeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isOn ? '#4ade80' : '#334155'} />
            <stop offset="50%" stopColor={isOn ? '#22c55e' : '#1e293b'} />
            <stop offset="100%" stopColor={isOn ? '#16a34a' : '#0f172a'} />
          </linearGradient>
        </defs>

        <path
          d="M 50 110 L 65 30 L 135 30 L 150 110 Z"
          fill="url(#shadeGrad)"
          rx="5"
          className="transition-colors duration-500"
        />

        {/* নিচের বাল্ব প্যানেল */}
        <ellipse
          cx="100"
          cy="110"
          rx="50"
          ry="14"
          fill={isOn ? '#fef08a' : '#0f172a'}
          className="transition-colors duration-500"
        />

        {/* কিউট ফেস (চোখ এবং মুখ) */}
        {isOn ? (
          // হাসিমুখ ও খোলা চোখ (On State)
          <g className="transition-all duration-300">
            <ellipse cx="80" cy="70" rx="3.5" ry="5" fill="#0f172a" />
            <ellipse cx="120" cy="70" rx="3.5" ry="5" fill="#0f172a" />
            {/* জিভসহ হাসিমুখ */}
            <path d="M 88 78 Q 100 95 112 78 Z" fill="#0f172a" />
            <path d="M 94 84 Q 100 95 106 84 Z" fill="#f87171" />
            {/* ব্লাশ */}
            <circle cx="73" cy="77" r="4" fill="#fb7185" opacity="0.6" />
            <circle cx="127" cy="77" r="4" fill="#fb7185" opacity="0.6" />
          </g>
        ) : (
          // ঘুমন্ত/শান্ত চোখ (Off State)
          <g className="transition-all duration-300">
            <path d="M 76 72 Q 80 67 84 72" stroke="#64748b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 116 72 Q 120 67 124 72" stroke="#64748b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 93 82 Q 100 86 107 82" stroke="#64748b" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* ল্যাম্প স্ট্যান্ড ও বেস */}
        <rect x="96" y="110" width="8" height="95" fill="#94a3b8" rx="2" />
        <ellipse cx="100" cy="208" rx="36" ry="10" fill="#64748b" />
        <ellipse cx="100" cy="205" rx="32" ry="8" fill="#cbd5e1" />

        {/* টানার সুতো / Cord (ক্লিকযোগ্য সুইচ) */}
        <g
          onClick={handlePull}
          className="cursor-pointer group"
          style={{
            transform: pulling ? 'translateY(8px)' : 'translateY(0)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <line
            x1="70"
            y1="110"
            x2="70"
            y2={pulling ? 150 : 140}
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeDasharray="2,2"
          />
          <circle
            cx="70"
            cy={pulling ? 150 : 140}
            r="6"
            fill={isOn ? '#fbbf24' : '#94a3b8'}
            className="group-hover:scale-125 transition-transform"
          />
        </g>
      </svg>
      <span className="text-[11px] text-white/40 mt-1">সুতোয় ক্লিক করে আলো জ্বালান/নেভান</span>
    </div>
  )
}

function Stage({ children, isOn }: { children: any; isOn: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#090d16] px-4 py-8 sm:py-12 flex items-center justify-center min-h-[660px] transition-colors duration-700">
      {/* ব্যাকগ্রাউন্ড অম্বিয়েন্ট গ্লো */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isOn ? 'opacity-100' : 'opacity-15'
        }`}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[90%] h-[70%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/10 blur-[90px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
        {children}
      </div>
    </div>
  )
}

function LampCard({ children, isOn }: { children: any; isOn: boolean }) {
  return (
    <div
      className={`relative w-full max-w-sm rounded-2xl p-6 sm:p-7 transition-all duration-500 border ${
        isOn
          ? 'bg-[#111827]/80 border-emerald-500/40 shadow-[0_0_40px_rgba(34,197,94,0.18)]'
          : 'bg-[#0f172a]/50 border-white/5 shadow-none'
      } backdrop-blur-xl text-white`}
    >
      {children}
    </div>
  )
}

const inputCls =
  'w-full h-11 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 text-white placeholder:text-white/30 outline-none transition'

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
      <div className="mx-auto w-12 h-12 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-white/5 mb-2">
        {st?.logo_url ? (
          <img src={st.logo_url} className="w-full h-full object-cover" alt="Logo" />
        ) : (
          <span className="text-lg font-bold">{(st?.org_name || 'ফ').slice(0, 1)}</span>
        )}
      </div>
      <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
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

export function Login({ supabase, onDone, onApply }: any) {
  const st = useBrand(supabase)
  const [isOn, setIsOn] = useState(true)
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
      {/* বাম পাশের কিউট ল্যাম্প */}
      <CuteLamp isOn={isOn} onToggle={() => setIsOn(!isOn)} />

      {/* ডান পাশের লগইন কার্ড */}
      <LampCard isOn={isOn}>
        <Brand st={st} title="Welcome Back" sub={(st?.org_name || '') + '-এ লগইন করুন'} />
        <form onSubmit={go} className="space-y-3">
          <div>
            <label className="block text-[11px] text-white/50 mb-1 font-medium">Username / Email</label>
            <Field
              icon={<Mail className="w-4 h-4" />}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/50 mb-1 font-medium">Password</label>
            <Field
              icon={<Lock className="w-4 h-4" />}
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              value={pass}
              onChange={(e: any) => setPass(e.target.value)}
              autoComplete="current-password"
              right={
                <button type="button" className="absolute right-3 text-white/40 hover:text-white" onClick={() => setShow(!show)}>
                  {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-xs text-white/50 hover:text-emerald-400 transition" onClick={forgot}>
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`w-full font-semibold h-11 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-60 shadow-lg ${
              isOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                : 'bg-slate-700 hover:bg-slate-600 text-white/70 shadow-none'
            }`}
          >
            {busy ? 'অপেক্ষা করুন...' : <>Login <ArrowRight className="w-4 h-4" /></>}
          </button>
          {msg && <p className={'text-xs text-center ' + (ok ? 'text-green-300' : 'text-red-300')}>{msg}</p>}
        </form>

        {onApply && (
          <p className="text-center text-xs text-white/50 mt-5">
            সদস্য নন?{' '}
            <button className="text-emerald-400 font-semibold underline hover:text-emerald-300" onClick={onApply}>
              সদস্য হওয়ার আবেদন করুন
            </button>
          </p>
        )}
      </LampCard>
    </Stage>
  )
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
      <CuteLamp isOn={isOn} onToggle={() => setIsOn(!isOn)} />
      <LampCard isOn={isOn}>
        <Brand st={st} title="সদস্য হওয়ার আবেদন" sub={(st?.org_name || '') + ' পরিবারে যুক্ত হোন'} />
        <form onSubmit={submit} className="space-y-3">
          <Field placeholder="পূর্ণ নাম *" value={f.full_name} onChange={(e: any) => set('full_name', e.target.value)} />
          <Field placeholder="মোবাইল নম্বর *" value={f.phone} onChange={(e: any) => set('phone', e.target.value)} />
          <Field type="email" placeholder="ইমেইল (ঐচ্ছিক)" value={f.email} onChange={(e: any) => set('email', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select
              className={inputCls + ' px-3'}
              value={f.blood_group}
              onChange={e => set('blood_group', e.target.value)}
            >
              <option value="" className="bg-slate-900">রক্তের গ্রুপ</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                <option key={g} value={g} className="bg-slate-900">{g}</option>
              ))}
            </select>
            <Field placeholder="জেলা" value={f.district} onChange={(e: any) => set('district', e.target.value)} />
          </div>
          <textarea
            rows={2}
            className={inputCls + ' px-3 py-2 h-auto'}
            placeholder="কেন সদস্য হতে চান?"
            value={f.message}
            onChange={e => set('message', e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className={`w-full font-semibold h-11 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-60 shadow-lg ${
              isOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                : 'bg-slate-700 hover:bg-slate-600 text-white/70 shadow-none'
            }`}
          >
            {busy ? 'জমা হচ্ছে...' : <>আবেদন জমা দিন <ArrowRight className="w-4 h-4" /></>}
          </button>
          {msg && <p className={'text-xs text-center ' + (ok ? 'text-green-300' : 'text-red-300')}>{msg}</p>}
        </form>
        {onLogin && (
          <p className="text-center text-xs text-white/50 mt-4">
            আগে থেকেই সদস্য?{' '}
            <button className="text-emerald-400 font-semibold underline hover:text-emerald-300" onClick={onLogin}>
              লগইন করুন
            </button>
          </p>
        )}
      </LampCard>
    </Stage>
  )
}
