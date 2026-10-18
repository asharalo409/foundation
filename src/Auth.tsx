
import React, { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthProps = {
  supabase: SupabaseClient;
  onLogin?: () => void;
};

type BrandInfo = {
  org_name?: string;
  logo_url?: string;
};

const defaults: BrandInfo = {
  org_name: "মানবসেবা ফাউন্ডেশন",
  logo_url: "",
};

export function useBrand(supabase: SupabaseClient) {
  const [brand, setBrand] = useState<BrandInfo>(defaults);

  useEffect(() => {
    let active = true;

    async function loadBrand() {
      const { data } = await supabase
        .from("settings")
        .select("org_name, logo_url")
        .limit(1)
        .maybeSingle();

      if (active && data) {
        setBrand({
          org_name: data.org_name || defaults.org_name,
          logo_url: data.logo_url || "",
        });
      }
    }

    loadBrand().catch(() => {});
    return () => {
      active = false;
    };
  }, [supabase]);

  return brand;
}

export function Stage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="lamp-auth-stage">{children}</main>;
}

export function Glass({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="lamp-auth-glass">{children}</section>;
}

export function Brand({
  brand,
}: {
  brand: BrandInfo;
}) {
  return (
    <div className="lamp-auth-brand">
      {brand.logo_url ? (
        <img src={brand.logo_url} alt="" />
      ) : (
        <span className="lamp-auth-brand-mark">
          {(brand.org_name || "A").slice(0, 1)}
        </span>
      )}
      <span>{brand.org_name}</span>
    </div>
  );
}

export function Login({
  supabase,
  onLogin,
  brand,
  onApply,
}: AuthProps & {
  brand?: BrandInfo;
  onApply?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      onLogin?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "লগইন করা যায়নি।"
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage("আগে ইমেইল ঠিকানা লিখুন।");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin }
      );

      if (error) throw error;
      setMessage("পাসওয়ার্ড রিসেটের নির্দেশনা ইমেইলে পাঠানো হয়েছে।");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "অনুরোধ সম্পন্ন হয়নি।"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Glass>
      {brand && <Brand brand={brand} />}

      <h1>স্বাগতম</h1>
      <p className="lamp-auth-subtitle">আপনার অ্যাকাউন্টে লগইন করুন</p>

      <form onSubmit={submit} className="lamp-auth-form">
        <label htmlFor="lamp-login-email">ইমেইল ঠিকানা</label>
        <input
          id="lamp-login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="আপনার ইমেইল লিখুন"
          required
        />

        <label htmlFor="lamp-login-password">পাসওয়ার্ড</label>
        <div className="lamp-auth-password">
          <input
            id="lamp-login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড লিখুন"
            required
          />
          <button
            type="button"
            className="lamp-auth-text-button"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "লুকান" : "দেখুন"}
          </button>
        </div>

        <button
          type="button"
          className="lamp-auth-forgot"
          onClick={resetPassword}
          disabled={busy}
        >
          পাসওয়ার্ড ভুলে গেছেন?
        </button>

        {message && (
          <p className="lamp-auth-message" role="status">
            {message}
          </p>
        )}

        <button className="lamp-auth-submit" disabled={busy} type="submit">
          {busy ? "অপেক্ষা করুন..." : "লগইন করুন"}
        </button>
      </form>

      <p className="lamp-auth-switch">
        নতুন সদস্য?{" "}
        <button type="button" onClick={onApply}>
          আবেদন করুন
        </button>
      </p>
    </Glass>
  );
}

