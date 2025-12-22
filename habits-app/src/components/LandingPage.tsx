import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with habit tracking.',
      features: [
        'Up to 3 habits',
        'Daily & Weekly views',
        'Basic statistics',
        'Local data storage'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'The ultimate tool for high achievers.',
      features: [
        'Unlimited habits',
        'Cloud sync across devices',
        'Advanced analytics & trends',
        'Custom recurrence patterns',
        'Priority support'
      ],
      buttonText: 'Try Pro',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          HabitFlow
        </div>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/app')}
            className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800 transition-all font-medium"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/app')}
            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all font-medium"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
        >
          Master your routines, <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Own your life.
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xl max-w-2xl mx-auto mb-10"
        >
          The most intuitive habit tracker designed for consistency. Build lasting change with data-driven insights.
        </motion.p>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <button 
            onClick={() => navigate('/app')}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            Get Started For Free
          </button>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-24 bg-gray-900/50 rounded-3xl mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400">Choose the plan that's right for your goals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-3xl border ${
                plan.popular 
                ? 'border-indigo-500 bg-indigo-500/5 relative overflow-hidden' 
                : 'border-gray-800 bg-gray-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-400 ml-1">{plan.period}</span>}
              </div>
              <p className="text-gray-400 mb-8">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center text-sm text-gray-300">
                    <Check className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/app')}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </section>
      
      <footer className="container mx-auto px-6 py-12 border-t border-gray-900 text-center text-gray-500 text-sm">
        © 2025 HabitFlow SaaS Company. All rights reserved.
      </footer>
    </div>
  );
};
