import { motion } from 'framer-motion';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/10">
      {/* Ambient glow behind phone - very subtle */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 50%)',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Phone Silhouette - Apple style teaser */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="relative mb-16"
      >
        {/* Floating animation wrapper */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Phone body - defined by subtle edge glow */}
          <div
            className="relative"
            style={{
              width: '220px',
              height: '440px',
              borderRadius: '44px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)',
              boxShadow: `
                inset 0 0 0 1px rgba(255,255,255,0.06),
                inset 0 1px 0 0 rgba(255,255,255,0.1),
                0 0 100px rgba(255,255,255,0.02),
                0 0 40px rgba(255,255,255,0.01)
              `,
            }}
          >
            {/* Dynamic Island silhouette */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2"
              style={{
                width: '80px',
                height: '24px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.8)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
              }}
            />

            {/* Screen area */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: '12px',
                left: '12px',
                right: '12px',
                bottom: '12px',
                borderRadius: '34px',
              }}
            >
              {/* Header area silhouette */}
              <div
                className="mt-14 mx-4 mb-6"
                style={{
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.015)',
                }}
              />

              {/* Habit card silhouettes - barely visible */}
              <div className="px-4 space-y-3">
                {[0.03, 0.025, 0.02, 0.015, 0.01].map((opacity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.8 + i * 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '14px',
                      background: `rgba(255,255,255,${opacity})`,
                    }}
                  >
                    {/* Completion circle hint */}
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `1px solid rgba(255,255,255,${opacity * 2})`,
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Bottom nav silhouette */}
              <div
                className="absolute bottom-3 left-3 right-3"
                style={{
                  height: '50px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: '0 20px',
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.025)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Subtle reflection on left edge */}
            <div
              className="absolute top-[60px] bottom-[60px] left-0 w-[1px]"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 100%)',
              }}
            />
          </div>
        </motion.div>

        {/* Shadow beneath phone */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          style={{
            width: '160px',
            height: '20px',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scaleX: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 text-center px-6">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.2,
            delay: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <h1
            className="text-[clamp(24px,5vw,42px)] font-medium tracking-[-0.03em] leading-[1.1]"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            Something special
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
              is coming
            </span>
          </h1>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 1,
            delay: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="w-8 h-[1px] mx-auto my-6"
          style={{ background: 'rgba(255, 255, 255, 0.12)' }}
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            delay: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-[14px] font-normal tracking-[-0.01em]"
          style={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          Jonas is sleeping...or coding...
        </motion.p>
      </div>
    </div>
  );
};
