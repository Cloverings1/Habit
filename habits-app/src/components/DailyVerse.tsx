import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getDailyPrayerVerse, type PrayerVerse } from '../utils/dailyVerse';

type DailyVerseProps = {
  userSeed?: string;
  minimal?: boolean;
};

export function DailyVerse({ userSeed, minimal = false }: DailyVerseProps) {
  const [verse, setVerse] = useState<PrayerVerse | null>(null);

  // Memoize seed so it doesn't thrash state.
  const seed = useMemo(() => userSeed ?? 'global', [userSeed]);

  useEffect(() => {
    // localStorage is only available client-side; compute after mount.
    setVerse(getDailyPrayerVerse({ userSeed: seed }));
  }, [seed]);

  if (!verse) return null;

  if (minimal) {
    return (
      <motion.div
        className="w-full h-full flex flex-col justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      >
        <div
          className="px-4 py-2.5 rounded-xl w-full h-full flex flex-col justify-center items-center"
          style={{
            background: 'rgba(139, 92, 246, 0.03)',
            border: '1px solid rgba(180, 130, 70, 0.25)',
          }}
        >
          <p
            className="text-[13px] leading-snug text-center px-2"
            style={{
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            {verse.text}
          </p>
          <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--text-muted)' }}>
            {verse.reference}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    >
      <div
        className="px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <p
          className="text-[13px] leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {verse.text}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {verse.reference}
          </p>
          {verse.category && (
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-semibold"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
            >
              {verse.category}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}


