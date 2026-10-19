
import React, { useEffect, useMemo, useState } from "react";

type Book = {
  key: string;
  name: string;
  folder: string;
  chapters: number;
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
};

type Topic = {
  id: string;
  book: Book;
  chapter: number;
  title: string;
};

const BASE =
  "https://cdn.jsdelivr.net/gh/kafelanetwork/hadith-api@main";

const FALLBACK_BASE =
  "https://cdn.jsdelivr.net/gh/md-rifatkhan/hadithbangla@main";

const BOOKS: Book[] = [
  { key: "bukhari", name: "সহিহ বুখারি", folder: "Bukhari", chapters: 97 },
  { key: "muslim", name: "সহিহ মুসলিম", folder: "Muslim", chapters: 56 },
  { key: "abudaud", name: "সুনান আবু দাউদ", folder: "AbuDaud", chapters: 43 },
  { key: "ibnmajah", name: "সুনান ইবন মাজাহ", folder: "Ibne-Mazah", chapters: 37 },
  { key: "nasai", name: "সুনান আন-নাসাঈ", folder: "Al-Nasai", chapters: 50 },
  { key: "tirmidhi", name: "জামে আত-তিরমিজি", folder: "At-tirmizi", chapters: 46 },
];

const DB_NAME = "foundation-hadith-db";
const DB_STORE = "saved";
const DB_KEY = "hadith-v2";

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "16px 12px 36px",
    boxSizing: "border-box",
    color: "var(--foreground,#24362c)",
  },
  hero: {
    padding: "25px 20px",
    borderRadius: 22,
    background: "linear-gradient(135deg,#123d30,#287450)",
    color: "#fff",
    marginBottom: 18,
  },
  field: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #d6e2d9",
    borderRadius: 11,
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
    padding: "9px 12px",
    background: "transparent",
    color: "inherit",
    fontSize: 13,
    cursor: "pointer",
  },
  card: {
    border: "1px solid #e0e9e2",
    borderRadius: 17,
    padding: "17px 16px",
    marginBottom: 13,
    background: "var(--background,#fff)",
    boxShadow: "0 5px 18px rgba(22,60,40,.05)",
    transition: "transform 160ms ease",
    overflowWrap: "anywhere",
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
    lineHeight: 2,
    overflowWrap: "anywhere",
    margin: "12px 0 17px",
  },
  muted: {
    fontSize: 12,
    lineHeight: 1.9,
    color: "var(--muted-foreground,#68786d)",
  },
};

