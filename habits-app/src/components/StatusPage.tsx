import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Deterministic uptime data - seeded to prevent re-render changes
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
    history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    name: 'API',
    uptime: 98.9,
    history: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    name: 'Database',
    uptime: 99.9,
    history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    name: 'Authentication',
    uptime: 99.5,
    history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    name: 'Sync',
    uptime: 99.2,
    history: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  },
];

const STATUS_COLORS = {
  0: '#22c55e', // operational - green
  1: '#eab308', // degraded - yellow
  2: '#ef4444', // outage - red
};

const STATUS_LABELS = {
  0: 'Operational',
  1: 'Degraded',
  2: 'Outage',
};

// Check if all services are currently operational (last day)
const getCurrentStatus = (): { allOperational: boolean; worstStatus: number } => {
  let worstStatus = 0;
  for (const service of services) {
    const lastDay = service.history[service.history.length - 1];
    if (lastDay > worstStatus) worstStatus = lastDay;
  }
  return { allOperational: worstStatus === 0, worstStatus };
};

const UptimeBar = ({ history }: { history: number[] }) => {
  return (
    <div className="flex gap-[2px]">
      {history.map((status, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.008,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-[8px] h-[24px] rounded-[2px] origin-bottom"
          style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
          title={`Day ${index + 1}: ${STATUS_LABELS[status as keyof typeof STATUS_LABELS]}`}
        />
      ))}
    </div>
  );
};

const ServiceRow = ({ service, index }: { service: ServiceData; index: number }) => {
  const currentStatus = service.history[service.history.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="py-5 border-b border-[#1a1a1a] last:border-b-0"
    >
      {/* Service header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 500, damping: 30 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[currentStatus as keyof typeof STATUS_COLORS] }}
          />
          <span className="text-[15px] font-medium text-[#F5F5F5]">
            {service.name}
          </span>
        </div>
        <span className="text-[13px] text-[#6F6F6F] tabular-nums">
          {service.uptime.toFixed(1)}% uptime
        </span>
      </div>

      {/* Uptime bar */}
      <UptimeBar history={service.history} />
    </motion.div>
  );
};

export const StatusPage = () => {
  const navigate = useNavigate();
  const { allOperational, worstStatus } = getCurrentStatus();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30">
      {/* Navigation */}
      <nav className="max-w-[720px] mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          Habits
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
        >
          Back
        </button>
      </nav>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[720px] mx-auto px-6 pt-8 pb-12"
      >
        <p className="text-[12px] uppercase tracking-[0.15em] text-[#6F6F6F] mb-6">
          System Status
        </p>
        <h1 className="text-[42px] sm:text-[56px] font-semibold tracking-[-0.03em] leading-[1.1]">
          Status
        </h1>
      </motion.header>

      {/* Status Banner */}
      <div className="max-w-[720px] mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-5"
          style={{
            background: allOperational
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04))'
              : worstStatus === 1
                ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.04))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04))',
            border: allOperational
              ? '1px solid rgba(34, 197, 94, 0.15)'
              : worstStatus === 1
                ? '1px solid rgba(234, 179, 8, 0.15)'
                : '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: allOperational
                  ? '#22c55e'
                  : worstStatus === 1
                    ? '#eab308'
                    : '#ef4444',
                boxShadow: allOperational
                  ? '0 0 12px rgba(34, 197, 94, 0.5)'
                  : worstStatus === 1
                    ? '0 0 12px rgba(234, 179, 8, 0.5)'
                    : '0 0 12px rgba(239, 68, 68, 0.5)',
              }}
            />
            <span
              className="text-[16px] font-medium"
              style={{
                color: allOperational
                  ? '#22c55e'
                  : worstStatus === 1
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {allOperational
                ? 'All systems operational'
                : worstStatus === 1
                  ? 'Some systems experiencing issues'
                  : 'System outage detected'}
            </span>
          </div>
          <p className="text-[14px] text-[#6F6F6F] mt-2 ml-6">
            {allOperational
              ? "We're not aware of any issues affecting our systems."
              : 'Our team is investigating and working on a resolution.'}
          </p>
        </motion.div>
      </div>

      {/* System Status Section */}
      <main className="max-w-[720px] mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-6"
          style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
          }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1a1a1a]">
            <h2 className="text-[15px] font-medium text-[#F5F5F5]">
              System status
            </h2>
            <span className="text-[12px] text-[#6F6F6F]">
              Last 60 days
            </span>
          </div>

          {/* Services */}
          <div>
            {services.map((service, index) => (
              <ServiceRow key={service.name} service={service} index={index} />
            ))}
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1a1a1a]"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[11px] text-[#6F6F6F]">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#eab308]" />
              <span className="text-[11px] text-[#6F6F6F]">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span className="text-[11px] text-[#6F6F6F]">Outage</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[13px] text-[#4F4F4F] text-center mt-16 italic"
        >
          Uptime calculated over the last 60 days.
        </motion.p>
      </main>
    </div>
  );
};
