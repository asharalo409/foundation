
import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const CSS = `
@keyframes lamp-float {
  0%,100% { transform: translateY(0) }
  50% { transform: translateY(-7px) }
}
@keyframes lamp-glow {
  0%,100% { opacity:.45; filter:blur(24px) }
  50% { opacity:.8; filter:blur(34px) }
}
@keyframes lamp-sway {
  0%,100% { transform:rotate(-2deg) }
  50% { transform:rotate(2deg) }
}
.cute-lamp-float {
  animation:lamp-float 4s ease-in-out infinite;
  transform-origin:center bottom;
}
.cute-lamp-sway {
  animation:lamp-sway 5s ease-in-out infinite;
  transform-origin:50% 20%;
}
.cute-lamp-glow {
  animation:lamp-glow 3s ease-in-out infinite;
}
.auth-border {
  position:relative;
  isolation:isolate;
}
.auth-border:before {
  content:"";
  position:absolute;
  inset:-1px;
  border-radius:25px;
  padding:1px;
  background:linear-gradient(
    135deg,
    rgba(134,239,172,.8),
    rgba(255,255,255,.08),
    rgba(74,222,128,.55)
  );
  -webkit-mask:linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  pointer-events:none;
}
.auth-submit {
  transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;
}
.auth-submit:hover {
  transform:translateY(-2px);
  box-shadow:0 10px 28px rgba(34,197,94,.25);
  filter:brightness(1.06);
}
.auth-submit:active {
  transform:translateY(0) scale(.99);
}
@media (prefers-reduced-motion:reduce) {
  .cute-lamp-float,.cute-lamp-sway,.cute-lamp-glow {
    animation:none!important;
  }
}
`

function Lamp({ on }: { on: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[270px]">
      <div
        className={`cute-lamp-glow absolute left-1/2 top-24 h-36 w-40 -translate-x-1/2 rounded-full ${
          on ? 'bg-emerald-300/30' : 'bg-orange-200/10'
        }`}
      />

      <svg
        viewBox="0 0 260 340"
        role="img"
        aria-label={on ? 'আলো জ্বালানো হাসিমুখের ল্যাম্প' : 'হাসিমুখের ল্যাম্প'}
        className="relative z-10 w-full drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9e8d2" />
            <stop offset="55%" stopColor="#a9c7a8" />
            <stop offset="100%" stopColor="#789d7c" />
          </linearGradient>

          <linearGradient id="light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff9c9" stopOpacity={on ? '0.55' : '0.10'} />
            <stop offset="100%" stopColor="#fff9c9" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="stand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8cdd0" />
            <stop offset="50%" stopColor="#f4f5f4" />
            <stop offset="100%" stopColor="#a6adb0" />
          </linearGradient>
        </defs>

        {on && (
          <path
            d="M50 150 L210 150 L250 290 L10 290 Z"
            fill="url(#light)"
          />
        )}

        <ellipse cx="130" cy="302" rx="58" ry="10" fill="#000" opacity=".3" />

        <g className="cute-lamp-float">
          <g className="cute-lamp-sway">
            <path
              d="M76 58 Q130 42 184 58 L207 166 Q130 188 53 166 Z"
              fill="url(#shade)"
              stroke="#e4f0df"
              strokeOpacity=".28"
              strokeWidth="2"
            />

            <ellipse cx="130" cy="165" rx="77" ry="12" fill="#fff8d8" />
            <ellipse
              cx="130"
              cy="165"
              rx="68"
              ry="7"
              fill={on ? '#fffde8' : '#d9d8bd'}
            />

            <path
              d="M92 113 Q99 106 107 113"
              fill="none"
              stroke="#20372b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <path
              d="M153 113 Q161 106 168 113"
              fill="none"
              stroke="#20372b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <path
              d="M106 129 Q130 151 154 129 Q151 151 130 151 Q109 151 106 129"
              fill="#28332b"
            />

            <ellipse cx="133" cy="143" rx="10" ry="5" fill="#f48b82" />
          </g>

          <rect x="121" y="174" width="18" height="105" rx="7" fill="url(#stand)" />
          <ellipse cx="130" cy="282" rx="48" ry="10" fill="#aeb5b6" />

          <path
            d="M82 282 Q130 298 178 282 L171 294 Q130 309 89 294 Z"
            fill="#e2e5e4"
          />

          <ellipse cx="130" cy="282" rx="48" ry="9" fill="#f5f5f0" />
        </g>

        <path
          d="M185 173 C185 193 181 202 181 218"
          fill="none"
          stroke="#d9ddda"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="181" cy="222" r="4" fill="#e6e9e5" />
      </svg>

      <p className="mt-1 text-center text-sm font-medium text-emerald-100/80">
        {on ? 'আলো জ্বলছে ✨' : 'আলো একটু কম…'}
      </p>
    </div>
  )
}

