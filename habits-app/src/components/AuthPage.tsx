import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { createProTrialCheckout, createFoundingCheckout } from '../utils/stripe';
import { TermsModal } from './TermsModal';
import { FoundingCelebration } from './FoundingCelebration';
import { useDiamondSpots } from '../hooks/useDiamondSpots';
import { HABIT_COLORS } from '../types';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultToSignup = searchParams.get('mode') === 'signup';
  const [isLogin, setIsLogin] = useState(!defaultToSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFoundingCelebration, setShowFoundingCelebration] = useState(false);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const checkoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (checkoutTimeoutRef.current) {
        clearTimeout(checkoutTimeoutRef.current);
      }
    };
  }, []);

  // Founding slots disabled - kept hook for future re-enablement
  useDiamondSpots();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      // Login flow - no terms needed
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/app');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        if (message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Signup flow - show terms first
      setShowTermsModal(true);
    }
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    setShowSuccess(true);
    setLoadingProgress(0);
    setError(null);

    // Animate the loading bar over 1.5 seconds
    const startTime = Date.now();
    const duration = 1500;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setLoadingProgress(easedProgress * 100);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            full_name: name,
            display_name: name,
          },
        },
      });
      if (error) throw error;

      // Founding slots disabled for now - all users must go through paid checkout
      // Will be re-enabled in future
      // let claimedFoundingSpot = false;
      // if (spotsRemaining > 0 && signUpData.user?.id) {
      //   try {
      //     const claimResult = await claimFoundingSlot(signUpData.user.id);
      //     if (claimResult.success) {
      //       claimedFoundingSpot = true;
      //       setIsFoundingMember(true);
      //     }
      //   } catch (claimErr) {
      //     // Silently fail - user still gets regular account
      //     console.log('Could not claim founding spot:', claimErr);
      //   }
      // }
      let claimedFoundingSpot = false;

      // Get the plan parameter from URL
      const planParam = searchParams.get('plan');

      // Wait for the loading animation to complete, then show appropriate celebration
      checkoutTimeoutRef.current = setTimeout(async () => {
        // Guard against unmounted component
        if (!isMountedRef.current) return;

        if (claimedFoundingSpot) {
          setShowSuccess(false); // Hide the loading modal
          setShowFoundingCelebration(true); // Show epic founding celebration
          // After celebration, redirect to app (founding members don't need to pay)
        } else if (planParam === 'pro') {
          // User selected Pro trial - initiate checkout
          try {
            // Ensure session is available before attempting checkout
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session) {
              // Session not available, wait a bit and retry
              await new Promise(resolve => setTimeout(resolve, 500));
              const { data: retrySession } = await supabase.auth.getSession();
              if (!retrySession?.session) {
                throw new Error('Session not available. Please refresh and try again.');
              }
            }
            await createProTrialCheckout();
          } catch (checkoutErr) {
            console.error('Failed to initiate Pro checkout:', checkoutErr);
            // Keep the modal open and show error message - don't close setShowSuccess
            if (isMountedRef.current) {
              setError(`Checkout failed: ${checkoutErr instanceof Error ? checkoutErr.message : 'Unknown error'}`);
            }
          }
        } else if (planParam === 'diamond' || planParam === 'founding') {
          // User selected Founding - initiate checkout
          try {
            // Ensure session is available before attempting checkout
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session) {
              // Session not available, wait a bit and retry
              await new Promise(resolve => setTimeout(resolve, 500));
              const { data: retrySession } = await supabase.auth.getSession();
              if (!retrySession?.session) {
                throw new Error('Session not available. Please refresh and try again.');
              }
            }
            await createFoundingCheckout();
          } catch (checkoutErr) {
            console.error('Failed to initiate Founding checkout:', checkoutErr);
            // Keep the modal open and show error message - don't close setShowSuccess
            if (isMountedRef.current) {
              setError(`Checkout failed: ${checkoutErr instanceof Error ? checkoutErr.message : 'Unknown error'}`);
            }
          }
        } else {
          // No plan specified or free plan - show regular celebration
          if (isMountedRef.current) {
            setShowSuccess(false);
            setShowCelebration(true);
          }
        }
      }, 1600);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setShowSuccess(false);
      if (message.includes('already registered')) {
        setError('An account with this email already exists');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col selection:bg-[#E85D4F]/30">
      {/* Header */}
      <nav className="max-w-[1200px] w-full mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] text-[#F5F5F5] hover:opacity-80 transition-opacity"
        >
          Habits
        </button>
        <div className="flex items-center gap-2 text-[13px] text-[#6F6F6F]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secure login</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
        <div className="text-center mb-12">
          <h1 className="text-[24px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-[14px] text-[#A0A0A0]">
            {isLogin ? 'Enter your details to continue.' : 'Start tracking your habits today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Name field - only show for signup */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="text-metadata block mb-2 opacity-60">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
                placeholder="Your name"
                required
              />
            </motion.div>
          )}

          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-[#E85D4F] font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full disabled:opacity-50"
            >
              {loading ? 'Processing' : (isLogin ? 'Continue' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[13px] text-[#6F6F6F] hover:text-[#A0A0A0] transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-[1200px] w-full mx-auto px-6 py-8 border-t border-[#181818]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[12px] text-[#4F4F4F]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Your data is isolated and protected</span>
          </div>
          <div className="flex gap-8 text-[12px] text-[#4F4F4F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#6F6F6F] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#6F6F6F] transition-colors">Terms</button>
          </div>
        </div>
      </footer>

      {/* Terms Modal for Signup */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      {/* Success Animation Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            {/* Backdrop with animated gradient */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.98) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            />

            {/* Success Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[420px] p-8 rounded-3xl"
              style={{
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(60px) saturate(150%)',
                WebkitBackdropFilter: 'blur(60px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              {!showCelebration ? (
                // Loading State
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${HABIT_COLORS[0]}30, ${HABIT_COLORS[5]}30)`,
                      boxShadow: `0 0 40px ${HABIT_COLORS[5]}20`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 40px ${HABIT_COLORS[0]}20`,
                        `0 0 60px ${HABIT_COLORS[5]}30`,
                        `0 0 40px ${HABIT_COLORS[7]}20`,
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={HABIT_COLORS[5]} strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  <h2 className="text-[20px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
                    Creating your account...
                  </h2>
                  <p className="text-[14px] text-[#6F6F6F] mb-8">
                    Setting everything up for you
                  </p>

                  {/* Progress Bar - Minimal blue */}
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
                        background: '#3b82f6',
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                // Celebration State
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="text-center relative"
                >
                  {/* Floating color orbs */}
                  {HABIT_COLORS.map((color, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 20px ${color}`,
                        left: `${10 + (i * 9)}%`,
                        top: '-20px',
                      }}
                      initial={{ y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        y: [0, -40, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                  {/* Success checkmark */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${HABIT_COLORS[3]}40, ${HABIT_COLORS[4]}40)`,
                      boxShadow: `0 0 60px ${HABIT_COLORS[3]}30, 0 0 100px ${HABIT_COLORS[4]}20`,
                    }}
                  >
                    {/* Animated ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: `2px solid ${HABIT_COLORS[3]}`,
                      }}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={HABIT_COLORS[3]}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Title with gradient */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-[24px] font-semibold tracking-tight mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${HABIT_COLORS[3]}, ${HABIT_COLORS[5]}, ${HABIT_COLORS[6]})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Account Created!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-[15px] text-[#A0A0A0] mb-8 leading-relaxed"
                  >
                    Please check your email and verify<br />
                    your account before signing in.
                  </motion.p>

                  {/* Email icon with pulse */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-3 p-4 rounded-xl mb-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HABIT_COLORS[5]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 7l-10 6L2 7" />
                      </svg>
                    </motion.div>
                    <span className="text-[14px] text-[#A0A0A0]">{email}</span>
                  </motion.div>

                  {/* Action button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => {
                      setShowSuccess(false);
                      setShowCelebration(false);
                      setIsLogin(true);
                      setEmail('');
                      setPassword('');
                      setName('');
                    }}
                    className="w-full py-4 rounded-xl text-[15px] font-medium transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#0B0B0B',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Go to Sign In
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Founding Member Epic Celebration */}
      <FoundingCelebration
        isOpen={showFoundingCelebration}
        userName={name}
        onContinue={() => {
          setShowFoundingCelebration(false);
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setName('');
        }}
      />
    </div>
  );
};