export function Apply({
  supabase,
  brand,
  onLogin,
}: AuthProps & {
  brand?: BrandInfo;
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    blood_group: "",
    district: "",
    message: "",
  });

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  function update(
    key: keyof typeof form,
    value: string
  ) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult("");

    try {
      const { error } = await supabase.from("applications").insert({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        blood_group: form.blood_group || null,
        district: form.district.trim() || null,
        message: form.message.trim() || null,
      });

      if (error) throw error;

      setResult(
        "আপনার আবেদন জমা হয়েছে। অ্যাডমিন যাচাই ও অনুমোদন করলে পরবর্তী নির্দেশনা পাবেন।"
      );

      setForm({
        full_name: "",
        phone: "",
        email: "",
        blood_group: "",
        district: "",
        message: "",
      });
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "আবেদন জমা দেওয়া যায়নি।"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Glass>
      {brand && <Brand brand={brand} />}

      <h1>সদস্য হওয়ার আবেদন</h1>
      <p className="lamp-auth-subtitle">
        প্রয়োজনীয় তথ্য দিয়ে আবেদন জমা দিন
      </p>

      <form onSubmit={submit} className="lamp-auth-form">
        <label htmlFor="lamp-full-name">পূর্ণ নাম</label>
        <input
          id="lamp-full-name"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          placeholder="আপনার নাম"
          autoComplete="name"
          required
        />

        <label htmlFor="lamp-phone">মোবাইল নম্বর</label>
        <input
          id="lamp-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="মোবাইল নম্বর"
          autoComplete="tel"
          required
        />

        <label htmlFor="lamp-apply-email">ইমেইল ঠিকানা</label>
        <input
          id="lamp-apply-email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="আপনার ইমেইল"
          autoComplete="email"
          required
        />

        <label htmlFor="lamp-blood">রক্তের গ্রুপ</label>
        <select
          id="lamp-blood"
          value={form.blood_group}
          onChange={(e) => update("blood_group", e.target.value)}
        >
          <option value="">নির্বাচন করুন</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
            (group) => (
              <option key={group} value={group}>
                {group}
              </option>
            )
          )}
        </select>

        <label htmlFor="lamp-district">জেলা</label>
        <input
          id="lamp-district"
          value={form.district}
          onChange={(e) => update("district", e.target.value)}
          placeholder="আপনার জেলা"
        />

        <label htmlFor="lamp-message">আবেদনের কারণ বা বার্তা</label>
        <textarea
          id="lamp-message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="আপনার সম্পর্কে সংক্ষেপে লিখুন"
          rows={3}
        />

        {result && (
          <p className="lamp-auth-message" role="status">
            {result}
          </p>
        )}

        <button className="lamp-auth-submit" disabled={busy} type="submit">
          {busy ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
        </button>
      </form>

      <p className="lamp-auth-switch">
        আগে থেকেই সদস্য?{" "}
        <button type="button" onClick={onLogin}>
          লগইন করুন
        </button>
      </p>
    </Glass>
  );
}

