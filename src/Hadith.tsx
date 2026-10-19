
import React, { useMemo, useState } from "react";

type HadithItem = {
  id: number;
  subject: string;
  title: string;
  arabic: string;
  meaning: string;
  source: string;
};

const HADITHS: HadithItem[] = [
  {
    id: 1,
    subject: "নিয়ত",
    title: "কাজের মূল্য নিয়তের ওপর",
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    meaning: "নিশ্চয়ই সব কাজের মূল্যায়ন নিয়তের ওপর নির্ভরশীল।",
    source: "সহিহ বুখারি, হাদিস ১; সহিহ মুসলিম, হাদিস ১৯০৭",
  },
  {
    id: 2,
    subject: "ভ্রাতৃত্ব",
    title: "অন্যের জন্য ভালোবাসা",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    meaning: "তোমাদের কেউ ততক্ষণ পর্যন্ত পূর্ণ মুমিন হতে পারবে না, যতক্ষণ না সে নিজের জন্য যা ভালোবাসে, তার ভাইয়ের জন্যও তা ভালোবাসে।",
    source: "সহিহ বুখারি, হাদিস ১৩; সহিহ মুসলিম, হাদিস ৪৫",
  },
  {
    id: 3,
    subject: "কথাবার্তা",
    title: "ভালো কথা বলা",
    arabic: "فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    meaning: "সে যেন ভালো কথা বলে, অথবা চুপ থাকে।",
    source: "সহিহ বুখারি, হাদিস ৬০১৮; সহিহ মুসলিম, হাদিস ৪৭",
  },
  {
    id: 4,
    subject: "আত্মসংযম",
    title: "রাগ নিয়ন্ত্রণ",
    arabic: "لَا تَغْضَبْ",
    meaning: "রাগ করো না।",
    source: "সহিহ বুখারি, হাদিস ৬১১৬",
  },
  {
    id: 5,
    subject: "দয়া",
    title: "মানুষের প্রতি দয়া",
    arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ",
    meaning: "যে দয়া করে না, তার প্রতিও দয়া করা হয় না।",
    source: "সহিহ বুখারি, হাদিস ৬০১৩; সহিহ মুসলিম, হাদিস ২৩১৯",
  },
  {
    id: 6,
    subject: "পবিত্রতা",
    title: "পবিত্রতার গুরুত্ব",
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    meaning: "পবিত্রতা ঈমানের অর্ধেক।",
    source: "সহিহ মুসলিম, হাদিস ২২৩",
  },
  {
    id: 7,
    subject: "জ্ঞান",
    title: "জ্ঞান অর্জনের পথ",
    arabic: "وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    meaning: "যে ব্যক্তি জ্ঞান অন্বেষণে কোনো পথে চলে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
    source: "সহিহ মুসলিম, হাদিস ২৬৯৯",
  },
  {
    id: 8,
    subject: "কুরআন",
    title: "কুরআন শেখা ও শেখানো",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    meaning: "তোমাদের মধ্যে সর্বোত্তম সে, যে কুরআন শেখে এবং অন্যকে শেখায়।",
    source: "সহিহ বুখারি, হাদিস ৫০২৭",
  },
  {
    id: 9,
    subject: "সদাচরণ",
    title: "প্রতিটি ভালো কাজ সদকা",
    arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
    meaning: "প্রতিটি ভালো কাজই সদকা।",
    source: "সহিহ বুখারি, হাদিস ৬০২১; সহিহ মুসলিম, হাদিস ১০০৫",
  },
  {
    id: 10,
    subject: "সত্যবাদিতা",
    title: "সত্যের পথে থাকা",
    arabic: "عَلَيْكُمْ بِالصِّدْقِ",
    meaning: "তোমরা সত্যবাদিতা অবলম্বন করো।",
    source: "সহিহ বুখারি, হাদিস ৬০৯৪; সহিহ মুসলিম, হাদিস ২৬০৭",
  },
  {
    id: 11,
    subject: "লেনদেন",
    title: "প্রতারণা থেকে বিরত থাকা",
    arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا",
    meaning: "যে আমাদের সঙ্গে প্রতারণা করে, সে আমাদের আদর্শের অনুসারী নয়।",
    source: "সহিহ মুসলিম, হাদিস ১০১",
  },
  {
    id: 12,
    subject: "সালাম",
    title: "সালাম প্রচার করা",
    arabic: "أَفْشُوا السَّلَامَ بَيْنَكُمْ",
    meaning: "তোমরা নিজেদের মধ্যে সালামের প্রচলন করো।",
    source: "সহিহ মুসলিম, হাদিস ৫৪",
  },
  {
    id: 13,
    subject: "সহজতা",
    title: "কাজ সহজ করা",
    arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا",
    meaning: "তোমরা সহজ করো, কঠিন করো না।",
    source: "সহিহ বুখারি, হাদিস ৬৯; সহিহ মুসলিম, হাদিস ১৭৩৪",
  },
  {
    id: 14,
    subject: "ক্ষমা",
    title: "ক্ষমার মর্যাদা",
    arabic: "وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا",
    meaning: "ক্ষমা করার কারণে আল্লাহ কোনো বান্দার মর্যাদা ছাড়া আর কিছুই বৃদ্ধি করেন না।",
    source: "সহিহ মুসলিম, হাদিস ২৫৮৮",
  },
  {
    id: 15,
    subject: "পরিবার",
    title: "পরিবারের সঙ্গে উত্তম আচরণ",
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ",
    meaning: "তোমাদের মধ্যে উত্তম সে, যে তার পরিবারের কাছে উত্তম।",
    source: "জামে আত-তিরমিজি, হাদিস ৩৮৯৫",
  },
  {
    id: 16,
    subject: "প্রতিবেশী",
    title: "প্রতিবেশীর অধিকার",
    arabic: "فَلْيُكْرِمْ جَارَهُ",
    meaning: "সে যেন তার প্রতিবেশীকে সম্মান করে।",
    source: "সহিহ বুখারি, হাদিস ৬০১৮; সহিহ মুসলিম, হাদিস ৪৭",
  },
];

