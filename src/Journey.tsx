import { useEffect, useRef, useState } from 'react'

// ── এখানে নিজেদের আসল ইতিহাস লিখুন (তারিখ, শিরোনাম, ছোট বিবরণ) ──
const MILESTONES: [string, string, string][] = [
  ['শুরু', 'যাত্রার সূচনা', 'কয়েকজন বন্ধু মিলে মানুষের পাশে দাঁড়ানোর স্বপ্ন নিয়ে পথ চলা শুরু।'],
  ['প্রথম বছর', 'প্রথম ত্রাণ বিতরণ', 'অসহায় পরিবারের হাতে প্রথমবার খাবার ও প্রয়োজনীয় সামগ্রী তুলে দেওয়া।'],
  ['দ্বিতীয় বছর', 'রক্তদাতা নেটওয়ার্ক', 'জরুরি রক্তের প্রয়োজনে পাশে থাকতে স্বেচ্ছায় রক্তদাতাদের তালিকা তৈরি।'],
  ['এখন', 'ডিজিটাল স্বচ্ছতা', 'প্রতিটি অনুদান ও খরচ রসিদসহ অনলাইনে সবার জন্য খোলা।'],
]

function Item({ i, tag, title, text, color }: { i: number; tag: string; title: string; text: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect() }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const left = i % 2 === 0
  return (
    <div ref={ref} className="relative pl-10"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'none' : 'translateX(' + (left ? '-' : '') + '18px)',
        transition: 'opacity .6s ease, transform .6s ease',
      }}>
      <span className="absolute left-[9px] top-1.5 w-[13px] h-[13px] rounded-full border-[3px] bg-white"
        style={{
          borderColor: color,
          boxShadow: on ? '0 0 0 6px ' + color + '22' : 'none',
          transition: 'box-shadow .8s ease .2s',
        }} />
      <span className="inline-block text-[11px] font-bold rounded-full px-2.5 py-0.5 text-white" style={{ background: color }}>{tag}</span>
      <h3 className="font-bold mt-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
    </div>
  )
}

// "আমাদের পথচলা" সময়রেখা
export default function Journey({ color, tail }: { color: string; tail?: string }) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-semibold" style={{ color }}>আমাদের পথচলা</p>
        <h2 className="text-xl font-bold leading-snug">ছোট শুরু, বড় স্বপ্ন</h2>
      </div>
      <div className="relative space-y-6">
        <span className="absolute left-[15px] top-2 bottom-2 w-[2px] rounded-full"
          style={{ background: 'linear-gradient(180deg,' + color + ',' + color + '22)' }} />
        {MILESTONES.map(([tag, title, text], i) => (
          <Item key={i} i={i} tag={tag} title={title} text={text} color={color} />
        ))}
      </div>
      {tail && (
        <p className="text-sm font-semibold text-center rounded-xl py-2.5 px-3"
          style={{ background: color + '12', color }}>
          {tail}
        </p>
      )}
    </section>
  )
}
