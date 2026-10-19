
import React, { useEffect, useMemo, useState } from "react";

type Book = {
  key: string;
  name: string;
  folder: string;
  meta: string;
};

type Topic = {
  id: string;
  book: string;
  bookName: string;
  chapter: number;
  title: string;
};

type Hadith = {
  id: string;
  topic: string;
  book: string;
  bookName: string;
  number: string;
  arabic: string;
  meaning: string;
  grade: string;
  reference: string;
};

const BASE =
  "https://cdn.jsdelivr.net/gh/md-rifatkhan/hadithbangla@main";

const BOOKS: Book[] = [
  { key: "bukhari", name: "সহিহ বুখারি", folder: "Bukhari", meta: "bukhari" },
  { key: "muslim", name: "সহিহ মুসলিম", folder: "Muslim", meta: "muslim" },
  { key: "abudaud", name: "সুনান আবু দাউদ", folder: "AbuDaud", meta: "abudaud" },
  { key: "ibnmajah", name: "সুনান ইবন মাজাহ", folder: "Ibne-Mazah", meta: "ibnmajah" },
  { key: "nasai", name: "সুনান আন-নাসাঈ", folder: "Al-Nasai", meta: "nasai" },
  { key: "tirmidhi", name: "জামে আত-তিরমিজি", folder: "At-tirmizi", meta: "tirmizi" },
];

