import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDiamondSpots } from '../hooks/useDiamondSpots';
import { TrialExpiredModal } from './TrialExpiredModal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { spotsRemaining, loading: spotsLoading, error: spotsError } = useDiamondSpots();
  const [showTrialExpired, setShowTrialExpired] = useState(false);

  // Check for trial_expired or no_access query params
  useEffect(() => {
    if (searchParams.get('trial_expired') === 'true' || searchParams.get('no_access') === 'true') {
      setShowTrialExpired(true);
    }
  }, [searchParams]);

  const pricingPlans = [
    {
      name: 'Pro',
      microtext: 'Most people start here',
      price: '$9',
      period: '/month',
      description: 'For building habits that actually stick.',
      trialCopy: '7-day free trial. Cancel anytime. No reminders needed. You won\'t be charged until the trial ends.',
      features: [
        'Unlimited habits',
        'Progress over time',
        'Sync across devices',
        'Private by default'
      ],
      buttonText: 'Start free trial',
      tier: 'pro' as const
    },
    {
      name: 'Founding',
      microtext: 'Early supporter access',
      price: '$0',
      period: '/lifetime',
      description: 'Help shape what comes next.',
      features: [
        'Everything in Pro',
        'Lifetime access',
        'Early access to new features',
        'Direct line to the founder'
      ],
      buttonText: spotsRemaining > 0 ? 'Become a founding member' : 'Founding access closed',
      tier: 'diamond' as const
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex justify-between items-center">
        <div className="text-[18px] font-semibold tracking-[-0.01em]">
          Habits
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => navigate('/login')}
            className="text-[13px] sm:text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="btn-pill-primary !py-2 !px-4 sm:!px-6 !text-[13px] sm:!text-[14px]"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero Section - Emotional Safety */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-12 sm:pb-20 text-center sm:text-left">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-metadata mb-6"
        >
          Quiet Progress
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[28px] sm:text-[34px] font-semibold tracking-tight leading-[1.2] mb-6 sm:mb-8 max-w-[600px] mx-auto sm:mx-0"
        >
          Build habits gently. <br />
          Stay consistent, without pressure.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#A0A0A0] text-[15px] sm:text-[16px] max-w-[480px] mx-auto sm:mx-0 mb-8 sm:mb-12 leading-relaxed"
        >
          A calm interface for tracking what matters. <br />
          No streaks to protect. No guilt. Just progress.
        </motion.p>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="flex flex-col sm:flex-row items-center gap-6"
        >
            <button
              onClick={() => navigate('/login?mode=signup')}
              className="btn-pill-primary"
            >
              Start free trial
            </button>
            <div className="flex items-center gap-4 text-[13px] text-[#6F6F6F]">
              <span>7 days free</span>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Private</span>
              </div>
            </div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[520px] mx-auto sm:mx-0 text-center sm:text-left"
        >
          <p className="text-[15px] sm:text-[17px] text-[#A0A0A0] leading-[1.8]">
            Most habit apps are designed to make you feel behind.
            This one isn't. The interface is intentional and restrained —
            helping you focus on what matters, without the noise.
          </p>
        </motion.div>
      </section>

      {/* Privacy & Forgiveness Statement */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 sm:gap-12"
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] text-[#F5F5F5] mb-1 font-medium">Your data stays yours</p>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                Row-level security. No tracking. No selling your habits.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] text-[#F5F5F5] mb-1 font-medium">Miss a day? That's okay.</p>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                No punishment. No broken streaks. Just pick up where you left off.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section - Hormozi Principles */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-32">
        <div className="mb-10 sm:mb-16 text-center sm:text-left">
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#F5F5F5]">
            Choose what feels right.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-[800px]">
          {pricingPlans.map((plan, index) => {
            const isFounding = plan.tier === 'diamond';
            const isPro = plan.tier === 'pro';
            const foundingAvailable = isFounding && spotsRemaining > 0;
            const hasTrialCopy = 'trialCopy' in plan && plan.trialCopy;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className="relative p-6 sm:p-8 rounded-[24px] sm:rounded-[28px] h-full flex flex-col"
                  style={{
                    background: '#141414',
                    border: isPro
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* Microtext + Plan Name */}
                  <div className="mb-6">
                    {'microtext' in plan && plan.microtext && (
                      <p className="text-[11px] text-[#6F6F6F] mb-2">
                        {plan.microtext}
                      </p>
                    )}
                    <h3 className="text-[13px] font-medium tracking-[0.05em] uppercase text-[#F5F5F5]">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-[36px] font-semibold text-[#F5F5F5]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[#6F6F6F] text-[14px]">{plan.period}</span>
                    )}
                  </div>

                  {/* Trial copy for Pro - risk reduction */}
                  {hasTrialCopy && (
                    <p className="text-[13px] text-[#6F6F6F] mb-6 leading-relaxed">
                      {plan.trialCopy}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-[#A0A0A0] text-[15px] mb-6">
                    {plan.description}
                  </p>

                  {/* Founding slots - quiet scarcity, no urgency */}
                  {isFounding && !spotsLoading && !spotsError && (
                    <div className="mb-6">
                      {spotsRemaining > 0 ? (
                        <p className="text-[13px] text-[#6F6F6F]">
                          {spotsRemaining} founding spot{spotsRemaining === 1 ? '' : 's'} remaining
                        </p>
                      ) : (
                        <p className="text-[13px] text-[#4F4F4F]">
                          Founding access is closed
                        </p>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center text-[14px] text-[#A0A0A0]">
                        <div className="w-1 h-1 rounded-full bg-[#6F6F6F] mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => foundingAvailable || !isFounding ? navigate('/login?mode=signup') : undefined}
                    disabled={isFounding && !foundingAvailable}
                    className="w-full py-3.5 px-6 rounded-full text-[14px] font-medium transition-all duration-200 disabled:cursor-not-allowed"
                    style={
                      isPro
                        ? {
                            background: '#F5F5F5',
                            color: '#0B0B0B',
                          }
                        : isFounding && foundingAvailable
                          ? {
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: '#A0A0A0',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: '#4F4F4F',
                            }
                    }
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Final CTA - Hormozi Reassurance */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[22px] font-semibold text-[#F5F5F5] mb-4 tracking-tight">
            Start where you are.
          </h2>
          <p className="text-[15px] text-[#6F6F6F] mb-8 max-w-[380px] mx-auto leading-relaxed">
            No pressure. No streaks to protect.<br />
            You can always change later.
          </p>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="btn-pill-primary"
          >
            Start free trial
          </button>
        </motion.div>
      </section>

      <footer className="max-w-[1200px] mx-auto px-6 py-24 border-t border-[#181818]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[14px] text-[#6F6F6F]">
            Quietly building since 2025.
          </div>
          <div className="flex gap-12 text-[14px] text-[#6F6F6F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#A0A0A0] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#A0A0A0] transition-colors">Terms</button>
            <button onClick={() => navigate('/changelog')} className="hover:text-[#A0A0A0] transition-colors">Changelog</button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-[#181818]/50 text-[12px] text-[#4F4F4F]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Your data is isolated and protected</span>
        </div>
      </footer>

      {/* Trial Expired Modal */}
      <TrialExpiredModal isOpen={showTrialExpired} />
    </div>
  );
};
