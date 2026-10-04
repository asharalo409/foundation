import { useState } from 'react'

const ROWS: [string, string][] = [
  ['অ্যাডমিন', 'সব কিছু: সদস্য, পদবী, সেটিংস, আয়-ব্যয়, নোটিশ, প্রকল্প, ম্যাপ, রিপোর্ট যাচাই, ইভেন্ট'],
  ['সভাপতি', 'নোটিশ, প্রকল্প, সাহায্য ম্যাপ, কাজের রিপোর্ট যাচাই ও দায়িত্ব বণ্টন'],
  ['সাধারণ সম্পাদক', 'ইভেন্ট ও হাজিরা, কাজের রিপোর্ট যাচাই, প্রকল্প, সাহায্য ম্যাপ ও দায়িত্ব বণ্টন'],
  ['কোষাধ্যক্ষ', 'অনুদান, খরচ, মাসিক ফি, খাত খতিয়ান ও দান-অনুরোধ গ্রহণ'],
  ['স্বাস্থ্য ও রক্তদান সমন্বয়ক', 'জরুরি রক্তের রিকোয়েস্ট ও রক্তদাতা তালিকা'],
  ['ক্রীড়া ও সাংস্কৃতিক সম্পাদক', 'টুর্নামেন্ট, সাংস্কৃতিক ও অন্যান্য ইভেন্ট'],
  ['প্রচার ও প্রকাশনা সম্পাদক', 'নোটিশ, গ্যালারি ও প্রকল্পের আপডেট'],
  ['সদস্য', 'সব দেখতে পারবেন। নিজের প্রোফাইল বদলানো, চ্যাট, মন্তব্য, রিঅ্যাকশন, দান জমা, রক্তদাতা নিবন্ধন ও কাজের রিপোর্ট জমা (যাচাইয়ের জন্য) করতে পারবেন। বাকি কিছু বদলাতে পারবেন না।'],
]

export default function RoleGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
      <button className="w-full flex justify-between items-center" onClick={() => setOpen(!open)}>
        <b className="text-sm">🔐 কার কী বদলানোর ক্ষমতা আছে</b>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="space-y-2">
          {ROWS.map(([r, d]) => (
            <div key={r} className="border-t pt-2">
              <p className="text-sm font-semibold text-green-700">{r}</p>
              <p className="text-xs text-gray-600">{d}</p>
            </div>
          ))}
          <p className="text-[11px] text-gray-500 border-t pt-2">
            কাউকে ক্ষমতা দিতে নিচের তালিকায় তার পদবী বদলে দিন। ক্ষমতা তুলে নিতে আবার "সদস্য" করুন।
          </p>
        </div>
      )}
    </div>
  )
}