const DB_NAME = "foundation-hadith-db";
const STORE = "saved";
const DB_KEY = "hadith-data-v1";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("এই ব্রাউজারে অফলাইন স্টোরেজ পাওয়া যায়নি।"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveOffline(items: Hadith[]) {
  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(items, DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

async function readOffline(): Promise<Hadith[]> {
  const db = await openDB();

  const result = await new Promise<Hadith[]>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly")
      .objectStore(STORE)
      .get(DB_KEY);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return result;
}

async function getJSON(url: string): Promise<any> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ডেটা পাওয়া যায়নি (${response.status})`);
  }

  return response.json();
}

function unwrap(value: any): any[] {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    for (const key of ["hadith", "hadiths", "data", "result", "results", "items"]) {
      if (Array.isArray(value[key])) return value[key];
    }

    if (value.hadith && typeof value.hadith === "object") {
      return [value.hadith];
    }

    if (value.ar || value.arabic || value.bn || value.meaning) {
      return [value];
    }

    const values = Object.values(value);
    if (values.length && values.every((x) => x && typeof x === "object")) {
      return values as any[];
    }
  }

  return [];
}

function normalizeHadith(
  raw: any,
  topic: Topic,
  index: number
): Hadith | null {
  const item = raw?.hadith && !raw.ar && !raw.bn ? raw.hadith : raw;

  const arabic = String(
    item?.ar ?? item?.arabic ?? item?.arabic_text ?? ""
  ).trim();

  const meaning = String(
    item?.bn ?? item?.meaning ?? item?.translation ?? item?.bangla ?? ""
  ).trim();

  if (!arabic || !meaning) return null;

  const rawNumber =
    item?.hadith_id ??
    item?.hadith_number ??
    item?.number ??
    item?.id ??
    index + 1;

  const grade =
    item?.grade ??
    item?.grade_name ??
    item?.grading ??
    "উৎসে গ্রেড উল্লেখ নেই";

  return {
    id: `${topic.id}-${String(rawNumber)}`,
    topic: topic.title,
    book: topic.book,
    bookName: topic.bookName,
    number: String(rawNumber),
    arabic,
    meaning,
    grade: String(grade),
    reference: `${topic.bookName}, হাদিস ${rawNumber}`,
  };
}

async function fetchTopics(): Promise<Topic[]> {
  const lists = await Promise.all(
    BOOKS.map(async (book) => {
      try {
        const metadata = await getJSON(
          `${BASE}/${book.folder}/Meta/${book.meta}.json`
        );

        const rows = Array.isArray(metadata)
          ? metadata
          : Object.entries(metadata || {}).map(([key, value]: [string, any]) => ({
              chapter_number: key,
              ...value,
            }));

        return rows.map((row: any, index: number) => {
          const chapter = Number(
            row.chapter_number ?? row.chapter ?? row.id ?? index + 1
          );

          return {
            id: `${book.key}-${chapter}`,
            book: book.key,
            bookName: book.name,
            chapter,
            title: String(
              row.title ?? row.name ?? `অধ্যায় ${chapter}`
            ),
          } as Topic;
        }).filter((topic: Topic) => Number.isFinite(topic.chapter));
      } catch {
        return [];
      }
    })
  );

  return lists.flat().slice(0, 100);
}

async function fetchTopicHadiths(topic: Topic): Promise<Hadith[]> {
  const book = BOOKS.find((b) => b.key === topic.book);
  if (!book) return [];

  const url = `${BASE}/${book.folder}/Chapter/${topic.chapter}.json`;
  const json = await getJSON(url);
  const rows = unwrap(json);

  return rows
    .map((item, index) => normalizeHadith(item, topic, index))
    .filter((item): item is Hadith => item !== null);
}

function downloadFile(filename: string, content: string) {
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

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1000,
    width: "100%",
    margin: "0 auto",
    padding: "16px 12px 36px",
    boxSizing: "border-box",
    color: "var(--foreground, #23352b)",
  },
  hero: {
    padding: "25px 20px",
    borderRadius: 22,
    background: "linear-gradient(135deg,#123d30,#26704e)",
    color: "#fff",
    marginBottom: 18,
    overflow: "hidden",
  },
  title: { fontSize: 26, lineHeight: 1.5, margin: "0 0 7px", fontWeight: 800 },
  description: { fontSize: 14, lineHeight: 1.9, margin: 0, opacity: 0.9 },
  controls: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 10,
    marginBottom: 14,
  },
  field: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #d7e3da",
    borderRadius: 12,
    background: "var(--background,#fff)",
    color: "inherit",
    fontSize: 14,
  },
  button: {
    border: "1px solid #246747",
    borderRadius: 11,
    background: "#246747",
    color: "#fff",
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    border: "1px solid #cbdccf",
    borderRadius: 10,
    background: "transparent",
    color: "inherit",
    padding: "9px 12px",
    fontSize: 13,
    cursor: "pointer",
  },
  card: {
    position: "relative",
    border: "1px solid #e0e9e2",
    borderRadius: 17,
    padding: "17px 16px",
    marginBottom: 13,
    background: "var(--background,#fff)",
    boxShadow: "0 5px 18px rgba(22,60,40,.05)",
    transition: "transform 180ms ease",
    willChange: "transform",
  },
  badge: {
    display: "inline-block",
    background: "#e8f4eb",
    color: "#215b3b",
    borderRadius: 30,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  arabic: {
    direction: "rtl",
    textAlign: "right",
    fontFamily: "'Noto Naskh Arabic','Amiri',serif",
    fontSize: 26,
    lineHeight: 2.05,
    overflowWrap: "anywhere",
    margin: "12px 0 17px",
    color: "var(--foreground,#163f30)",
  },
  meaning: { fontSize: 15, lineHeight: 2, margin: "7px 0 12px" },
  muted: {
    fontSize: 12,
    lineHeight: 1.9,
    color: "var(--muted-foreground,#68786d)",
  },
  notice: {
    padding: 13,
    borderRadius: 12,
    background: "#f1f7f2",
    color: "#28573b",
    fontSize: 13,
    lineHeight: 1.8,
    marginBottom: 14,
  },
};

export default function Hadith() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("সব বিষয়");
  const [selectedBook, setSelectedBook] = useState("সব গ্রন্থ");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [offlineReady, setOfflineReady] = useState(false);
  const [touch, setTouch] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    let cancelled = false;

    readOffline()
      .then((saved) => {
        if (cancelled) return;
        if (saved.length) {
          setHadiths(saved);
          setOfflineReady(true);
        }
      })
      .catch(() => {
        // Offline storage may be unavailable in private browsing.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function downloadLibrary() {
    setLoading(true);
    setError("");
    setProgress("বিষয়গুলোর তালিকা আনা হচ্ছে…");

    try {
      const list = await fetchTopics();
      setTopics(list);

      if (!list.length) {
        throw new Error(
          "বিষয়ের তালিকা পাওয়া যায়নি। ইন্টারনেট বা ডেটাসোর্সের সংযোগ পরীক্ষা করো।"
        );
      }

      const collected: Hadith[] = [];
      const seen = new Set<string>();
      let failures = 0;

      for (let i = 0; i < list.length; i++) {
        const topic = list[i];

        setProgress(
          `${i + 1}/${list.length}টি বিষয় ডাউনলোড হচ্ছে · ${collected.length}টি হাদিস`
        );

        try {
          const items = await fetchTopicHadiths(topic);

          for (const item of items) {
            const uniqueKey = `${item.book}-${item.number}-${item.arabic}`;
            if (!seen.has(uniqueKey)) {
              seen.add(uniqueKey);
              collected.push(item);
            }
          }
        } catch {
          failures++;
        }

        setHadiths([...collected]);
      }

      if (!collected.length) {
        throw new Error(
          "হাদিস ডাউনলোড করা যায়নি। ডেটাসোর্সের ঠিকানা বা ইন্টারনেট সংযোগ পরীক্ষা করো।"
        );
      }

      setProgress("ডাউনলোড করা হাদিস অফলাইনে সংরক্ষণ করা হচ্ছে…");

      try {
        await saveOffline(collected);
        setOfflineReady(true);
      } catch {
        setOfflineReady(false);
        setError(
          "হাদিস পাওয়া গেছে, তবে এই ব্রাউজারে অফলাইন সংরক্ষণ করা যায়নি।"
        );
      }

      setHadiths(collected);
      setProgress(
        `সম্পন্ন: ${collected.length}টি হাদিস পাওয়া গেছে। ${
          failures ? `${failures}টি বিষয়ের ডেটা পাওয়া যায়নি।` : ""
        }`
      );

      if (collected.length < 500) {
        setError(
          `এই ডেটাসোর্স থেকে ${collected.length}টি হাদিস পাওয়া গেছে—৫০০টি পূরণ হয়নি। সব অধ্যায়ে হাদিসের সংখ্যা সমান নয়।`
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "ডাউনলোড করার সময় সমস্যা হয়েছে।"
      );
    } finally {
      setLoading(false);
    }
  }

  const topicNames = useMemo(
    () => Array.from(new Set(topics.map((t) => t.title))),
    [topics]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();

    return hadiths.filter((h) => {
      const topicMatch =
        selectedTopic === "সব বিষয়" || h.topic === selectedTopic;
      const bookMatch =
        selectedBook === "সব গ্রন্থ" || h.bookName === selectedBook;
      const searchable =
        `${h.topic} ${h.bookName} ${h.number} ${h.arabic} ${h.meaning} ${h.grade}`
          .toLocaleLowerCase();

      return topicMatch && bookMatch && (!q || searchable.includes(q));
    });
  }, [hadiths, search, selectedTopic, selectedBook]);

  function exportHadiths(items: Hadith[]) {
    const content = items
      .map(
        (h) =>
          `${h.topic}\n${h.reference}\n\nআরবি:\n${h.arabic}\n\nবাংলা অর্থ:\n${h.meaning}\n\nমানের তথ্য: ${h.grade}\n\n--------------------\n`
      )
      .join("\n");

    downloadFile("foundation-hadith.txt", content);
  }

  function waveTransform(index: number): React.CSSProperties {
    if (!touch.active) return { transform: "translate3d(0,0,0)" };

    const wave = Math.sin(index * 0.72 + touch.x * 0.018);
    const rise = Math.cos(index * 0.45 + touch.y * 0.012);

    return {
      transform: `translate3d(${wave * 5}px,${rise * 7}px,0) rotate(${wave * 0.45}deg)`,
    };
  }

  return (
    <main
      style={styles.page}
      onTouchStart={(e) => {
        const t = e.touches[0];
        setTouch({ x: t.clientX, y: t.clientY, active: true });
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        setTouch({ x: t.clientX, y: t.clientY, active: true });
      }}
      onTouchEnd={() => setTouch((old) => ({ ...old, active: false }))}
      onTouchCancel={() => setTouch((old) => ({ ...old, active: false }))}
    >
      <section style={styles.hero}>
        <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.8 }}>
          HADITH LIBRARY
        </div>
        <h1 style={styles.title}>বিষয়ভিত্তিক হাদিস</h1>
        <p style={styles.description}>
          আরবি মূল পাঠ, বাংলা অর্থ ও গ্রন্থের তথ্য এক জায়গায়।
          প্রয়োজনীয় হাদিস ডাউনলোড করে অফলাইনে পড়ো।
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 9,
            marginTop: 17,
            fontSize: 12,
          }}
        >
          <span>বিষয়: {topics.length || 0}</span>
          <span>·</span>
          <span>হাদিস: {hadiths.length}</span>
          <span>·</span>
          <span>{offlineReady ? "অফলাইনে সংরক্ষিত" : "এখনো সংরক্ষিত নয়"}</span>
        </div>
      </section>

      <div style={styles.notice}>
        প্রথমবার ইন্টারনেট চালু রেখে “হাদিস ডাউনলোড” চাপো। সফলভাবে সংরক্ষিত
        হলে একই ব্রাউজারে পরে অফলাইনেও পড়তে পারবে।
      </div>

      <div style={{ marginBottom: 15 }}>
        <button
          type="button"
          style={{ ...styles.button, width: "100%" }}
          onClick={downloadLibrary}
          disabled={loading}
        >
          {loading ? "ডাউনলোড হচ্ছে…" : "বিষয় ও হাদিস ডাউনলোড"}
        </button>
        {progress && <p style={styles.muted}>{progress}</p>}
        {error && (
          <p role="alert" style={{ ...styles.muted, color: "#a13b2b" }}>
            {error}
          </p>
        )}
      </div>

      <div style={styles.controls}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="আরবি, বাংলা অর্থ বা শব্দ খুঁজুন"
          aria-label="হাদিস খুঁজুন"
          style={styles.field}
        />

        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          style={styles.field}
          aria-label="হাদিসের গ্রন্থ বেছে নাও"
        >
          <option>সব গ্রন্থ</option>
          {BOOKS.map((b) => (
            <option key={b.key}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={styles.field}
          aria-label="হাদিসের বিষয় বেছে নাও"
        >
          <option>সব বিষয়</option>
          {topicNames.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <span style={styles.muted}>{filtered.length}টি হাদিস</span>
        <button
          type="button"
          style={styles.secondary}
          disabled={!filtered.length}
          onClick={() => exportHadiths(filtered)}
        >
          দেখানো হাদিস ডাউনলোড
        </button>
      </div>

      {!hadiths.length ? (
        <section style={styles.card}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>হাদিস লাইব্রেরি</h2>
          <p style={styles.meaning}>
            হাদিসের ডেটা এখনো লোড হয়নি। ইন্টারনেট চালু করে উপরের ডাউনলোড
            বোতামে চাপো। আগে সংরক্ষিত ডেটা থাকলে সেটি এখানে দেখা যাবে।
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section style={styles.card}>
          <p style={styles.meaning}>
            কোনো হাদিস পাওয়া যায়নি। অন্য শব্দ বা বিষয় দিয়ে খুঁজে দেখো।
          </p>
        </section>
      ) : (
        filtered.map((h, index) => (
          <article
            key={h.id}
            style={{ ...styles.card, ...waveTransform(index) }}
          >
            <span style={styles.badge}>{h.topic}</span>
            <h2 style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 8px" }}>
              {h.bookName}
            </h2>

            <p lang="ar" dir="rtl" style={styles.arabic}>
              {h.arabic}
            </p>

            <h3
              style={{
                fontSize: 13,
                color: "#246747",
                margin: "0 0 5px",
              }}
            >
              বাংলা অর্থ
            </h3>
            <p style={styles.meaning}>{h.meaning}</p>

            <p style={styles.muted}>
              সূত্র: {h.reference}
              <br />
              মানের তথ্য: {h.grade}
            </p>

            <button
              type="button"
              style={styles.secondary}
              onClick={() =>
                downloadFile(
                  `hadith-${h.book}-${h.number}.txt`,
                  `${h.topic}\n${h.reference}\n\nআরবি:\n${h.arabic}\n\nবাংলা অর্থ:\n${h.meaning}\n\nমানের তথ্য: ${h.grade}`
                )
              }
            >
              এই হাদিস ডাউনলোড
            </button>
          </article>
        ))
      )}

      <footer style={{ ...styles.muted, marginTop: 20 }}>
        ডেটাসোর্স: hadithbangla GitHub dataset। গ্রন্থের নম্বর ও মানের তথ্য
        প্রকাশের আগে নির্ভরযোগ্য মুদ্রিত সংস্করণের সঙ্গে মিলিয়ে যাচাই করা
        উচিত। এই ওয়েবসাইটের ডেটা সরবরাহকারী নিজেই তথ্যের নির্ভুলতার নিশ্চয়তা
        দেয়—এমন ধরে নেওয়া যাবে না।
      </footer>
    </main>
  );
}
