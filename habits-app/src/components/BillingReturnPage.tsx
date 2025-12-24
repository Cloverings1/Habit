import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BillingReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Clear checkout flag - user has returned from Stripe
    sessionStorage.removeItem('checkout_in_progress');

    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');

    if (canceled) {
      setStatus('error');
      // Redirect to landing after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    if (!sessionId) {
      setStatus('error');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    // Session ID present - treat as success
    // In a real app, you might validate the session server-side here
    setStatus('success');

    // Redirect to app after 4 seconds (gives webhook time to update entitlements)
    setTimeout(() => {
      navigate('/app');
    }, 4000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] flex items-center justify-center selection:bg-[#E85D4F]/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-[420px] px-6"
      >
        {status === 'success' && (
          <>
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                boxShadow: '0 0 60px rgba(34, 197, 94, 0.2)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[28px] font-semibold text-[#F5F5F5] mb-3 tracking-tight"
            >
              Payment Successful
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[15px] text-[#A0A0A0] mb-8 leading-relaxed"
            >
              Your subscription is now active. We're taking you to your dashboard...
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#3b82f6]"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          </>
        )}

        {status === 'error' && (
          <>
            {/* Error icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                boxShadow: '0 0 60px rgba(239, 68, 68, 0.2)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[28px] font-semibold text-[#F5F5F5] mb-3 tracking-tight"
            >
              Payment Canceled
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[15px] text-[#A0A0A0] mb-8 leading-relaxed"
            >
              Your payment was not completed. Returning to home...
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
};
