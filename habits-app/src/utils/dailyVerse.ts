export type PrayerVerse = {
  category?: string;
  reference: string;
  text: string;
};

// Import PRAYERS.MD as raw text (Vite `?raw`)
// NOTE: This path is relative to `habits-app/src/utils/`.
import prayersRaw from '../PRAYERS.MD?raw';

function formatLocalDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isScriptureReference(line: string): boolean {
  // Examples:
  // - Philippians 4:13
  // - 2 Corinthians 12:9
  // - Romans 5:3–4 (en dash)
  return /^[0-9]?\s?[A-Za-z].*\d+:\d+([–-]\d+)?$/.test(line.trim());
}

function normalizeQuote(line: string): string {
  return line
    .trim()
    .replace(/^["“”]+/, '')
    .replace(/["“”]+$/, '');
}

export function parsePrayerVerses(md: string): PrayerVerse[] {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const verses: PrayerVerse[] = [];
  let currentCategory: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Category lines are non-empty, non-quoted, non-reference lines.
    if (!isScriptureReference(line) && !/^["“]/.test(line)) {
      currentCategory = line;
      continue;
    }

    if (isScriptureReference(line)) {
      const reference = line;
      const next = lines[i + 1];
      if (next && /^["“]/.test(next)) {
        verses.push({
          category: currentCategory,
          reference,
          text: normalizeQuote(next),
        });
        i += 1; // consumed quote line
      }
    }
  }

  return verses;
}

function hashStringToInt(input: string): number {
  // Simple deterministic hash (FNV-1a-ish)
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STORAGE_KEY = 'habits_daily_verse_v1';

type StoredDailyVerse = {
  dayKey: string;
  index: number;
};

export function getDailyPrayerVerse(options?: { userSeed?: string }): PrayerVerse | null {
  try {
    const verses = parsePrayerVerses(prayersRaw);
    if (verses.length === 0) {
      console.warn('[DailyVerse] No verses parsed from PRAYERS.MD');
      return null;
    }

    const todayKey = formatLocalDayKey(new Date());

    // Try cache first
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDailyVerse;
        if (parsed?.dayKey === todayKey && Number.isFinite(parsed.index)) {
          const idx = ((parsed.index % verses.length) + verses.length) % verses.length;
          return verses[idx] ?? null;
        }
      }
    } catch {
      // ignore storage/JSON errors
    }

    // Choose a deterministic verse per day (optionally per-user) and store it.
    const seed = `${todayKey}|${options?.userSeed ?? 'global'}`;
    const index = hashStringToInt(seed) % verses.length;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dayKey: todayKey, index } satisfies StoredDailyVerse));
    } catch {
      // ignore storage errors
    }

    return verses[index] ?? null;
  } catch (error) {
    console.error('[DailyVerse] Error loading verses:', error);
    return null;
  }
}