function Stage({ children }: any) {
  const [lampOn, setLampOn] = useState(true)

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-3xl bg-[#070b0a] px-4 py-8 text-white sm:px-7 md:px-9">
      <style>{CSS}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_35%,rgba(34,197,94,.13),transparent_42%),radial-gradient(ellipse_at_90%_10%,rgba(16,185,129,.10),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-4xl flex-col items-center justify-center gap-7 md:flex-row md:gap-10">
        <div className="w-full max-w-[290px] md:w-[43%]">
          <button
            type="button"
            onClick={() => setLampOn(v => !v)}
            className="w-full rounded-2xl p-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            aria-label="ল্যাম্পের আলো চালু বা বন্ধ করুন"
          >
            <Lamp on={lampOn} />
            <span className="mt-2 block text-center text-xs text-white/40">
              ল্যাম্পে ট্যাপ করে আলো বদলাও
            </span>
          </button>
        </div>

        <div className="w-full max-w-sm md:w-[57%]">
          {children}
        </div>
      </div>
    </div>
  )
}

function Glass({ children }: any) {
  return (
    <div className="auth-border rounded-[25px] bg-[#0b1211]/90 p-5 shadow-[0_0_35px_rgba(34,197,94,.14)] backdrop-blur-xl sm:p-7">
      <div className="relative z-10">{children}</div>
    </div>
  )
}

const inputCls =
  'w-full h-11 rounded-xl bg-white/[0.045] border border-white/10 focus:border-emerald-300/70 focus:bg-white/[0.07] text-white placeholder:text-white/35 outline-none transition px-3'

function Field({ icon, right, ...p }: any) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 text-white/40 pointer-events-none">
          {icon}
        </span>
      )}

      <input
        {...p}
        className={
          inputCls +
          (icon ? ' pl-10' : '') +
          (right ? ' pr-10' : '')
        }
      />

      {right}
    </div>
  )
}

function Brand({ st, title, sub }: any) {
  return (
    <div className="mb-6 space-y-1.5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-emerald-200/20 bg-emerald-300/10 shadow-[0_0_22px_rgba(34,197,94,.13)]">
        {st?.logo_url ? (
          <img
            src={st.logo_url}
            alt="সংগঠনের লোগো"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-emerald-200">
            {(st?.org_name || 'ফ').slice(0, 1)}
          </span>
        )}
      </div>

      <h1 className="bg-gradient-to-b from-white to-emerald-100/80 bg-clip-text text-xl font-bold text-transparent">
        {title}
      </h1>

      <p className="text-xs text-white/55">{sub}</p>
    </div>
  )
}

function useBrand(supabase: any) {
  const [st, setSt] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('settings')
      .select('org_name, logo_url')
      .eq('id', 1)
      .single()
      .then(({ data }: any) => setSt(data))
  }, [supabase])

  return st
}

