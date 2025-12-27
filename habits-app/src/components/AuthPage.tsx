import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { createProTrialCheckout, createFoundingCheckout } from '../utils/stripe';
import { useAuth } from '../contexts/AuthContext';
import { TermsModal } from './TermsModal';
import { FoundingCelebration } from './FoundingCelebration';
import { BetaLoadingScreen } from './BetaLoadingScreen';
import { useDiamondSpots } from '../hooks/useDiamondSpots';
import { HABIT_COLORS } from '../types';

const PENDING_CHECKOUT_PLAN_KEY = 'pending_checkout_plan';
type PendingCheckoutPlan = 'pro' | 'founding';

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
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<PendingCheckoutPlan | null>(null);
  const [showBetaOnboarding, setShowBetaOnboarding] = useState(false);
  const [betaOnboardingComplete, setBetaOnboardingComplete] = useState(false);
  const [betaOnboardingUserId, setBetaOnboardingUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMountedRef = useRef(true);
  const postConfirmCheckoutStartedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Founding slots disabled - kept hook for future re-enablement
  useDiamondSpots();

  const getCheckoutPlanFromUrlOrStorage = (): PendingCheckoutPlan | null => {
    const plan = searchParams.get('plan') || localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY);
    return plan === 'pro' || plan === 'founding' ? plan : null;
  };

  const isPostConfirmFlow = (): boolean => {
    const postConfirmParam = searchParams.get('post_confirm');
    return postConfirmParam === '1' || postConfirmParam === 'true';
  };

  const startCheckout = async (plan: PendingCheckoutPlan) => {
    // Prevent TrialGuard redirect during checkout redirect
    sessionStorage.setItem('checkout_in_progress', 'true');
    try {
      if (plan === 'pro') {
        await createProTrialCheckout();
      } else {
        await createFoundingCheckout();
      }
    } catch (checkoutError) {
      // Clear flag if checkout fails - otherwise user gets stuck
      sessionStorage.removeItem('checkout_in_progress');
      throw checkoutError;
    }
  };

  // If user lands here from email confirmation with a pending checkout plan,
  // automatically continue checkout once session is available.
  useEffect(() => {
    if (!user) return;
    if (!isPostConfirmFlow()) return;

    const plan = getCheckoutPlanFromUrlOrStorage();
    if (!plan) return;
    if (postConfirmCheckoutStartedRef.current) return;
    if (sessionStorage.getItem('checkout_in_progress') === 'true') return;

    postConfirmCheckoutStartedRef.current = true;
    localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);

    // Show lightweight loading state while redirecting
    setLoading(true);
    setError(null);

    startCheckout(plan).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      setLoading(false);
      setError(message);
      postConfirmCheckoutStartedRef.current = false;
    });
  }, [user, searchParams]);

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

        // If user is signing in to continue a post-confirm checkout, start checkout instead of going to /app.
        const plan = getCheckoutPlanFromUrlOrStorage();
        if (plan && (isPostConfirmFlow() || localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY))) {
          localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
          await startCheckout(plan);
          return;
        }

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
    // We'll show a dedicated beta onboarding screen for beta signups.
    // For all other flows, keep the existing success/loading modal.
    setLoadingProgress(0);
    setError(null);
    setPendingCheckoutPlan(null);
    setBetaOnboardingComplete(false);
    setBetaOnboardingUserId(null);

    // Get the plan parameter from URL upfront
    const planParam = searchParams.get('plan');
    const requiresCheckout = planParam === 'pro' || planParam === 'founding';
    const isBeta = planParam === 'beta';

    if (isBeta) {
      // Prevent LoginRoute auto-redirecting into /app immediately once the session is created.
      sessionStorage.setItem('beta_onboarding_in_progress', 'true');
      // Show beta onboarding screen immediately after accepting terms.
      setShowBetaOnboarding(true);
    } else {
      setShowSuccess(true);
    }

    // Animate the loading bar
    const startTime = Date.now();
    const duration = (requiresCheckout || isBeta) ? 800 : 1500; // legacy success modal duration

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setLoadingProgress(easedProgress * 100);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    requestAnimationFrame(animateProgress);

    try {
      // Step 1: Create the account
      console.log('📝 Creating account...');
      // Ensure the plan survives email confirmation redirect (and can resume checkout)
      const emailRedirectUrl = new URL(`${window.location.origin}/login`);
      emailRedirectUrl.searchParams.set('post_confirm', 'true');
      if (planParam) emailRedirectUrl.searchParams.set('plan', planParam);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: emailRedirectUrl.toString(),
          data: {
            full_name: name,
            display_name: name,
            beta_access: isBeta ? true : undefined,
          },
        },
      });
      if (signUpError) throw signUpError;

      console.log('✅ Account created. planParam:', planParam);
      if (isBeta && signUpData?.session?.user?.id) {
        setBetaOnboardingUserId(signUpData.session.user.id);
      }

      // Founding slots disabled for now
      const claimedFoundingSpot = false;

      // Step 2: For checkout plans, either redirect immediately (if session exists),
      // or show a clear "check your email to continue" message (if confirmations are enabled).
      if (requiresCheckout && !claimedFoundingSpot) {
        const checkoutPlan: PendingCheckoutPlan = planParam as PendingCheckoutPlan;

        // Email confirmations enabled => signUp returns user but NO session until verified
        if (!signUpData?.session) {
          localStorage.setItem(PENDING_CHECKOUT_PLAN_KEY, checkoutPlan);
          setPendingCheckoutPlan(checkoutPlan);
          setShowCelebration(true); // Switch modal to email-confirm UX
          setLoadingProgress(100);
          return;
        }

        // Confirmations disabled (or auto-confirm) => session exists, we can redirect to checkout now.
        await startCheckout(checkoutPlan);
        return;
      }

      // Step 3: For non-checkout flows (founding member claim, beta signup, or free signup)
      if (claimedFoundingSpot) {
        // Wait for animation to finish before showing celebration
        await new Promise(resolve => setTimeout(resolve, Math.max(0, duration - (Date.now() - startTime))));
        if (isMountedRef.current) {
          setShowSuccess(false);
          setShowFoundingCelebration(true);
        }
      } else {
        // No plan specified or beta signup - show regular celebration (email verification)
        // For beta signups with an immediate session, show beta onboarding for ~2.5s + success,
        // then fade into the app. For beta signups without a session (email confirmation),
        // fall back to the existing email verification celebration.
        if (isBeta && signUpData?.session && isMountedRef.current) {
          const minDuration = 2500;
          await new Promise(resolve => setTimeout(resolve, Math.max(0, minDuration - (Date.now() - startTime))));
          if (!isMountedRef.current) return;

          // Mark onboarding complete; BetaLoadingScreen will play success and call onComplete.
          setBetaOnboardingComplete(true);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, Math.max(0, duration - (Date.now() - startTime))));
        if (isMountedRef.current) setShowCelebration(true);
      }
    } catch (err: unknown) {
      console.error('❌ Signup/checkout error:', err);
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.log('📋 Error message:', message);

      // Always close the loading modal on error
      setShowSuccess(false);
      setShowBetaOnboarding(false);
      setBetaOnboardingComplete(false);
      sessionStorage.removeItem('beta_onboarding_in_progress');

      // Show appropriate error message
      if (message.includes('already registered') || message.includes('already been registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (message.includes('Email rate limit')) {
        setError('Too many signup attempts. Please wait a moment and try again.');
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
      {/* Beta onboarding overlay (blocks LoginRoute redirect + fades into app) */}
      <BetaLoadingScreen
        isOpen={showBetaOnboarding}
        complete={betaOnboardingComplete}
        onComplete={() => {
          // Mark per-user "seen" so we don't show beta onboarding repeatedly in-app.
          if (betaOnboardingUserId) {
            localStorage.setItem(`beta_loading_seen:${betaOnboardingUserId}`, 'true');
          }
          // Clear flags and enter the app
          sessionStorage.removeItem('beta_onboarding_in_progress');
          sessionStorage.removeItem('beta_show_loading');
          setShowBetaOnboarding(false);
          setBetaOnboardingComplete(false);
          navigate('/app');
        }}
      />

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
                    {pendingCheckoutPlan
                      ? (
                        <>
                          Please check your email and verify<br />
                          your account to continue checkout.
                        </>
                      )
                      : (
                        <>
                          Please check your email and verify<br />
                          your account before signing in.
                        </>
                      )}
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
                    {pendingCheckoutPlan ? 'Back to Sign In' : 'Go to Sign In'}
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
