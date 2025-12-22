import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Quiet, essential tracking.',
      features: [
        'Up to 3 habits',
        'Daily & Weekly views',
        'Local data storage'
      ],
      buttonText: 'Get Started',
      primaryBtn: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/monthly',
      description: 'The complete experience.',
      features: [
        'Unlimited habits',
        'Cloud synchronization',
        'Advanced analytics',
        'Priority assistance'
      ],
      buttonText: 'Start Pro',
      primaryBtn: true
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
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 pt-32 pb-48 text-center sm:text-left">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-metadata mb-6"
        >
          Daily Consistency
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-hero mb-8 max-w-[600px]"
        >
          Master your routines. <br />
          Built for daily dependability.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#A0A0A0] text-[16px] max-w-[480px] mb-12 leading-relaxed"
        >
          The interface is intentional and restrained. <br />
          Helping you focus on what matters most.
        </motion.p>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
        >
            <button 
              onClick={() => navigate('/login')}
              className="btn-pill-primary"
            >
              Start Tracking
            </button>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-32 bg-[#141414]/30">
        <div className="mb-24">
          <p className="text-metadata mb-4">Pricing</p>
          <h2 className="text-section-header">Simple and calm.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-[900px]">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-[#141414] p-10 rounded-[32px] transition-transform duration-300 hover:translate-y-[-4px]">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#6F6F6F] mb-4">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-[32px] font-semibold">{plan.price}</span>
                      {plan.period && <span className="text-[#6F6F6F] ml-1 text-[14px]">{plan.period}</span>}
                    </div>
                  </div>
                </div>
                
                <p className="text-[#A0A0A0] text-[15px] mb-12 leading-snug">
                  {plan.description}
                </p>
                
                <ul className="space-y-4 mb-12">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center text-[14px] text-[#A0A0A0]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E85D4F] mr-3 opacity-60" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/login')}
                  className={plan.primaryBtn ? "btn-pill-primary w-full" : "btn-pill-secondary w-full"}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <footer className="max-w-[1200px] mx-auto px-6 py-24 border-t border-[#181818] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[14px] text-[#6F6F6F]">
          Quietly building since 2025.
        </div>
        <div className="flex gap-12 text-[14px] text-[#6F6F6F]">
          <a href="#" className="hover:text-[#A0A0A0] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#A0A0A0] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#A0A0A0] transition-colors">Twitter</a>
        </div>
      </footer>
    </div>
  );
};
