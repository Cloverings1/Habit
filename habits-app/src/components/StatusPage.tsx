import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { StaticPageShell, StaticSection, type TocItem } from './StaticPageShell';

// Deterministic uptime data
// Status: 0 = operational, 1 = degraded, 2 = outage
interface ServiceData {
  name: string;
  uptime: number;
  history: number[]; // 60 days, index 0 = oldest
}

const services: ServiceData[] = [
  {
    name: 'App',
    uptime: 99.8,
    history: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'API',
    uptime: 98.9,
    history: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Database',
    uptime: 99.9,
    history: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Authentication',
    uptime: 99.5,
    history: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Sync',
    uptime: 99.2,
    history: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

const STATUS_COLORS = {
  0: '#22c55e', // operational
  1: '#eab308', // degraded
  2: '#ef4444', // outage
} as const;

const STATUS_LABELS = {
  0: 'Operational',
  1: 'Degraded',
  2: 'Outage',
} as const;

const getCurrentStatus = (): { worstStatus: 0 | 1 | 2 } => {
  let worst = 0 as 0 | 1 | 2;
  for (const service of services) {
    const lastDay = service.history[service.history.length - 1] as 0 | 1 | 2;
    if (lastDay > worst) worst = lastDay;
  }
  return { worstStatus: worst };
};

const UptimeBar = ({ history }: { history: number[] }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex gap-[2px] origin-left"
      initial={reduceMotion ? false : { opacity: 0, scaleX: 0.98 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {history.map((status, index) => (
        <div
          key={index}
          className="w-[8px] h-[24px] rounded-[2px]"
          style={{ backgroundColor: STATUS_COLORS[status as 0 | 1 | 2] }}
          title={`Day ${index + 1}: ${STATUS_LABELS[status as 0 | 1 | 2]}`}
        />
      ))}
    </motion.div>
  );
};

export const StatusPage = () => {
  const toc: TocItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
  ];

  const { worstStatus } = getCurrentStatus();
  const [showFeedback, setShowFeedback] = useState(false);

  const summary =
    worstStatus === 0
      ? { label: 'All systems operational', color: STATUS_COLORS[0], detail: "We're not aware of any issues affecting our systems." }
      : worstStatus === 1
        ? { label: 'Degraded performance', color: STATUS_COLORS[1], detail: 'Some systems are experiencing issues. Our team is investigating.' }
        : { label: 'Service outage', color: STATUS_COLORS[2], detail: 'We are responding to an outage. Updates will appear here.' };

  return (
    <>
      <StaticPageShell
        kicker="System status"
        title="Status"
        subtitle="Live reliability signals for the Habits platform."
        meta="Window: last 60 days"
        toc={toc}
      >
        <StaticSection id="overview" title="Overview">
          <div
            style={{
              borderRadius: 14,
              padding: 14,
              background: `linear-gradient(135deg, ${summary.color}18, rgba(255, 255, 255, 0.02))`,
              border: `1px solid ${summary.color}2A`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: summary.color,
                  boxShadow: `0 0 16px ${summary.color}55`,
                }}
              />
              <p style={{ margin: 0, color: summary.color, fontWeight: 650 }}>{summary.label}</p>
            </div>
            <p style={{ marginTop: 8 }}>{summary.detail}</p>
          </div>
        </StaticSection>

        <StaticSection id="services" title="Services" hint="Daily status snapshots">
          <div style={{ display: 'grid', gap: 16 }}>
            {services.map((service) => {
              const currentStatus = service.history[service.history.length - 1] as 0 | 1 | 2;
              const dot = STATUS_COLORS[currentStatus];

              return (
                <div
                  key={service.name}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: dot }} />
                      <span style={{ color: 'rgba(255, 255, 255, 0.92)', fontWeight: 650 }}>{service.name}</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {STATUS_LABELS[currentStatus]}
                      </span>
                    </div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: 13 }} className="tabular-nums">
                      {service.uptime.toFixed(1)}% uptime
                    </span>
                  </div>

                  {/* Performance note: no per-cell animations */}
                  <UptimeBar history={service.history} />
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: STATUS_COLORS[0] }} />
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.35)' }}>Operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: STATUS_COLORS[1] }} />
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.35)' }}>Degraded</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: STATUS_COLORS[2] }} />
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.35)' }}>Outage</span>
              </div>
            </div>
          </div>
        </StaticSection>
      </StaticPageShell>

      {/* Floating feedback button (optional + lightweight) */}
      <motion.button
        type="button"
        onClick={() => setShowFeedback(true)}
        className="feedback-fab fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-40"
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        title="Report an issue"
        aria-label="Report an issue"
      >
        <MessageCircle size={20} className="feedback-fab-icon" />
      </motion.button>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        currentPage="Status Page"
        allowAnonymous={true}
      />
    </>
  );
};


