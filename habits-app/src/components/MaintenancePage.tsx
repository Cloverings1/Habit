import { motion } from 'framer-motion';

export const MaintenancePage = () => {

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center relative overflow-hidden selection:bg-white/10">
      {/* Ambient glow - ultra subtle */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles - fun animation */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 15 : -15, 0],
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <h1
            className="text-[clamp(28px,6vw,52px)] font-medium tracking-[-0.03em] leading-[1.1]"
            style={{ color: 'rgba(255, 255, 255, 0.95)' }}
          >
            Something special
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              is coming
            </span>
          </h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 1,
            delay: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="w-12 h-[1px] mx-auto my-8"
          style={{ background: 'rgba(255, 255, 255, 0.15)' }}
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-[15px] font-normal tracking-[-0.01em]"
          style={{ color: 'rgba(255, 255, 255, 0.35)' }}
        >
          Jonas is sleeping...or coding...
        </motion.p>

        {/* Breathing dot indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.6)' }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
        }}
      />
    </div>
  );
};
