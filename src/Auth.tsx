import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const CSS = `
@keyframes lb-x1{from{transform:translateX(-100%)}to{transform:translateX(200%)}}
@keyframes lb-y1{from{transform:translateY(-100%)}to{transform:translateY(200%)}}
@keyframes lb-x2{from{transform:translateX(200%)}to{transform:translateX(-200%)}}
@keyframes lb-y2{from{transform:translateY(200%)}to{transform:translateY(-200%)}}
@keyframes lb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.lb{position:absolute;animation-duration:3.4s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;filter:blur(1px)}
.lb-t{top:0;left:0;height:3px;width:50%;background:linear-gradient(90deg,transparent,#fff,transparent);animation-name:lb-x1}
.lb-r{top:0;right:0;width:3px;height:50%;background:linear-gradient(180deg,transparent,#fff,transparent);animation-name:lb-y1;animation-delay:.85s}
.lb-b{bottom:0;right:0;height:3px;width:50%;background:linear-gradient(90deg,transparent,#fff,transparent);animation-name:lb-x2;animation-delay:1.7s}
.lb-l{bottom:0;left:0;width:3px;height:50%;background:linear-gradient(180deg,transparent,#fff,transparent);animation-name:lb-y2;animation-delay:2.55s}
.lb-logo{animation:lb-float 4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.lb,.lb-logo{animation:none}}
`

function Stage({ children }: any) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-black px-4 py-8 flex items-center justify-center min-h-[620px]">
      <style>{CSS}</style>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[60%] rounded-t-full bg-purple-400/20 blur-[60px] animate-pulse" />
      <div className="absolute left-0 top-1/4 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  )
}

function Glass({ children }: any) {
  return (
    <div className="relative">
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden text-white">
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
          <span className="text-xl font-bold">{(st?.org_name || '💚').slice(0, 1)}</span>
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
      setMsg('✅ আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করলে আপনি সদস্য হবেন।')
      setF({ full_name: '', phone: '', email: '', blood_group: '', district: '', message: '' })
    }
  }

  return (
    <Stage>
      <Glass>
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
    setMsg('✅ ইমেইলে লিংক পাঠানো হয়েছে। লিংকে ট্যাপ করলে ঢুকে যাবেন, তারপর প্রোফাইল → পাসওয়ার্ড পরিবর্তন করুন।')
  }

  return (
    <Stage>
      <Glass>
        <Brand st={st} title="স্বাগতম" sub={(st?.org_name || '') + '-এ লগইন করুন'} />
        <form onSubmit={go} className="space-y-3">
          <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="ইমেইল ঠিকানা"
            value={email} onChange={(e: any) => setEmail(e.target.value)} autoComplete="email" />
          <Field icon={<Lock className="w-4 h-4" />} type={show ? 'text' : 'password'} placeholder="পাসওয়ার্ড"
            value={pass} onChange={(e: any) => setPass(e.target.value)} autoComplete="current-password"
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
