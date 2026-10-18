
import React, { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Droplets,
  MessageSquare,
  ArrowRight,
  X,
  CheckCircle2,
  LoaderCircle,
  HeartHandshake,
} from "lucide-react";

type AuthProps = {
  supabase: SupabaseClient;
  onLogin?: () => void;
};

type FormMode = "login" | "signup" | null;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

.lamp-page {
  font-family: 'Inter','Hind Siliguri',sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(ellipse at 50% 5%, rgba(101,75,175,.23), transparent 42%),
    linear-gradient(145deg,#100d20 0%,#17112b 48%,#0b1020 100%);
}
.lamp-page * { box-sizing: border-box; }
.lamp-orb {
  position:absolute; width:360px; height:360px; border-radius:50%;
  background:#8b5cf6; filter:blur(120px); opacity:.12;
  pointer-events:none;
}
.lamp-orb.one {top:-190px;left:-120px;}
.lamp-orb.two {bottom:-230px;right:-100px;background:#ec4899;opacity:.09;}
.lamp-scene {
  width:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  position:relative; z-index:1; padding:32px 16px 56px;
}
.lamp-heading {text-align:center; margin-bottom:8px;}
.lamp-heading h1 {
  margin:0; font-size:clamp(24px,4vw,35px); font-weight:800;
  letter-spacing:-.8px; color:#fff;
}
.lamp-heading p {margin:9px 0 0;color:#aaa3c5;font-size:14px;}
.lamp-stage {
  position:relative; width:min(100%,470px); height:310px;
  display:flex; justify-content:center; align-items:flex-start;
}
.lamp-svg {
  width:260px; height:285px; overflow:visible; position:relative; z-index:3;
  filter:drop-shadow(0 18px 20px rgba(0,0,0,.25));
  animation:lampHover 4s ease-in-out infinite;
}
@keyframes lampHover {
  0%,100% {transform:translateY(0)}
  50% {transform:translateY(-5px)}
}
.lamp-wire {
  position:absolute;top:0;left:50%;height:40px;width:2px;
  background:linear-gradient(#6d6680,#b3a8ca);transform:translateX(-50%);
}
.lamp-light {
  position:absolute;z-index:1;top:84px;left:50%;
  width:300px;height:225px;transform:translateX(-50%);
  background:radial-gradient(ellipse at 50% 0%,rgba(255,223,142,.37),rgba(255,194,96,.13) 36%,transparent 72%);
  filter:blur(10px);opacity:0;transition:opacity .7s ease;
  pointer-events:none;
}
.lamp-light.is-on {opacity:1;}
.lamp-rays {
  position:absolute;z-index:1;top:95px;left:50%;
  width:0;height:0;transform:translateX(-50%);
  border-left:145px solid transparent;border-right:145px solid transparent;
  border-top:190px solid rgba(255,218,132,.075);
  filter:blur(9px);opacity:0;transition:opacity .6s;
}
.lamp-rays.is-on {opacity:1;}
.lamp-pull {
  position:absolute;z-index:5;top:183px;left:calc(50% + 74px);
  display:flex;flex-direction:column;align-items:center;gap:5px;
  border:0;background:none;color:#c5b8e8;cursor:pointer;
  padding:8px;touch-action:manipulation;
}
.lamp-pull-line {
  height:44px;width:2px;border-radius:3px;
  background:linear-gradient(#e7d9ac,#a99a79);
  transform-origin:top;transition:transform .25s;
}
.lamp-pull:hover .lamp-pull-line {transform:scaleY(.87);}
.lamp-pull-knob {
  width:13px;height:18px;border-radius:8px 8px 7px 7px;
  background:linear-gradient(90deg,#bba77b,#f7e1a8,#9c8354);
  box-shadow:0 0 10px rgba(255,220,145,.16);
}
.lamp-hint {
  position:absolute;bottom:1px;left:0;right:0;text-align:center;
  color:#b9b0d0;font-size:12px;letter-spacing:.3px;
}
.lamp-hint span {color:#f5d38c;}
.lamp-card {
  width:min(100%,440px);position:relative;z-index:4;
  border:1px solid rgba(255,255,255,.12);border-radius:24px;
  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035));
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  box-shadow:0 25px 80px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.09);
  padding:26px;
  animation:lampCardIn .42s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes lampCardIn {
  from {opacity:0;transform:translateY(18px) scale(.98)}
  to {opacity:1;transform:translateY(0) scale(1)}
}
.lamp-card-top {display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;}
.lamp-brand {display:flex;align-items:center;gap:12px;min-width:0;}
.lamp-brand-icon {
  width:43px;height:43px;border-radius:14px;display:flex;align-items:center;
  justify-content:center;background:linear-gradient(135deg,#f4d38c,#caa65c);
  color:#241a36;flex-shrink:0;box-shadow:0 6px 22px rgba(236,194,112,.18);
}
.lamp-brand-name {font-size:16px;font-weight:700;color:white;overflow-wrap:anywhere;}
.lamp-brand-caption {font-size:11px;color:#b5accb;margin-top:3px;}
.lamp-close {
  border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);
  color:#d6cde9;border-radius:10px;width:35px;height:35px;display:grid;
  place-items:center;cursor:pointer;flex-shrink:0;
}
.lamp-title {font-size:25px;font-weight:800;margin:0 0 7px;letter-spacing:-.5px;}
.lamp-subtitle {font-size:13px;color:#b8b0cc;line-height:1.7;margin:0 0 23px;}
.lamp-field {display:block;margin-bottom:15px;}
.lamp-label {display:block;font-size:12px;font-weight:600;color:#e5dff2;margin-bottom:8px;}
.lamp-input-wrap {position:relative;}
.lamp-input-icon {
  position:absolute;left:13px;top:50%;transform:translateY(-50%);
  width:17px;height:17px;color:#a79bbf;pointer-events:none;
}
.lamp-input {
  display:block;width:100%;height:47px;border-radius:12px;
  border:1px solid rgba(255,255,255,.13);background:rgba(8,7,20,.28);
  padding:0 43px;color:#fff;font-size:14px;outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.lamp-input::placeholder {color:#827a98;}
.lamp-input:focus {border-color:#c8a8ff;box-shadow:0 0 0 3px rgba(168,125,255,.12);}
.lamp-input option {background:#201933;color:white;}
.lamp-eye {
  position:absolute;right:11px;top:50%;transform:translateY(-50%);
  border:0;background:none;color:#a99cbe;cursor:pointer;padding:5px;display:grid;place-items:center;
}
.lamp-submit {
  width:100%;height:49px;border:0;border-radius:13px;margin-top:5px;
  display:flex;align-items:center;justify-content:center;gap:9px;
  background:linear-gradient(100deg,#f4d99b,#d4b36c);
  color:#251b31;font-size:14px;font-weight:800;cursor:pointer;
  box-shadow:0 8px 24px rgba(218,180,102,.13);transition:transform .2s,filter .2s;
}
.lamp-submit:hover {filter:brightness(1.07);transform:translateY(-1px);}
.lamp-submit:disabled {opacity:.65;cursor:not-allowed;transform:none;}
.lamp-secondary {
  border:0;background:none;color:#e5c985;font-weight:600;font-size:12px;
  cursor:pointer;padding:7px 0;
}
.lamp-switch-row {text-align:center;color:#b7aecb;font-size:12px;margin-top:20px;}
.lamp-switch-row button {margin-left:4px;}
.lamp-message {
  border-radius:11px;padding:11px 12px;font-size:12px;line-height:1.6;
  margin:0 0 16px;overflow-wrap:anywhere;
}
.lamp-error {background:rgba(244,63,94,.11);border:1px solid rgba(251,113,133,.24);color:#ffc3cc;}
.lamp-success {background:rgba(52,211,153,.10);border:1px solid rgba(52,211,153,.24);color:#a7f3d0;}
.lamp-footer {position:relative;z-index:1;text-align:center;color:#8e86a6;font-size:11px;padding:18px 16px 25px;}
.lamp-footer span {color:#d5b873;}
.lamp-off-note {
  text-align:center;max-width:320px;margin:-4px auto 0;color:#b9b0d0;
  font-size:13px;line-height:1.8;position:relative;z-index:2;
}
@media(max-width:480px) {
  .lamp-scene {padding:25px 14px 35px;}
  .lamp-stage {height:290px;}
  .lamp-svg {width:235px;height:265px;}
  .lamp-pull {left:calc(50% + 65px);top:172px;}
  .lamp-card {padding:21px 18px;border-radius:21px;}
  .lamp-title {font-size:23px;}
}
@media(prefers-reduced-motion:reduce) {
  .lamp-svg,.lamp-card {animation:none;}
  *,*::before,*::after {scroll-behavior:auto!important;transition:none!important;}
}
`;

function Lamp({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="lamp-stage">
      <div className="lamp-wire" />

      <div className={`lamp-light ${isOn ? "is-on" : ""}`} />
      <div className={`lamp-rays ${isOn ? "is-on" : ""}`} />

      <svg
        className="lamp-svg"
        viewBox="0 0 260 285"
        role="img"
        aria-label={isOn ? "জ্বালানো ল্যাম্প" : "বন্ধ ল্যাম্প"}
      >
        <defs>
          <linearGradient id="lampMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#766b88" />
            <stop offset="25%" stopColor="#d4c4e7" />
            <stop offset="53%" stopColor="#9284aa" />
            <stop offset="78%" stopColor="#e0d1eb" />
            <stop offset="100%" stopColor="#62566f" />
          </linearGradient>

          <linearGradient id="lampShade" x1="0" y1="0" x2="1" y2=".2">
            <stop offset="0%" stopColor="#8a779e" />
            <stop offset="30%" stopColor="#d9c9e6" />
            <stop offset="60%" stopColor="#a99abb" />
            <stop offset="100%" stopColor="#645573" />
          </linearGradient>

          <linearGradient id="lampInside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isOn ? "#fff5c9" : "#b2a2c7"} />
            <stop offset="100%" stopColor={isOn ? "#ffc85d" : "#5f526f"} />
          </linearGradient>

          <linearGradient id="lampBulb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffce8" />
            <stop offset="100%" stopColor="#ffc65e" />
          </linearGradient>

          <linearGradient id="lampBase" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#62546f" />
            <stop offset="50%" stopColor="#c7b5d7" />
            <stop offset="100%" stopColor="#51445f" />
          </linearGradient>

          <filter id="lampBulbGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation={isOn ? "8" : "1"} />
          </filter>
        </defs>

        {/* Ceiling cap */}
        <ellipse cx="130" cy="4" rx="18" ry="5" fill="#4b405b" />
        <rect x="125" y="0" width="10" height="18" rx="4" fill="url(#lampMetal)" />

        {/* Decorative upper stem */}
        <path
          d="M130 18 L130 43"
          stroke="url(#lampMetal)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="130" cy="42" rx="17" ry="6" fill="url(#lampMetal)" />

        {/* Shade exterior */}
        <path
          d="M88 42 Q91 34 102 34 L158 34 Q169 34 172 42 L204 111 Q208 120 195 122 L65 122 Q52 120 56 111 Z"
          fill="url(#lampShade)"
          stroke="#e2d5ee"
          strokeOpacity=".35"
          strokeWidth="1.2"
        />

        {/* Shade highlights */}
        <path
          d="M98 42 L72 111"
          stroke="#f4eafa"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".34"
        />
        <path
          d="M160 43 L190 111"
          stroke="#493c5b"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".28"
        />

        {/* Inner reflector */}
        <path
          d="M75 115 L185 115 L159 68 Q155 61 148 61 L112 61 Q105 61 101 68 Z"
          fill="#4b3d5a"
        />
        <ellipse cx="130" cy="116" rx="56" ry="9" fill="url(#lampMetal)" />
        <ellipse cx="130" cy="114" rx="43" ry="5" fill="url(#lampInside)" />

        {/* Bulb glow and bulb */}
        <ellipse
          cx="130"
          cy="119"
          rx={isOn ? "28" : "12"}
          ry={isOn ? "22" : "9"}
          fill="#ffcf68"
          opacity={isOn ? ".9" : ".16"}
          filter="url(#lampBulbGlow)"
        />
        <path
          d="M122 112 Q120 104 125 101 L135 101 Q140 104 138 112 L135 119 L125 119 Z"
          fill={isOn ? "url(#lampBulb)" : "#847493"}
        />
        <rect x="125" y="117" width="10" height="7" rx="2" fill="#93809d" />
        <path d="M126 120 H134 M126 123 H134" stroke="#55465f" strokeWidth="1.2" />

        {/* Hanging support */}
        <path
          d="M130 124 L130 222"
          stroke="url(#lampMetal)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M130 128 L130 219"
          stroke="#f0e5fa"
          strokeWidth="1.5"
          opacity=".4"
        />

        {/* Stem joint */}
        <ellipse cx="130" cy="151" rx="8" ry="5" fill="#8c7b9d" />
        <ellipse cx="130" cy="151" rx="4" ry="2" fill="#d9cbe6" />

        {/* Heavy lamp base */}
        <ellipse cx="130" cy="232" rx="42" ry="12" fill="#0a0815" opacity=".45" />
        <path
          d="M91 220 Q91 214 102 213 L158 213 Q169 214 169 220 L178 237 Q179 244 165 246 L95 246 Q81 244 82 237 Z"
          fill="url(#lampBase)"
          stroke="#e4d5f0"
          strokeOpacity=".32"
        />
        <ellipse cx="130" cy="220" rx="39" ry="8" fill="url(#lampMetal)" />
        <ellipse cx="130" cy="219" rx="26" ry="4" fill="#e2d6eb" opacity=".6" />
        <path d="M98 235 Q130 244 162 235" fill="none" stroke="#554661" strokeWidth="2" />

        {/* On/off indicator */}
        <circle
          cx="130"
          cy="232"
          r="4"
          fill={isOn ? "#ffe6a0" : "#786b8b"}
        />
        {isOn && (
          <circle
            cx="130"
            cy="232"
            r="9"
            fill="#ffe6a0"
            opacity=".24"
          />
        )}
      </svg>

      <button
        type="button"
        className="lamp-pull"
        onClick={onToggle}
        aria-label={isOn ? "ল্যাম্প বন্ধ করুন" : "ল্যাম্প চালু করুন"}
        title={isOn ? "ল্যাম্প বন্ধ করুন" : "ল্যাম্প চালু করুন"}
      >
        <span className="lamp-pull-line" />
        <span className="lamp-pull-knob" />
      </button>

      <div className="lamp-hint">
        <span>{isOn ? "ল্যাম্প চালু" : "ল্যাম্প বন্ধ"}</span>
        {" · "}
        {isOn ? "আলো নিভাতে টান দিন" : "আলো জ্বালাতে টান দিন"}
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  options,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="lamp-field">
      <span className="lamp-label">
        {label}
        {required ? " *" : ""}
      </span>

      <div className="lamp-input-wrap">
        <Icon className="lamp-input-icon" />

        {options ? (
          <select
            className="lamp-input"
            value={value}
            required={required}
            onChange={(event) => onChange(event.target.value)}
            style={{ paddingLeft: 43, appearance: "auto" }}
          >
            <option value="">নির্বাচন করুন</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="lamp-input"
              type={isPassword ? (showPassword ? "text" : "password") : type}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              required={required}
              autoComplete={
                type === "email"
                  ? "email"
                  : isPassword
                    ? "current-password"
                    : "off"
              }
              style={{
                paddingRight: isPassword ? 43 : 14,
              }}
            />

            {isPassword && (
              <button
                type="button"
                className="lamp-eye"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            )}
          </>
        )}
      </div>
    </label>
  );
}

export default function Auth({ supabase, onLogin }: AuthProps) {
  const [mode, setMode] = useState<FormMode>(null);
  const [nextMode, setNextMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const [brand, setBrand] = useState("মানবসেবা ফাউন্ডেশন");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-lamp-auth-style", "true");
    style.textContent = styles;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBrand() {
      try {
        const { data } = await supabase
          .from("settings")
          .select("org_name")
          .eq("id", 1)
          .maybeSingle();

        if (active && data?.org_name) {
          setBrand(data.org_name);
        }
      } catch {
        // Use the default organization name if settings are unavailable.
      }
    }

    void loadBrand();

    return () => {
      active = false;
    };
  }, [supabase]);

  function toggleLamp() {
    setMessage("");

    if (mode !== null) {
      setMode(null);
      return;
    }

    setMode(nextMode);
    setNextMode((previous) => (previous === "login" ? "signup" : "login"));
  }

  function closeForm() {
    setMode(null);
    setMessage("");
  }

  function showMessage(text: string, type: "error" | "success" = "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!loginEmail.trim() || !loginPassword) {
      showMessage("ইমেইল ও পাসওয়ার্ড লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      if (!data.user) {
        showMessage("লগইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      /*
       * IMPORTANT:
       * আপনার প্রজেক্টে অ্যাডমিন অনুমোদনের status যদি profiles বা
       * members টেবিলে থাকে, তাহলে এখানে সেই টেবিলের status যাচাই করুন।
       *
       * শুধু applications টেবিলে আবেদন জমা হওয়া মানেই অ্যাকাউন্ট
       * স্বয়ংক্রিয়ভাবে অনুমোদিত হয়ে যায় না।
       */

      showMessage("লগইন সফল হয়েছে।", "success");

      if (onLogin) {
        onLogin();
      }
    } catch (error: unknown) {
      const text =
        error instanceof Error ? error.message : "লগইন করা যায়নি।";

      showMessage(
        text.toLowerCase().includes("invalid login credentials")
          ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।"
          : text
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!loginEmail.trim()) {
      showMessage("আগে ইমেইল ঘরে আপনার ইমেইল লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        loginEmail.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      showMessage(
        "পাসওয়ার্ড পরিবর্তনের নির্দেশনা পাঠানো হলে ইমেইল চেক করুন।",
        "success"
      );
    } catch (error: unknown) {
      showMessage(
        error instanceof Error
          ? error.message
          : "পাসওয়ার্ড রিসেটের অনুরোধ সম্পন্ন হয়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !applicationPassword ||
      !confirmPassword ||
      !district.trim()
    ) {
      showMessage("তারকাচিহ্ন (*) দেওয়া সব ঘর পূরণ করুন।");
      return;
    }

    if (applicationPassword.length < 6) {
      showMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (applicationPassword !== confirmPassword) {
      showMessage("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      /*
       * আবেদন প্রথমে applications টেবিলে জমা হবে।
       * আপনার Supabase applications টেবিলে নিচের column থাকতে হবে:
       * full_name, phone, email, blood_group, district, message
       *
       * password কখনো applications টেবিলে সংরক্ষণ করবেন না।
       */

      const { error: applicationError } = await supabase
        .from("applications")
        .insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          blood_group: bloodGroup || null,
          district: district.trim(),
          message: applicationMessage.trim() || null,
        });

      if (applicationError) {
        if (
          applicationError.code === "23505" ||
          applicationError.message.toLowerCase().includes("duplicate")
        ) {
          throw new Error("এই তথ্য দিয়ে আগে আবেদন করা হয়েছে।");
        }

        throw applicationError;
      }

      /*
       * এই ফর্মে সরাসরি auth account তৈরি করা হচ্ছে না।
       * কারণ আপনার বর্তমান workflow অনুযায়ী আগে অ্যাডমিন অনুমোদন,
       * তারপর সদস্যের লগইন সুবিধা দেওয়া হবে।
       *
       * আবেদন অনুমোদনের পর অ্যাকাউন্ট তৈরির জন্য আপনার বিদ্যমান
       * admin approval workflow ব্যবহার করুন।
       */

      showMessage(
        "আবেদন জমা হয়েছে! অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন। অনুমোদনের পর লগইন করতে পারবেন।",
        "success"
      );

      setFullName("");
      setPhone("");
      setEmail("");
      setBloodGroup("");
      setDistrict("");
      setApplicationMessage("");
      setApplicationPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      showMessage(
        error instanceof Error
          ? error.message
          : "আবেদন জমা হয়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lamp-page">
      <div className="lamp-orb one" />
      <div className="lamp-orb two" />

      <section className="lamp-scene">
        <header className="lamp-heading">
          <h1>আলো জ্বালান, এগিয়ে আসুন</h1>
          <p>সদস্যদের জন্য নিরাপদ প্রবেশদ্বার</p>
        </header>

        <Lamp isOn={mode !== null} onToggle={toggleLamp} />

        {mode === null ? (
          <div className="lamp-off-note">
            ল্যাম্পের সুইচ টান দিন।
            <br />
            <span style={{ color: "#e5c985" }}>
              প্রথমবার Login, পরেরবার Signup
            </span>
          </div>
        ) : (
          <section className="lamp-card" key={mode}>
            <div className="lamp-card-top">
              <div className="lamp-brand">
                <div className="lamp-brand-icon">
                  <HeartHandshake size={23} />
                </div>
                <div>
                  <div className="lamp-brand-name">{brand}</div>
                  <div className="lamp-brand-caption">
                    মানবতার সেবায়, মানুষের পাশে
                  </div>
                </div>
              </div>

              <button
                className="lamp-close"
                type="button"
                onClick={closeForm}
                aria-label="ফর্ম বন্ধ করুন"
                title="ফর্ম বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="lamp-title">
              {mode === "login" ? "আবার ফিরে আসায় স্বাগতম" : "সদস্য হওয়ার আবেদন"}
            </h2>

            <p className="lamp-subtitle">
              {mode === "login"
                ? "আপনার সদস্য অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন।"
                : "আপনার তথ্য দিয়ে আবেদন করুন। অ্যাডমিন অনুমোদনের পর সদস্যপদ সক্রিয় হবে।"}
            </p>

            {message && (
              <div
                className={`lamp-message ${
                  messageType === "success" ? "lamp-success" : "lamp-error"
                }`}
                role="status"
              >
                {messageType === "success" && (
                  <CheckCircle2
                    size={16}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 6,
                    }}
                  />
                )}
                {message}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin}>
                <Field
                  label="ইমেইল ঠিকানা"
                  icon={Mail}
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  placeholder="name@example.com"
                />

                <Field
                  label="পাসওয়ার্ড"
                  icon={Lock}
                  type="password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="আপনার পাসওয়ার্ড"
                />

                <div style={{ textAlign: "right", marginTop: -7, marginBottom: 12 }}>
                  <button
                    type="button"
                    className="lamp-secondary"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>

                <button className="lamp-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <>
                      লগইন করুন <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="lamp-switch-row">
                  নতুন সদস্য?
                  <button
                    type="button"
                    className="lamp-secondary"
                    onClick={() => {
                      setMessage("");
                      setMode("signup");
                    }}
                  >
                    আবেদন করুন
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleApplication}>
                <Field
                  label="পূর্ণ নাম"
                  icon={User}
                  value={fullName}
                  onChange={setFullName}
                  placeholder="আপনার পুরো নাম"
                />

                <Field
                  label="মোবাইল নম্বর"
                  icon={Phone}
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="01XXXXXXXXX"
                />

                <Field
                  label="ইমেইল ঠিকানা"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="name@example.com"
                />

                <Field
                  label="রক্তের গ্রুপ"
                  icon={Droplets}
                  value={bloodGroup}
                  onChange={setBloodGroup}
                  required={false}
                  options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                />

                <Field
                  label="জেলা"
                  icon={MapPin}
                  value={district}
                  onChange={setDistrict}
                  placeholder="আপনার জেলার নাম"
                />

                <Field
                  label="নতুন পাসওয়ার্ড"
                  icon={Lock}
                  type="password"
                  value={applicationPassword}
                  onChange={setApplicationPassword}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                />

                <Field
                  label="পাসওয়ার্ড নিশ্চিত করুন"
                  icon={Lock}
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                />

                <Field
                  label="অতিরিক্ত বার্তা"
                  icon={MessageSquare}
                  value={applicationMessage}
                  onChange={setApplicationMessage}
                  placeholder="আপনার সম্পর্কে কিছু লিখুন"
                  required={false}
                />

                <button className="lamp-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <>
                      আবেদন জমা দিন <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="lamp-switch-row">
                  আগে থেকেই সদস্য?
                  <button
                    type="button"
                    className="lamp-secondary"
                    onClick={() => {
                      setMessage("");
                      setMode("login");
                    }}
                  >
                    লগইন করুন
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </section>

      <footer className="lamp-footer">
        <span>♥</span> {brand} · মানবতার সেবায় একসাথে
      </footer>
    </main>
  );
}
