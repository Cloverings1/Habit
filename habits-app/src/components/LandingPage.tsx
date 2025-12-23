import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDiamondSpots } from '../hooks/useDiamondSpots';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { spotsRemaining, loading: spotsLoading, error: spotsError } = useDiamondSpots();

  const pricingPlans = [
    {
      name: 'Personal',
      price: '$0',
      description: 'Start where you are.',
      features: [
        'Up to 3 habits',
        'Daily & weekly views',
        'Private by default'
      ],
      buttonText: 'Get started',
      tier: 'free' as const
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For ongoing practice.',
      features: [
        'Unlimited habits',
        'Progress over time',
        'Sync across devices',
        'Private and secure'
      ],
      buttonText: 'Continue with Pro',
      tier: 'pro' as const
    },
    {
      name: 'Founding',
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
      <nav className="max-w-[1200px] mx-auto px-6 py-10 flex justify-between items-center">
        <div className="text-[18px] font-semibold tracking-[-0.01em]">
          Habits
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/login')}
            className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-pill-primary !py-2 !px-6 !text-[14px]"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Founding spots pill - centered with glow */}
      {!spotsLoading && !spotsError && spotsRemaining > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center -mt-4 mb-8"
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="group relative px-4 py-2 rounded-full text-[13px] font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
            />
            {/* Pill background */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            />
            {/* Content */}
            <span className="relative flex items-center gap-2">
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}
              >
                {spotsRemaining}
              </span>
              <span style={{ color: '#A0A0A0' }}>
                founding spot{spotsRemaining === 1 ? '' : 's'} left
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Hero Section - Emotional Safety */}
      <section className="max-w-[1200px] mx-auto px-6 pt-24 pb-20 text-center sm:text-left">
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
          className="text-hero mb-8 max-w-[600px]"
        >
          Build habits gently. <br />
          Stay consistent, without pressure.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#A0A0A0] text-[16px] max-w-[480px] mb-12 leading-relaxed"
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
              onClick={() => navigate('/login')}
              className="btn-pill-primary"
            >
              Start simply
            </button>
            <div className="flex items-center gap-2 text-[13px] text-[#6F6F6F]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Private & encrypted</span>
            </div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[520px]"
        >
          <p className="text-[17px] text-[#A0A0A0] leading-[1.8]">
            Most habit apps are designed to make you feel behind.
            This one isn't. The interface is intentional and restrained —
            helping you focus on what matters, without the noise.
          </p>
        </motion.div>
      </section>

      {/* Privacy & Forgiveness Statement */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-12"
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

      {/* Pricing Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-32">
        <div className="mb-20">
          <p className="text-metadata mb-4">Pricing</p>
          <h2 className="text-section-header">Choose what feels right.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-[1100px]">
          {pricingPlans.map((plan, index) => {
            const isFounding = plan.tier === 'diamond';
            const isPro = plan.tier === 'pro';
            const foundingAvailable = isFounding && spotsRemaining > 0;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Founding tier subtle glow - much softer */}
                {isFounding && foundingAvailable && (
                  <div
                    className="absolute -inset-[1px] rounded-[32px] opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(8, 145, 178, 0.2) 100%)',
                    }}
                  />
                )}

                <div
                  className="relative p-8 rounded-[32px] transition-transform duration-300 hover:translate-y-[-4px] h-full flex flex-col"
                  style={{
                    background: isFounding
                      ? 'linear-gradient(180deg, #141414 0%, #111518 100%)'
                      : '#141414',
                    border: isFounding && foundingAvailable
                      ? '1px solid rgba(6, 182, 212, 0.15)'
                      : '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3
                          className="text-[12px] font-medium tracking-[0.08em] uppercase"
                          style={{ color: isFounding && foundingAvailable ? 'rgba(6, 182, 212, 0.8)' : '#6F6F6F' }}
                        >
                          {plan.name}
                        </h3>
                      </div>
                      <div className="flex items-baseline">
                        <span
                          className="text-[32px] font-semibold"
                          style={{ color: isFounding && foundingAvailable ? 'rgba(6, 182, 212, 0.9)' : '#F5F5F5' }}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-[#6F6F6F] ml-1 text-[14px]">{plan.period}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#A0A0A0] text-[15px] mb-4 leading-snug">
                    {plan.description}
                  </p>

                  {/* Founding slots remaining - inside card, subtle */}
                  {isFounding && !spotsLoading && !spotsError && (
                    <p className="text-[13px] text-[#4F4F4F] mb-6">
                      {spotsRemaining > 0
                        ? `${spotsRemaining} founding spot${spotsRemaining === 1 ? '' : 's'} remaining`
                        : 'Founding access is closed'}
                    </p>
                  )}

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center text-[14px] text-[#A0A0A0]">
                        <div
                          className="w-1.5 h-1.5 rounded-full mr-3 opacity-50"
                          style={{ backgroundColor: isFounding && foundingAvailable ? '#06b6d4' : '#A0A0A0' }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => foundingAvailable || !isFounding ? navigate('/login') : undefined}
                    disabled={isFounding && !foundingAvailable}
                    className="w-full py-3 px-6 rounded-full text-[14px] font-medium transition-all duration-200 disabled:cursor-not-allowed"
                    style={
                      isFounding
                        ? foundingAvailable
                          ? {
                              background: 'rgba(6, 182, 212, 0.15)',
                              color: '#06b6d4',
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: '#4F4F4F',
                            }
                        : isPro
                          ? {
                              background: '#F5F5F5',
                              color: '#0B0B0B',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: '#A0A0A0',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
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

      {/* Final CTA - Reassuring */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[24px] font-semibold text-[#F5F5F5] mb-4 tracking-tight">
            Start where you are.
          </h2>
          <p className="text-[15px] text-[#6F6F6F] mb-8 max-w-[360px] mx-auto">
            No pressure. No streaks to protect. <br />
            You can always change later.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-pill-primary"
          >
            Begin quietly
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
    </div>
  );
};
