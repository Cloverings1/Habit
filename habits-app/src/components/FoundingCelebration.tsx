import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface FoundingCelebrationProps {
  isOpen: boolean;
  onContinue: () => void;
  userName: string;
}

// Diamond icon SVG
const DiamondIcon = ({ size = 80, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <defs>
      <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="diamondGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M12 2L2 9l10 13 10-13L12 2z"
      fill="url(#diamondGradient)"
      filter="url(#diamondGlow)"
    />
    <path
      d="M12 2L2 9h20L12 2z"
      fill="rgba(255,255,255,0.3)"
    />
    <path
      d="M7 9l5 13 5-13"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
);

// Confetti particle component
const ConfettiParticle = ({
  index,
  color
}: {
  index: number;
  color: string;
}) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 0.5, []);
  const randomDuration = useMemo(() => 2 + Math.random() * 2, []);
  const randomRotation = useMemo(() => Math.random() * 720 - 360, []);
  const size = useMemo(() => 6 + Math.random() * 8, []);
  const shape = useMemo(() => Math.random() > 0.5 ? 'circle' : 'rect', []);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${randomX}%`,
        top: '-20px',
        width: size,
        height: shape === 'rect' ? size * 0.6 : size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        boxShadow: `0 0 10px ${color}`,
      }}
      initial={{
        y: 0,
        opacity: 0,
        rotate: 0,
        scale: 0
      }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [0, 1, 1, 0],
        rotate: randomRotation,
        scale: [0, 1, 1, 0.5],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
};

// Sparkle component
const Sparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
    }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 1,
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
        fill="url(#sparkleGradient)"
      />
      <defs>
        <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

export const FoundingCelebration = ({ isOpen, onContinue, userName }: FoundingCelebrationProps) => {
  const [showContent, setShowContent] = useState(false);

  // Confetti colors - diamond/cyan theme
  const confettiColors = [
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#22d3ee', // cyan-400
    '#38bdf8', // sky-400
    '#c084fc', // purple-400
    '#67e8f9', // cyan-300
    '#ffffff', // white sparkles
  ];

  useEffect(() => {
    if (isOpen) {
      // Delay content appearance for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Generate confetti particles
  const confettiParticles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: confettiColors[i % confettiColors.length],
    })), []);

  // Generate sparkle positions
  const sparkles = useMemo(() => [
    { x: 15, y: 20, delay: 0 },
    { x: 85, y: 25, delay: 0.3 },
    { x: 25, y: 70, delay: 0.6 },
    { x: 75, y: 65, delay: 0.9 },
    { x: 50, y: 15, delay: 1.2 },
    { x: 10, y: 50, delay: 0.4 },
    { x: 90, y: 55, delay: 0.7 },
  ], []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Solid black base layer - ensures full coverage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99]"
            style={{ background: '#000000' }}
          />

          {/* Backdrop with animated gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.25) 0%, rgba(0,0,0,1) 60%)',
            }}
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(ellipse at 30% 30%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 30% 70%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 30% 30%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Confetti Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiParticles.map((particle) => (
                <ConfettiParticle
                  key={particle.id}
                  index={particle.id}
                  color={particle.color}
                />
              ))}
            </div>

            {/* Sparkles Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {sparkles.map((sparkle, i) => (
                <Sparkle key={i} {...sparkle} />
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[480px] p-10 text-center"
          >
            {showContent && (
              <>
                {/* Floating Diamond with glow rings */}
                <motion.div
                  className="relative mx-auto mb-8"
                  style={{ width: 120, height: 120 }}
                >
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Middle glow ring */}
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Diamond icon */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.4,
                      type: 'spring',
                      bounce: 0.4,
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <DiamondIcon size={80} />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Title with gradient */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-[32px] font-bold tracking-tight mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #06b6d4 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s linear infinite',
                  }}
                >
                  Welcome to the
                </motion.h1>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-[40px] font-bold tracking-tight mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 25%, #8b5cf6 50%, #a855f7 75%, #22d3ee 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 4s linear infinite',
                  }}
                >
                  Founders Club
                </motion.h2>

                {/* Personalized message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-[18px] text-[#A0A0A0] mb-3"
                >
                  {userName}, you're one of the first.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-[15px] text-[#6F6F6F] mb-10 leading-relaxed max-w-[360px] mx-auto"
                >
                  You now have lifetime access to all Pro features.<br />
                  Thank you for believing in what we're building.
                </motion.p>

                {/* Features unlocked */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="mb-10 p-5 rounded-2xl"
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <p className="text-[12px] uppercase tracking-wider text-cyan-400 mb-3 font-medium">
                    Unlocked Forever
                  </p>
                  <div className="flex justify-center gap-6 text-[13px] text-[#A0A0A0]">
                    <span>Unlimited habits</span>
                    <span className="text-cyan-500">•</span>
                    <span>Cloud sync</span>
                    <span className="text-cyan-500">•</span>
                    <span>Analytics</span>
                  </div>
                </motion.div>

                {/* Email verification notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="mb-8 flex items-center justify-center gap-3 p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-10 6L2 7" />
                    </svg>
                  </motion.div>
                  <span className="text-[14px] text-[#A0A0A0]">
                    Check your email to verify your account
                  </span>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  onClick={onContinue}
                  className="w-full py-4 rounded-xl text-[16px] font-semibold transition-all relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(6, 182, 212, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                  <span className="relative">Continue to Sign In</span>
                </motion.button>
              </>
            )}
          </motion.div>

          {/* CSS for gradient animation */}
          <style>{`
            @keyframes gradient-shift {
              0% { background-position: 0% center; }
              100% { background-position: 200% center; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};
