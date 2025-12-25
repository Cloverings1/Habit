import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';

export type PaywallTrigger = 'habit_limit' | 'export' | 'lock';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: PaywallTrigger;
}

const TRIGGER_COPY: Record<PaywallTrigger, { title: string; subtitle: string }> = {
  habit_limit: {
    title: "Unlock Pro",
    subtitle: "Continue building your habits",
  },
  export: {
    title: 'Unlock Pro',
    subtitle: 'Export your progress reports',
  },
  lock: {
    title: 'Unlock Pro',
    subtitle: 'Access all premium features',
  },
};

export const PaywallModal = ({ isOpen, onClose, trigger }: PaywallModalProps) => {
  const { openCheckout } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const { title, subtitle } = TRIGGER_COPY[trigger];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await openCheckout(selectedPlan);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal - refined glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[360px] mx-4"
            style={{
              background: 'rgba(18, 18, 18, 0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="px-7 pt-10 pb-8">
              {/* Header - minimal */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-center mb-8"
              >
                <h2
                  className="text-[26px] font-semibold tracking-[-0.02em] mb-1"
                  style={{ color: '#FFFFFF' }}
                >
                  {title}
                </h2>
                <p
                  className="text-[14px]"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {subtitle}
                </p>
              </motion.div>

              {/* Pricing - ultra clean */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-3 mb-8"
              >
                {/* Monthly */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className="flex-1 py-5 px-4 rounded-2xl text-center transition-all duration-200"
                  style={{
                    background: selectedPlan === 'monthly'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: selectedPlan === 'monthly'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.08em] font-medium mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    Monthly
                  </div>
                  <div
                    className="text-[28px] font-semibold tracking-[-0.02em]"
                    style={{ color: selectedPlan === 'monthly' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)' }}
                  >
                    $9
                  </div>
                </button>

                {/* Annual */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  className="flex-1 py-5 px-4 rounded-2xl text-center transition-all duration-200 relative"
                  style={{
                    background: selectedPlan === 'annual'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: selectedPlan === 'annual'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.08em] font-medium mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    Annual
                  </div>
                  <div
                    className="text-[28px] font-semibold tracking-[-0.02em]"
                    style={{ color: selectedPlan === 'annual' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)' }}
                  >
                    $79
                  </div>
                  <div
                    className="text-[11px] mt-1"
                    style={{ color: 'rgba(34, 197, 94, 0.8)' }}
                  >
                    Save $29
                  </div>
                </button>
              </motion.div>

              {/* Features - minimal list */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 space-y-3"
              >
                {['Unlimited habits', 'Insights & analytics', 'Sync across devices'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span
                      className="text-[13px]"
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Button - refined */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="button"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-[15px] font-semibold transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  color: '#0B0B0B',
                  opacity: isLoading ? 0.7 : 1,
                }}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? 'Loading...' : 'Continue'}
              </motion.button>

              {/* Cancel link */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                type="button"
                onClick={onClose}
                className="w-full mt-4 py-2 text-[13px] transition-opacity"
                style={{ color: 'rgba(255, 255, 255, 0.35)' }}
              >
                Not now
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