export function Apply({ supabase, onLogin }: any) {
  const st = useBrand(supabase)

  const [f, setF] = useState({
    full_name: '',
    phone: '',
    email: '',
    blood_group: '',
    district: '',
    message: '',
  })

  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k: string, v: string) =>
    setF(prev => ({ ...prev, [k]: v }))

  async function submit(e: any) {
    e.preventDefault()
    setOk(false)
    setMsg('')

    if (
      !f.full_name.trim() ||
      !f.phone.trim() ||
      !f.email.trim()
    ) {
      setMsg('পূর্ণ নাম, মোবাইল নম্বর ও ইমেইল ঠিকানা দিন')
      return
    }

    setBusy(true)

    const { error } = await supabase
      .from('applications')
      .insert(f)

    setBusy(false)

    if (error) {
      setMsg('আবেদন জমা হয়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।')
    } else {
      setOk(true)
      setMsg('আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করলে আপনি সদস্য হবেন।')

      setF({
        full_name: '',
        phone: '',
        email: '',
        blood_group: '',
        district: '',
        message: '',
      })
    }
  }

  return (
    <Stage>
      <Glass>
        <Brand
          st={st}
          title="সদস্য হওয়ার আবেদন"
          sub={(st?.org_name || 'মানবসেবা ফাউন্ডেশন') + ' পরিবারে যুক্ত হোন'}
        />

        <form onSubmit={submit} className="space-y-3">
          <Field
            placeholder="পূর্ণ নাম *"
            value={f.full_name}
            onChange={(e: any) => set('full_name', e.target.value)}
            autoComplete="name"
            required
          />

          <Field
            placeholder="মোবাইল নম্বর *"
            value={f.phone}
            onChange={(e: any) => set('phone', e.target.value)}
            autoComplete="tel"
            required
          />

          <Field
            type="email"
            placeholder="ইমেইল ঠিকানা *"
            value={f.email}
            onChange={(e: any) => set('email', e.target.value)}
            autoComplete="email"
            required
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              className={inputCls}
              value={f.blood_group}
              onChange={e => set('blood_group', e.target.value)}
            >
              <option className="bg-[#0b1211]" value="">
                রক্তের গ্রুপ
              </option>

              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                <option className="bg-[#0b1211]" key={g}>
                  {g}
                </option>
              ))}
            </select>

            <Field
              placeholder="জেলা"
              value={f.district}
              onChange={(e: any) => set('district', e.target.value)}
            />
          </div>

          <textarea
            rows={3}
            className={inputCls + ' h-auto py-2'}
            placeholder="কেন সদস্য হতে চান?"
            value={f.message}
            onChange={e => set('message', e.target.value)}
          />

          <button
            type="submit"
            disabled={busy}
            className="auth-submit flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 font-semibold text-[#07100a] disabled:opacity-60"
          >
            {busy ? (
              'জমা হচ্ছে...'
            ) : (
              <>
                আবেদন জমা দিন
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {msg && (
            <p
              role="status"
              className={
                'text-center text-xs ' +
                (ok ? 'text-emerald-300' : 'text-rose-300')
              }
            >
              {msg}
            </p>
          )}
        </form>

        {onLogin && (
          <p className="mt-5 text-center text-xs text-white/60">
            আগে থেকেই অ্যাকাউন্ট আছে?{' '}
            <button
              type="button"
              className="font-semibold text-emerald-200 underline underline-offset-4"
              onClick={onLogin}
            >
              লগইন করুন
            </button>
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
    setMsg('')

    if (!email.trim() || !pass) {
      setMsg('ইমেইল ও পাসওয়ার্ড লিখুন')
      return
    }

    setBusy(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    })

    setBusy(false)

    if (error) {
      setMsg('লগইন ব্যর্থ: ইমেইল বা পাসওয়ার্ড ভুল, অথবা অ্যাকাউন্ট এখনো অনুমোদিত নয়')
    } else {
      onDone()
    }
  }

  async function forgot() {
    setOk(false)
    setMsg('')

    if (!email.trim()) {
      setMsg('আগে উপরে আপনার ইমেইল লিখুন')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          window.location.origin + window.location.pathname,
      }
    )

    if (error) {
      setMsg('পাসওয়ার্ড রিসেটের ইমেইল পাঠানো যায়নি। আবার চেষ্টা করুন।')
      return
    }

    setOk(true)
    setMsg('ইমেইলে লিংক পাঠানো হয়েছে। লিংক খুলে প্রোফাইল থেকে পাসওয়ার্ড পরিবর্তন করুন।')
  }

  return (
    <Stage>
      <Glass>
        <Brand
          st={st}
          title="স্বাগতম"
          sub={(st?.org_name || 'মানবসেবা ফাউন্ডেশন') + '-এ লগইন করুন'}
        />

        <form onSubmit={go} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs text-white/60">ইমেইল</span>

            <Field
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="আপনার ইমেইল ঠিকানা"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/60">পাসওয়ার্ড</span>

            <Field
              icon={<Lock className="h-4 w-4" />}
              type={show ? 'text' : 'password'}
              placeholder="আপনার পাসওয়ার্ড"
              value={pass}
              onChange={(e: any) => setPass(e.target.value)}
              autoComplete="current-password"
              required
              right={
                <button
                  type="button"
                  aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                  className="absolute right-3 text-white/45 hover:text-white"
                  onClick={() => setShow(!show)}
                >
                  {show ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              }
            />
          </label>

          <div className="text-right">
            <button
              type="button"
              className="text-xs text-white/60 underline-offset-4 hover:text-emerald-200 hover:underline"
              onClick={forgot}
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="auth-submit flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 font-semibold text-[#07100a] disabled:opacity-60"
          >
            {busy ? (
              'অপেক্ষা করুন...'
            ) : (
              <>
                লগইন করুন
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {msg && (
            <p
              role="status"
              className={
                'text-center text-xs leading-5 ' +
                (ok ? 'text-emerald-300' : 'text-rose-300')
              }
            >
              {msg}
            </p>
          )}
        </form>

        {onApply && (
          <p className="mt-5 text-center text-xs text-white/60">
            নতুন সদস্য?{' '}
            <button
              type="button"
              className="font-semibold text-emerald-200 underline underline-offset-4"
              onClick={onApply}
            >
              সদস্য হওয়ার আবেদন করুন
            </button>
          </p>
        )}

        <p className="mt-5 border-t border-white/10 pt-4 text-center text-[11px] text-white/35">
          নতুন সদস্যের প্রবেশ অ্যাডমিন অনুমোদনের পর
        </p>
      </Glass>
    </Stage>
  )
}
