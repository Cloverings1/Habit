import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const DemoHabitCard = () => {
  const [completed, setCompleted] = useState(false);

  // Simulate completion after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompleted(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[320px] mx-auto mb-16">
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none z-20"
          >
             {/* Simple confetti burst */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                style={{
                  background: ['#3b82f6', '#8b5cf6', '#e85d4f', '#10b981'][i % 4],
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 150 - 20,
                  scale: [1, 0],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: Math.random() * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 pr-5 backdrop-blur-xl"
        style={{
          boxShadow: completed 
            ? 'inset 0 0 20px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.15)' 
            : 'none',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Glow Effect */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-blue-500/5 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <span className={`text-[15px] font-medium transition-colors duration-300 ${completed ? 'text-[#6F6F6F]' : 'text-[#F5F5F5]'}`}>
              Read 30 mins
            </span>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-[1px] transition-all duration-500 ${
                    i < 4 || (i === 4 && completed) ? 'bg-blue-500 opacity-100' : 'bg-white/10'
                  }`}
                  style={{
                    boxShadow: (i < 4 || (i === 4 && completed)) ? '0 0 8px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
              completed 
                ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] scale-100' 
                : 'bg-white/10 scale-90'
            }`}
          >
            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check size={14} color="white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Background Decor - Minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"
      />
    </div>
  );
};

export const InvitePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30 overflow-x-hidden flex flex-col">
      {/* Navigation - Simplified */}
      <nav className="max-w-[1200px] mx-auto px-6 py-10 w-full flex justify-between items-center">
        <div className="text-[18px] font-semibold tracking-[-0.01em]">
          Habits
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[480px] w-full text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 backdrop-blur-sm mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-[#A78BFA]">Private Invite</span>
          </motion.div>

          <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-tight leading-[1.1] mb-6">
            You're invited to the beta.
          </h1>
          
          <p className="text-[#A0A0A0] text-[16px] leading-relaxed mb-10">
            A calm interface for tracking what matters.<br />
            No streaks to protect. No guilt. Just progress.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/login?mode=signup&plan=beta')}
              className="btn-pill-primary w-full sm:w-auto min-w-[200px] !py-4 !text-[15px]"
            >
              Accept Invite
            </button>
            
            <p className="text-[13px] text-[#6F6F6F]">
              Limited spots available for v1.3
            </p>
          </div>

          <div className="mt-16 w-full">
             <DemoHabitCard />
          </div>

          {/* Features Preview */}
          <div className="pt-8 border-t border-[#181818] grid grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-[14px] font-medium text-[#F5F5F5] mb-2">Private by default</h3>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                Your data is yours. Row-level security ensures total privacy.
              </p>
            </div>
            <div>
              <h3 className="text-[14px] font-medium text-[#F5F5F5] mb-2">Quiet design</h3>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                No loud notifications or gamification features that cause anxiety.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

