import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { Check, Clock, LogOut } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
}

const FEATURES = [
  'Unlimited habits',
  'Insights over time',
  'Cloud sync across devices',
];

export const TrialExpiredModal = ({ isOpen }: TrialExpiredModalProps) => {
  const { openCheckout } = useSubscription();
  const { signOut } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);

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
          {/* Backdrop - no close on click since this is a blocking modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 liquid-glass-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] px-7 py-8 liquid-glass-modal"
          >
            {/* Trial expired badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-2 mb-4"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <Clock size={14} style={{ color: '#ef4444' }} />
                <span className="text-[12px] font-medium" style={{ color: '#ef4444' }}>
                  Trial ended
                </span>
              </div>
            </motion.div>

            {/* Header */}
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-[24px] font-semibold tracking-tight mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Your free trial has ended
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-[15px] mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Subscribe to continue building your habits. Your data is safe and waiting for you.
            </motion.p>

            {/* Pricing Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {/* Monthly */}
              <motion.button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-4 rounded-2xl border transition-all text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Monthly
                </div>
                <div className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  $9
                  <span className="text-[14px] font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span>
                </div>
                {selectedPlan === 'monthly' && (
                  <motion.div
                    layoutId="trial-plan-indicator"
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  >
                    <Check size={12} color="#0B0B0B" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>

              {/* Annual */}
              <motion.button
                type="button"
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-4 rounded-2xl border transition-all text-left ${
                  selectedPlan === 'annual'
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Annual
                </div>
                <div className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  $79
                  <span className="text-[14px] font-normal" style={{ color: 'var(--text-muted)' }}>/yr</span>
                </div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--accent)' }}>
                  Save $29/year
                </div>
                {selectedPlan === 'annual' && (
                  <motion.div
                    layoutId="trial-plan-indicator"
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  >
                    <Check size={12} color="#0B0B0B" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mb-6"
            >
              <div className="space-y-3">
                {FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} style={{ color: 'var(--text-primary)' }} strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="liquid-glass-divider" />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                type="button"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="liquid-glass-btn-primary w-full"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? 'Loading...' : 'Subscribe to Pro'}
              </motion.button>
              <p className="text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Cancel anytime. Your habits are waiting.
              </p>
              <motion.button
                type="button"
                onClick={signOut}
                className="flex items-center justify-center gap-2 w-full py-2 mt-2 rounded-xl transition-colors hover:bg-white/5"
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Sign out
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