export default function Auth({ supabase, onLogin }: AuthProps) {
  const [lampOn, setLampOn] = useState(false);
  const [mode, setMode] = useState<"login" | "apply">("login");
  const brand = useBrand(supabase);

  function pullLamp() {
    setLampOn((previous) => {
      if (!previous) {
        return true;
      }
      return false;
    });
  }

  const style = {
    "--lamp-glow": lampOn ? "rgba(255, 196, 93, 0.22)" : "transparent",
  } as CSSProperties;

  return (
    <Stage>
      <style>{`
        .lamp-auth-stage {
          min-height: 100vh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          color: #f7f3ec;
          background:
            radial-gradient(ellipse at 50% 0%, #30334a 0%, transparent 55%),
            linear-gradient(145deg, #11131f, #191725 58%, #0b0c13);
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        .lamp-auth-stage *,
        .lamp-auth-stage *::before,
        .lamp-auth-stage *::after {
          box-sizing: border-box;
        }

        .lamp-auth-stage button,
        .lamp-auth-stage input,
        .lamp-auth-stage select,
        .lamp-auth-stage textarea {
          font: inherit;
        }

        .lamp-auth-stage button {
          cursor: pointer;
        }

        .lamp-auth-stage button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .lamp-auth-stage .lamp-auth-layout {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lamp-auth-stage .lamp-auth-light {
          position: absolute;
          top: 0;
          left: 50%;
          width: min(100vw, 540px);
          height: 470px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, var(--lamp-glow), transparent 68%);
          pointer-events: none;
          transition: background .8s ease;
          z-index: -1;
        }

        .lamp-auth-stage .lamp-auth-lamp {
          position: relative;
          height: 205px;
          width: 210px;
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 15px;
          z-index: 2;
        }

        .lamp-auth-stage .lamp-auth-wire {
          width: 3px;
          height: 43px;
          background: linear-gradient(90deg, #666, #e0c79a, #555);
          border-radius: 3px;
        }

        .lamp-auth-stage .lamp-auth-shade {
          width: 116px;
          height: 60px;
          margin-top: -1px;
          position: relative;
          border-radius: 62px 62px 14px 14px;
          background: linear-gradient(100deg, #a66d31, #f3cf91 45%, #b47a39);
          clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, .4));
        }

        .lamp-auth-stage .lamp-auth-shade::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: #f7d9a1;
        }

        .lamp-auth-stage .lamp-auth-bulb {
          position: absolute;
          top: 87px;
          left: 50%;
          width: 23px;
          height: 23px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: #77716a;
          transition: all .45s ease;
        }

        .lamp-auth-stage.lamp-on .lamp-auth-bulb {
          background: #fff4c4;
          box-shadow: 0 0 18px 8px #ffd982, 0 0 65px 30px #ffc45d;
        }

        .lamp-auth-stage .lamp-auth-stem {
          height: 22px;
          width: 9px;
          background: linear-gradient(90deg, #7b5b37, #ead1a4, #79542c);
        }

        .lamp-auth-stage .lamp-auth-base {
          width: 65px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(#d7b477, #79552e);
        }

        .lamp-auth-stage .lamp-auth-cord {
          position: absolute;
          top: 101px;
          right: 26px;
          height: 66px;
          width: 35px;
          border: 0;
          padding: 0;
          background: transparent;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 4;
          touch-action: manipulation;
        }

        .lamp-auth-stage .lamp-auth-cord::before {
          content: "";
          position: absolute;
          top: 0;
          width: 2px;
          height: 49px;
          background: #e3c18b;
          transform-origin: top;
          transition: transform .25s ease;
        }

        .lamp-auth-stage .lamp-auth-cord:hover::before {
          transform: rotate(-9deg);
        }

        .lamp-auth-stage .lamp-auth-cord span {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 16px;
          border-radius: 5px;
          background: linear-gradient(90deg, #956c37, #f0d19a, #9a713d);
        }

        .lamp-auth-stage .lamp-auth-hint {
          position: absolute;
          top: 174px;
          margin: 0;
          color: #c2b49d;
          font-size: 9px;
          letter-spacing: 3px;
          white-space: nowrap;
        }

        .lamp-auth-stage .lamp-auth-glass {
          width: 100%;
          padding: 30px 25px;
          border: 1px solid rgba(255, 255, 255, .12);
          border-radius: 22px;
          background: rgba(24, 24, 38, .83);
          box-shadow: 0 24px 80px rgba(0, 0, 0, .3);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          animation: lampAuthEnter .45s ease both;
        }

        .lamp-auth-stage .lamp-auth-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 22px;
          color: #f2d5a3;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
        }

        .lamp-auth-stage .lamp-auth-brand img,
        .lamp-auth-stage .lamp-auth-brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          object-fit: cover;
          display: grid;
          place-items: center;
          background: #55432d;
          color: #ffe5b7;
        }

        .lamp-auth-stage .lamp-auth-brand-mark {
          font-size: 18px;
        }

        .lamp-auth-stage .lamp-auth-glass h1 {
          margin: 0;
          text-align: center;
          font-size: 27px;
          line-height: 1.4;
          color: #fff8ec;
        }

        .lamp-auth-stage .lamp-auth-subtitle {
          margin: 8px 0 25px;
          text-align: center;
          font-size: 13px;
          color: #b9b5c4;
          line-height: 1.7;
        }

        .lamp-auth-stage .lamp-auth-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .lamp-auth-stage .lamp-auth-form label {
          color: #e4d9c9;
          font-size: 12px;
          margin-top: 5px;
        }

        .lamp-auth-stage .lamp-auth-form input,
        .lamp-auth-stage .lamp-auth-form select,
        .lamp-auth-stage .lamp-auth-form textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid #393849;
          border-radius: 11px;
          background: rgba(9, 10, 20, .68);
          color: #fff;
          padding: 13px 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .lamp-auth-stage .lamp-auth-form input::placeholder,
        .lamp-auth-stage .lamp-auth-form textarea::placeholder {
          color: #858292;
        }

        .lamp-auth-stage .lamp-auth-form input:focus,
        .lamp-auth-stage .lamp-auth-form select:focus,
        .lamp-auth-stage .lamp-auth-form textarea:focus {
          border-color: #d8ae70;
          box-shadow: 0 0 0 3px rgba(216, 174, 112, .1);
        }

        .lamp-auth-stage .lamp-auth-form select option {
          background: #191725;
        }

        .lamp-auth-stage .lamp-auth-password {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lamp-auth-stage .lamp-auth-password input {
          padding-right: 65px;
        }

        .lamp-auth-stage .lamp-auth-text-button {
          position: absolute;
          right: 12px;
          border: 0;
          background: none;
          color: #e6c18c;
          font-size: 11px;
        }

        .lamp-auth-stage .lamp-auth-forgot {
          align-self: flex-end;
          border: 0;
          background: transparent;
          color: #e6c18c;
          font-size: 12px;
          padding: 5px 0;
        }

        .lamp-auth-stage .lamp-auth-submit {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
          border: 1px solid #f4d3a0;
          border-radius: 11px;
          background: linear-gradient(110deg, #a8793d, #e9c28b 55%, #b8894b);
          color: #21170d;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(203, 157, 91, .14);
          transition: transform .2s, filter .2s;
        }

        .lamp-auth-stage .lamp-auth-submit:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .lamp-auth-stage .lamp-auth-switch {
          text-align: center;
          color: #bcb7c8;
          font-size: 12px;
          margin: 22px 0 0;
          line-height: 1.8;
        }

        .lamp-auth-stage .lamp-auth-switch button {
          border: 0;
          background: transparent;
          color: #f0c98e;
          font-weight: 700;
        }

        .lamp-auth-stage .lamp-auth-message {
          margin: 7px 0;
          padding: 11px;
          border: 1px solid rgba(232, 194, 139, .25);
          border-radius: 9px;
          color: #f4d9ae;
          background: rgba(213, 169, 104, .08);
          font-size: 12px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        @keyframes lampAuthEnter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 420px) {
          .lamp-auth-stage { padding: 18px 12px; }
          .lamp-auth-stage .lamp-auth-glass { padding: 24px 18px; }
          .lamp-auth-stage .lamp-auth-glass h1 { font-size: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lamp-auth-stage *,
          .lamp-auth-stage *::before,
          .lamp-auth-stage *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div
        className="lamp-auth-layout"
        style={style}
      >
        <div className="lamp-auth-light" />

        <div className="lamp-auth-lamp">
          <div className="lamp-auth-wire" />
          <div className="lamp-auth-shade" />
          <div className="lamp-auth-bulb" />
          <div className="lamp-auth-stem" />
          <div className="lamp-auth-base" />

          <button
            type="button"
            className="lamp-auth-cord"
            aria-label="ল্যাম্পের দড়ি টানুন"
            aria-pressed={lampOn}
            onClick={pullLamp}
          >
            <span />
          </button>

          <p className="lamp-auth-hint">
            {lampOn ? "LIGHT ON" : "PULL TO BEGIN"}
          </p>
        </div>

        {lampOn && (
          mode === "login" ? (
            <Login
              supabase={supabase}
              onLogin={onLogin}
              brand={brand}
              onApply={() => setMode("apply")}
            />
          ) : (
            <Apply
              supabase={supabase}
              brand={brand}
              onLogin={() => setMode("login")}
            />
          )
        )}
      </div>
    </Stage>
  );
}
