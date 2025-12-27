import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StaticPageShell, type TocItem } from './StaticPageShell';

type ReleaseTag = 'New' | 'Improvement' | 'Fix';

type Release = {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: {
    tag: ReleaseTag;
    text: string;
  }[];
};

const RELEASES: Release[] = [
  {
    version: 'v0.1.2',
    date: 'Dec 23, 2025',
    title: 'Alpha Launch',
    description: 'The first release for our founding members. Includes core habit tracking, streaks, and the lifetime access program.',
    changes: [
      { tag: 'New', text: 'Founding Member system with limited lifetime slots' },
      { tag: 'New', text: 'Confetti celebration modal for unlocking Diamond status' },
      { tag: 'New', text: 'User feedback wizard with priority levels' },
      { tag: 'Improvement', text: 'Mobile-optimized landing page and signup flow' },
      { tag: 'Improvement', text: 'Open Graph preview cards for sharing' },
    ],
  },
  {
    version: 'v0.1.1',
    date: 'Dec 22, 2025',
    title: 'Security & Polish',
    description: 'A critical update focused on data isolation and dashboard interactivity.',
    changes: [
      { tag: 'New', text: 'Row Level Security (RLS) enabled on all tables' },
      { tag: 'New', text: 'Global streak indicator on dashboard' },
      { tag: 'New', text: 'Completion dots on calendar and week views' },
      { tag: 'Fix', text: 'Resolved silent failure when creating habits' },
      { tag: 'Fix', text: 'Corrected timezone calculation for streaks' },
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Dec 21, 2025',
    title: 'Foundation',
    description: 'Initial build of the habits engine, authentication, and design system.',
    changes: [
      { tag: 'New', text: 'Authentication via Supabase' },
      { tag: 'New', text: 'Habit CRUD operations' },
      { tag: 'New', text: 'Dark mode design system with liquid glass aesthetics' },
    ],
  },
];

const TAG_STYLES: Record<ReleaseTag, { bg: string; color: string; border: string }> = {
  New: {
    bg: 'rgba(34, 197, 94, 0.1)',
    color: '#4ade80',
    border: 'rgba(34, 197, 94, 0.2)',
  },
  Improvement: {
    bg: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  Fix: {
    bg: 'rgba(234, 179, 8, 0.1)',
    color: '#facc15',
    border: 'rgba(234, 179, 8, 0.2)',
  },
};

export const ReleaseNotesPage = () => {
  const reduceMotion = useReducedMotion();
  
  const toc: TocItem[] = useMemo(() => 
    RELEASES.map(r => ({ id: r.version, label: r.version })), 
    []
  );

  return (
    <StaticPageShell
      kicker="Product Updates"
      title="Release Notes"
      subtitle="New features, improvements, and fixes."
      toc={toc}
    >
      <div className="space-y-12">
        {RELEASES.map((release, index) => (
          <motion.section
            key={release.version}
            id={release.version}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="scroll-mt-32"
          >
            {/* Header */}
            <div className="flex items-baseline justify-between mb-4 border-b border-white/5 pb-4">
              <div className="flex items-baseline gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-[#F5F5F5]">
                  {release.version}
                </h2>
                <span className="text-sm text-[#6F6F6F] font-medium">
                  {release.date}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#E0E0E0] mb-2">
                  {release.title}
                </h3>
                <p className="text-[#A0A0A0] leading-relaxed max-w-2xl">
                  {release.description}
                </p>
              </div>

              <div className="grid gap-3">
                {release.changes.map((change, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <span 
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] min-w-[90px] text-center shrink-0"
                      style={{
                        backgroundColor: TAG_STYLES[change.tag].bg,
                        color: TAG_STYLES[change.tag].color,
                        border: `1px solid ${TAG_STYLES[change.tag].border}`,
                      }}
                    >
                      {change.tag}
                    </span>
                    <span className="text-[15px] text-[#D4D4D4] leading-relaxed pt-[2px]">
                      {change.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </StaticPageShell>
  );
};

