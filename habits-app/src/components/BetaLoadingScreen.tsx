import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BetaLoadingScreenProps {
  isOpen: boolean;
  complete?: boolean;
  onComplete: () => void;
}

export const BetaLoadingScreen = ({ isOpen, complete = false, onComplete }: BetaLoadingScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset progress when opening
    setLoadingProgress(0);
    setShowSuccess(false);

    // Animate progress up to a "nearly done" point.
    // We intentionally hold near-complete until `complete` flips true,
    // then we finish + show a success animation before fading out.
    const startTime = Date.now();
    const duration = 2500; // target ~2.5s for the loading phase
    const target = 92; // hold at 92% until completion

    let rafId = 0;
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setLoadingProgress(eased * target);
      if (progress < 1) rafId = requestAnimationFrame(animateProgress);
    };

    rafId = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!complete) return;

    // Finish progress + show success check, then close
    setLoadingProgress(100);
    setShowSuccess(true);

    const t = setTimeout(() => {
      onComplete();
    }, 650);

    return () => clearTimeout(t);
  }, [complete, isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.98) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          />

          {/* Loading Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-[420px] p-8 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            <div className="text-center">
              {/* Icon / success */}
              <div className="relative w-16 h-16 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)',
                  }}
                  animate={{
                    boxShadow: showSuccess
                      ? '0 0 60px rgba(6, 182, 212, 0.35)'
                      : [
                          '0 0 40px rgba(6, 182, 212, 0.2)',
                          '0 0 60px rgba(6, 182, 212, 0.3)',
                          '0 0 40px rgba(6, 182, 212, 0.2)',
                        ],
                  }}
                  transition={{ duration: 2, repeat: showSuccess ? 0 : Infinity, ease: 'easeInOut' }}
                />

                <AnimatePresence mode="wait">
                  {!showSuccess ? (
                    <motion.div
                      key="spinner"
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="check"
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    >
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <h2 className="text-[20px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
                {showSuccess ? "You're in." : 'Setting up your beta access...'}
              </h2>
              <p className="text-[14px] text-[#6F6F6F] mb-8">
                {showSuccess ? 'Everything is ready' : 'Preparing your workspace'}
              </p>

              {/* Progress Bar - Cyan gradient */}
              <div
                className="h-1 rounded-full overflow-hidden mx-auto"
                style={{
                  maxWidth: '200px',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${loadingProgress}%`,
                    background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

