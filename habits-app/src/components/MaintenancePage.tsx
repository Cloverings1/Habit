import { motion } from 'framer-motion';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0a] flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/10">
      {/* Falling snowflakes */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, Math.sin(i) * 30],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: 'linear',
          }}
        >
          ❄
        </motion.div>
      ))}

      {/* Warm glow behind tree */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.08) 0%, rgba(239, 68, 68, 0.04) 40%, transparent 60%)',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Christmas Tree */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative mb-12"
      >
        {/* Tree made of triangles */}
        <div className="relative flex flex-col items-center">
          {/* Star */}
          <motion.div
            className="text-3xl mb-[-8px] relative z-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))',
            }}
          >
            ⭐
          </motion.div>

          {/* Tree layers */}
          {[
            { width: 60, height: 40 },
            { width: 90, height: 50 },
            { width: 120, height: 60 },
          ].map((layer, i) => (
            <div
              key={i}
              className="relative"
              style={{
                width: 0,
                height: 0,
                borderLeft: `${layer.width / 2}px solid transparent`,
                borderRight: `${layer.width / 2}px solid transparent`,
                borderBottom: `${layer.height}px solid rgba(34, 197, 94, ${0.6 - i * 0.1})`,
                marginTop: i === 0 ? 0 : -15,
              }}
            >
              {/* Ornaments */}
              {[...Array(2 + i)].map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#ef4444', '#3b82f6', '#fbbf24', '#ec4899'][j % 4],
                    left: `${-layer.width / 2 + 15 + j * (layer.width / (3 + i))}px`,
                    top: `${15 + j * 8}px`,
                    boxShadow: `0 0 8px ${['#ef4444', '#3b82f6', '#fbbf24', '#ec4899'][j % 4]}`,
                  }}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: j * 0.3,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Trunk */}
          <div
            className="mt-[-5px]"
            style={{
              width: '20px',
              height: '25px',
              background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
              borderRadius: '2px',
            }}
          />
        </div>
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1
            className="text-[clamp(26px,5vw,44px)] font-medium tracking-[-0.03em] leading-[1.1]"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            Merry Christmas
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
              & Happy Holidays
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-10 h-[1px] mx-auto my-6"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), rgba(34, 197, 94, 0.5), transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[14px] font-normal tracking-[-0.01em]"
          style={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          Jonas is with family...back soon
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-6 flex items-center justify-center gap-1"
        >
          {'MAINTENANCE MODE'.split('').map((letter, i) => (
            <motion.span
              key={i}
              className="text-[11px] font-semibold"
              style={{
                color: letter === ' ' ? 'transparent' : i % 2 === 0 ? '#ef4444' : '#ffffff',
                textShadow: i % 2 === 0 ? '0 0 8px rgba(239, 68, 68, 0.5)' : '0 0 8px rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            >
              {letter === ' ' ? '\u00A0\u00A0' : letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Gift icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <motion.span
            className="text-2xl"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            🎁
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};