/* IndexedDB: হাদিস অফলাইনে সংরক্ষণ */

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("এই ব্রাউজারে অফলাইন স্টোরেজ নেই।"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveOffline(items: Hadith[]): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readwrite");

      transaction.objectStore(DB_STORE).put(items, DB_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

async function loadOffline(): Promise<Hadith[]> {
  const db = await openDatabase();

  try {
    return await new Promise<Hadith[]>((resolve, reject) => {
      const request = db
        .transaction(DB_STORE, "readonly")
        .objectStore(DB_STORE)
        .get(DB_KEY);

      request.onsuccess = () => {
        resolve(Array.isArray(request.result) ? request.result : []);
      };

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/* JSON ডেটা লোড: মূল ঠিকানা ব্যর্থ হলে বিকল্প চেষ্টা */

async function getJSON(url: string): Promise<any> {
  const fallbackUrl = url.replace(BASE, FALLBACK_BASE);
  const urls = [...new Set([url, fallbackUrl])];

  let lastError: unknown;

  for (const candidate of urls) {
    try {
      const response = await fetch(candidate, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `ডেটা লোড হয়নি: ${lastError.message}`
      : "ডেটাসোর্সে সংযোগ করা যায়নি।"
  );
}

/* বিভিন্ন JSON কাঠামো থেকে হাদিসের তালিকা বের করা */

function extractRows(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  for (const key of [
    "hadiths",
    "data",
    "results",
    "result",
    "items",
    "chapters",
  ]) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  if (data.hadith && typeof data.hadith === "object") {
    return [data.hadith];
  }

  const hasArabic =
    data.ar ||
    data.arabic ||
    data.arabic_text ||
    data.hadithArabic;

  const hasBangla =
    data.bn ||
    data.meaning ||
    data.translation ||
    data.bangla ||
    data.hadithBangla;

  if (hasArabic || hasBangla) {
    return [data];
  }

  return Object.values(data).filter(
    (item: any) => item && typeof item === "object"
  );
}

/* হাদিসের আরবি, বাংলা অর্থ ও নম্বর স্বাভাবিক করা */

function normalize(
  raw: any,
  topic: Topic,
  index: number
): Hadith | null {
  const item =
    raw?.hadith && typeof raw.hadith === "object"
      ? raw.hadith
      : raw;

  if (!item || typeof item !== "object") {
    return null;
  }

  const arabic = String(
    item.ar ??
      item.arabic ??
      item.arabic_text ??
      item.hadithArabic ??
      item.arabicText ??
      ""
  ).trim();

  const meaning = String(
    item.bn ??
      item.meaning ??
      item.translation ??
      item.bangla ??
      item.hadithBangla ??
      item.bangla_translation ??
      item.translation_bn ??
      ""
  ).trim();

  if (!arabic || !meaning) {
    return null;
  }

  const number = String(
    item.hadith_id ??
      item.hadith_number ??
      item.number ??
      item.id ??
      index + 1
  );

  return {
    id: `${topic.id}-${number}-${index}`,
    topic: topic.title,
    book: topic.book.key,
    bookName: topic.book.name,
    number,
    arabic,
    meaning,
    grade: String(
      item.grade ??
        item.grade_name ??
        item.grading ??
        item.status ??
        "উৎসে গ্রেড উল্লেখ নেই"
    ),
  };
}

/* বিষয় বা অধ্যায়ের তালিকা */

async function loadTopics(): Promise<Topic[]> {
  const topics: Topic[] = [];

  const metadataResults = await Promise.all(
    BOOKS.map(async (book) => {
      const metadataName: Record<string, string> = {
        bukhari: "bukhari",
        muslim: "muslim",
        abudaud: "abudaud",
        ibnmajah: "ibnmajah",
        nasai: "nasai",
        tirmidhi: "tirmizi",
      };

      const metadataUrl =
        `${BASE}/${book.folder}/Meta/` +
        `${metadataName[book.key]}.json`;

      try {
        const meta = await getJSON(metadataUrl);

        let rows: any[];

        if (Array.isArray(meta)) {
          rows = meta;
        } else if (meta && typeof meta === "object") {
          rows = Object.entries(meta).map(
            ([key, value]: [string, any]) => {
              if (value && typeof value === "object") {
                return {
                  chapter_number: key,
                  ...value,
                };
              }

              return {
                chapter_number: key,
                title: String(value ?? ""),
              };
            }
          );
        } else {
          rows = [];
        }

        return { book, rows };
      } catch {
        return { book, rows: [] as any[] };
      }
    })
  );

  for (const result of metadataResults) {
    const { book, rows } = result;

    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const chapter = Number(
          row.chapter_number ??
            row.chapterNumber ??
            row.chapter ??
            row.id ??
            i + 1
        );

        if (!Number.isFinite(chapter) || chapter < 1) {
          continue;
        }

        const title = String(
          row.title ??
            row.name ??
            row.chapter_name ??
            row.chapterName ??
            `${book.name} — অধ্যায় ${chapter}`
        );

        topics.push({
          id: `${book.key}-${chapter}`,
          book,
          chapter,
          title,
        });
      }
    } else {
      /*
       * Metadata না পাওয়া গেলে অধ্যায়ের সম্ভাব্য তালিকা তৈরি করি।
       * তবে অধ্যায়ের JSON ফাইল না থাকলে সেই অধ্যায় থেকে হাদিস আসবে না।
       */
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        topics.push({
          id: `${book.key}-${chapter}`,
          book,
          chapter,
          title: `${book.name} — অধ্যায় ${chapter}`,
        });
      }
    }
  }

  const unique = new Map<string, Topic>();

  for (const topic of topics) {
    unique.set(topic.id, topic);
  }

  return Array.from(unique.values()).slice(0, 100);
}

/* একটি অধ্যায়ের হাদিস লোড */

async function downloadTopic(topic: Topic): Promise<Hadith[]> {
  const url =
    `${BASE}/${topic.book.folder}/Chapter/${topic.chapter}.json`;

  const data = await getJSON(url);
  const rows = extractRows(data);

  return rows
    .map((item, index) => normalize(item, topic, index))
    .filter((item): item is Hadith => item !== null);
}

/* টেক্সট ফাইল ডাউনলোড */

function saveText(filename: string, text: string): void {
  const blob = new Blob(["\uFEFF", text], {
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

/* মূল পেজ */

export default function Hadith() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("সব গ্রন্থ");
  const [topicFilter, setTopicFilter] = useState("সব বিষয়");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [offlineReady, setOfflineReady] = useState(false);
  const [finger, setFinger] = useState({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    let alive = true;

    loadOffline()
      .then((items) => {
        if (!alive) return;

        if (items.length > 0) {
          setHadiths(items);
          setOfflineReady(true);
          setProgress("আগে সংরক্ষিত হাদিস লোড হয়েছে।");
        }
      })
      .catch(() => {
        // অফলাইন স্টোরেজ না থাকলেও অনলাইনে ব্যবহার করা যাবে।
      });

    return () => {
      alive = false;
    };
  }, []);

  async function downloadLibrary() {
    if (loading) return;

    setLoading(true);
    setError("");
    setProgress("বিষয়ের তালিকা তৈরি হচ্ছে…");

    try {
      const list = await loadTopics();
      setTopics(list);

      if (list.length === 0) {
        throw new Error(
          "কোনো বিষয় পাওয়া যায়নি। ডেটাসোর্সের ঠিকানা পরীক্ষা করো।"
        );
      }

      const result: Hadith[] = [];
      const seen = new Set<string>();
      let failed = 0;

      for (let i = 0; i < list.length; i++) {
        const topic = list[i];

        setProgress(
          `${i + 1}/${list.length} অধ্যায় পরীক্ষা হচ্ছে · ` +
            `${result.length}টি হাদিস পাওয়া গেছে`
        );

        try {
          const rows = await downloadTopic(topic);

          for (const item of rows) {
            const uniqueKey =
              `${item.book}-${item.number}-${item.arabic}`;

            if (!seen.has(uniqueKey)) {
              seen.add(uniqueKey);
              result.push(item);
            }
          }
        } catch {
          failed++;
        }

        // ডাউনলোডের সময় পাওয়া হাদিস দেখানো হবে।
        setHadiths([...result]);
      }

      if (result.length === 0) {
        throw new Error(
          "কোনো হাদিস পাওয়া যায়নি। ডেটাসোর্সের ফাইলের ঠিকানা, " +
            "নেটওয়ার্ক এবং JSON কাঠামো পরীক্ষা করতে হবে।"
        );
      }

      setHadiths(result);

      let saved = false;

      try {
        await saveOffline(result);
        saved = true;
        setOfflineReady(true);
      } catch {
        setOfflineReady(false);
      }

      const messages = [
        `ডাউনলোড শেষ: ${result.length}টি হাদিস পাওয়া গেছে।`,
        failed > 0
          ? `${failed}টি অধ্যায় লোড হয়নি।`
          : "সব অধ্যায়ের অনুরোধ সম্পন্ন হয়েছে।",
        saved
          ? "হাদিস একই ব্রাউজারে অফলাইনে সংরক্ষিত হয়েছে।"
          : "হাদিস পাওয়া গেছে, কিন্তু অফলাইনে সংরক্ষণ করা যায়নি।",
      ];

      setProgress(messages.join(" "));

      if (!saved) {
        setError(
          "হাদিস পাওয়া গেছে, কিন্তু অফলাইনে সংরক্ষণ করা যায়নি।"
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "ডাউনলোডের সময় অজানা সমস্যা হয়েছে।"
      );
    } finally {
      setLoading(false);
    }
  }

  const topicNames = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.title))),
    [topics]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return hadiths.filter((item) => {
      const matchesBook =
        bookFilter === "সব গ্রন্থ" ||
        item.bookName === bookFilter;

      const matchesTopic =
        topicFilter === "সব বিষয়" ||
        item.topic === topicFilter;

      const searchableText = [
        item.topic,
        item.bookName,
        item.number,
        item.arabic,
        item.meaning,
        item.grade,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return (
        matchesBook &&
        matchesTopic &&
        (!query || searchableText.includes(query))
      );
    });
  }, [hadiths, search, bookFilter, topicFilter]);

  function wave(index: number): React.CSSProperties {
    if (!finger.active) return {};

    const a = Math.sin(index * 0.65 + finger.x * 0.018);
    const b = Math.cos(index * 0.48 + finger.y * 0.014);

    return {
      transform:
        `translate3d(${a * 5}px,${b * 6}px,0) ` +
        `rotate(${a * 0.4}deg)`,
    };
  }

  function exportItems(items: Hadith[]) {
    const content = items
      .map((h) =>
        [
          h.topic,
          `${h.bookName}, হাদিস ${h.number}`,
          "",
          "আরবি:",
          h.arabic,
          "",
          "বাংলা অর্থ:",
          h.meaning,
          "",
          `মানের তথ্য: ${h.grade}`,
          "--------------------------",
          "",
        ].join("\n")
      )
      .join("\n");

    saveText("foundation-hadith.txt", content);
  }

  return (
    <main
      style={styles.page}
      onTouchStart={(e) => {
        const t = e.touches[0];

        setFinger({
          x: t.clientX,
          y: t.clientY,
          active: true,
        });
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];

        setFinger({
          x: t.clientX,
          y: t.clientY,
          active: true,
        });
      }}
      onTouchEnd={() =>
        setFinger((old) => ({ ...old, active: false }))
      }
      onTouchCancel={() =>
        setFinger((old) => ({ ...old, active: false }))
      }
    >
      <header style={styles.hero}>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          HADITH LIBRARY
        </p>

        <h1
          style={{
            fontSize: 26,
            lineHeight: 1.5,
            margin: "0 0 8px",
          }}
        >
          বিষয়ভিত্তিক হাদিস
        </h1>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          আরবি পাঠ, বাংলা অর্থ এবং গ্রন্থের তথ্য খুঁজুন।
          হাদিস সংরক্ষণ করে পরে একই ব্রাউজারে অফলাইনে পড়ুন।
        </p>

        <p
          style={{
            fontSize: 12,
            margin: "14px 0 0",
          }}
        >
          বিষয়: {topics.length} · হাদিস: {hadiths.length} ·{" "}
          {offlineReady
            ? "অফলাইনে সংরক্ষিত"
            : "এখনো সংরক্ষিত নয়"}
        </p>
      </header>

      <button
        type="button"
        style={{
          ...styles.button,
          width: "100%",
          marginBottom: 12,
          opacity: loading ? 0.7 : 1,
        }}
        disabled={loading}
        onClick={downloadLibrary}
      >
        {loading
          ? "ডাউনলোড হচ্ছে…"
          : "বিষয় ও হাদিস ডাউনলোড"}
      </button>

      {progress && (
        <p style={styles.muted} aria-live="polite">
          {progress}
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            ...styles.muted,
            color: "#a13b2b",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
          margin: "16px 0",
        }}
      >
        <input
          type="search"
          style={styles.field}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="হাদিস বা শব্দ খুঁজুন"
          aria-label="হাদিস খুঁজুন"
        />

        <select
          style={styles.field}
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          aria-label="গ্রন্থ বেছে নিন"
        >
          <option>সব গ্রন্থ</option>

          {BOOKS.map((book) => (
            <option key={book.key} value={book.name}>
              {book.name}
            </option>
          ))}
        </select>

        <select
          style={styles.field}
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          aria-label="বিষয় বেছে নিন"
        >
          <option>সব বিষয়</option>

          {topicNames.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
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
        <span style={styles.muted}>
          {filtered.length}টি হাদিস
        </span>

        <button
          type="button"
          style={styles.secondary}
          disabled={!filtered.length}
          onClick={() => exportItems(filtered)}
        >
          হাদিসগুলো ফাইলে ডাউনলোড
        </button>
      </div>

      {!hadiths.length ? (
        <section style={styles.card}>
          <h2
            style={{
              fontSize: 17,
              marginTop: 0,
            }}
          >
            হাদিস লাইব্রেরি
          </h2>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.9,
            }}
          >
            এখনো হাদিস লোড হয়নি। ইন্টারনেট চালু করে উপরের
            বোতামে চাপো।
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section style={styles.card}>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.9,
            }}
          >
            কোনো ফলাফল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজে দেখো।
          </p>
        </section>
      ) : (
        filtered.map((h, index) => (
          <article
            key={h.id}
            style={{
              ...styles.card,
              ...wave(index),
            }}
          >
            <span style={styles.badge}>
              {h.topic}
            </span>

            <h2
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                margin: "0 0 8px",
              }}
            >
              {h.bookName}
            </h2>

            <p
              lang="ar"
              dir="rtl"
              style={styles.arabic}
            >
              {h.arabic}
            </p>

            <h3
              style={{
                fontSize: 13,
                color: "#246747",
                marginBottom: 5,
              }}
            >
              বাংলা অর্থ
            </h3>

            <p
              style={{
                fontSize: 15,
                lineHeight: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {h.meaning}
            </p>

            <p style={styles.muted}>
              সূত্র: {h.bookName}, হাদিস {h.number}
              <br />
              মানের তথ্য: {h.grade}
            </p>

            <button
              type="button"
              style={styles.secondary}
              onClick={() =>
                saveText(
                  `hadith-${h.book}-${h.number}.txt`,
                  [
                    h.topic,
                    `${h.bookName}, হাদিস ${h.number}`,
                    "",
                    "আরবি:",
                    h.arabic,
                    "",
                    "বাংলা অর্থ:",
                    h.meaning,
                    "",
                    `মানের তথ্য: ${h.grade}`,
                  ].join("\n")
                )
              }
            >
              এই হাদিস ডাউনলোড
            </button>
          </article>
        ))
      )}

      <footer
        style={{
          ...styles.muted,
          marginTop: 20,
        }}
      >
        ডেটাসোর্সের তথ্য ও অনুবাদ নির্ভরযোগ্য হাদিসগ্রন্থের
        সঙ্গে যাচাই করে প্রকাশ করো। এই পেজের অফলাইন সংরক্ষণ
        একই ব্রাউজারে ডাউনলোড করা ডেটার জন্য।
      </footer>
    </main>
  );
}