const subjects = ["সব বিষয়", ...Array.from(new Set(HADITHS.map((h) => h.subject)))];

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: "16px 12px 32px",
    color: "var(--foreground, #26352d)",
    boxSizing: "border-box",
  },
  hero: {
    padding: "24px 18px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #173f32, #28664d)",
    color: "#fff",
    marginBottom: 18,
  },
  title: { margin: "0 0 8px", fontSize: 25, fontWeight: 750 },
  muted: { margin: 0, lineHeight: 1.8, fontSize: 14, opacity: 0.88 },
  controls: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 },
  field: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #d8e2db",
    borderRadius: 11,
    padding: "12px 13px",
    background: "var(--background, #fff)",
    color: "inherit",
    fontSize: 14,
  },
  card: {
    border: "1px solid #e0e8e2",
    borderRadius: 16,
    padding: "18px 16px",
    marginBottom: 12,
    background: "var(--background, #fff)",
    boxShadow: "0 4px 16px rgba(22, 58, 40, 0.045)",
  },
  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 20,
    background: "#e8f3ec",
    color: "#23583d",
    fontSize: 12,
    fontWeight: 650,
    marginBottom: 9,
  },
  arabic: {
    fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
    fontSize: 25,
    lineHeight: 2,
    textAlign: "right",
    direction: "rtl",
    margin: "12px 0 16px",
    color: "var(--foreground, #173f32)",
  },
  meaning: { lineHeight: 1.95, fontSize: 15, margin: "8px 0 12px" },
  source: { color: "var(--muted-foreground, #68776d)", fontSize: 12, lineHeight: 1.8 },
  button: {
    border: "1px solid #28664d",
    background: "#28664d",
    color: "#fff",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 650,
    cursor: "pointer",
  },
  secondary: {
    border: "1px solid #cbdacf",
    background: "transparent",
    color: "inherit",
    borderRadius: 10,
    padding: "10px 13px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

function downloadText(filename: string, content: string) {
  const blob = new Blob(["\uFEFF", content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatHadith(h: HadithItem) {
  return [
    `${h.id}. ${h.title}`,
    `বিষয়: ${h.subject}`,
    "",
    "আরবি:",
    h.arabic,
    "",
    "বাংলা অর্থ:",
    h.meaning,
    "",
    `সূত্র: ${h.source}`,
    "",
    "------------------------------",
    "",
  ].join("\n");
}

export default function Hadith() {
  const [subject, setSubject] = useState("সব বিষয়");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("bn");
    return HADITHS.filter((h) => {
      const matchesSubject = subject === "সব বিষয়" || h.subject === subject;
      const text = `${h.title} ${h.subject} ${h.arabic} ${h.meaning} ${h.source}`.toLocaleLowerCase("bn");
      return matchesSubject && (!q || text.includes(q));
    });
  }, [subject, search]);

  const downloadAll = () => {
    const content = [
      "বিষয়ভিত্তিক হাদিস",
      "আরবি মূল পাঠ, বাংলা অর্থ ও সূত্র",
      "",
      ...filtered.map(formatHadith),
    ].join("\n");
    downloadText("bishoybhittik-hadith.txt", content);
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.title}>বিষয়ভিত্তিক হাদিস</h1>
        <p style={styles.muted}>
          নির্ভরযোগ্য হাদিসের আরবি পাঠ, বাংলা অর্থ ও সূত্র পড়ুন।
          প্রয়োজনীয় হাদিস মোবাইলে ডাউনলোড করে সংরক্ষণ করুন।
        </p>
      </section>

      <div style={styles.controls}>
        <input
          style={styles.field}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="হাদিস, বিষয় বা শব্দ খুঁজুন"
          aria-label="হাদিস খুঁজুন"
        />
        <select
          style={styles.field}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="বিষয় নির্বাচন"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 15 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground, #68776d)" }}>
          {filtered.length}টি হাদিস পাওয়া গেছে
        </p>
        <button style={styles.button} type="button" onClick={downloadAll} disabled={filtered.length === 0}>
          {subject === "সব বিষয়" && !search ? "সব হাদিস ডাউনলোড" : "দেখানো হাদিস ডাউনলোড"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <section style={styles.card}>
          <p style={{ margin: 0, textAlign: "center", lineHeight: 1.8 }}>
            এই অনুসন্ধানে কোনো হাদিস পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।
          </p>
        </section>
      ) : (
        filtered.map((h) => (
          <article key={h.id} style={styles.card}>
            <span style={styles.badge}>{h.subject}</span>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, lineHeight: 1.6 }}>{h.title}</h2>
            <p lang="ar" dir="rtl" style={styles.arabic}>{h.arabic}</p>
            <h3 style={{ fontSize: 13, margin: "0 0 5px", color: "#28664d" }}>বাংলা অর্থ</h3>
            <p style={styles.meaning}>{h.meaning}</p>
            <p style={styles.source}>সূত্র: {h.source}</p>
            <button
              type="button"
              style={styles.secondary}
              onClick={() => downloadText(`hadith-${h.id}.txt`, formatHadith(h))}
            >
              এই হাদিস ডাউনলোড
            </button>
          </article>
        ))
      )}

      <p style={{ ...styles.source, marginTop: 18 }}>
        পাঠকের সুবিধার্থে বাংলা অর্থ দেওয়া হয়েছে। প্রকাশের আগে আরবি মূল পাঠ,
        অনুবাদ ও হাদিস নম্বর নির্ভরযোগ্য মুদ্রিত সংস্করণ বা হাদিস-গ্রন্থের সঙ্গে
        মিলিয়ে যাচাই করুন।
      </p>
    </main>
  );
}
