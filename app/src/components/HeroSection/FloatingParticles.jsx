import { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './styles/FloatingParticles.module.css';

function generateParticles(count, seed = 12345) {
  let state = seed;
  const nextRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: nextRandom() * 100,
    delay: nextRandom() * 8,
    duration: 6 + nextRandom() * 8,
    size: 3 + nextRandom() * 5,
    opacity: 0.25 + nextRandom() * 0.4,
    xOffset: nextRandom() > 0.5 ? 40 : -40,
  }));
}

const FloatingParticles = () => {
  const particles = useMemo(() => generateParticles(50), []);

  return (
    <div className={styles.particlesContainer} aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity
          }}
          animate={{
            y: [-20, -180, -20],
            x: [0, p.xOffset, 0],
            opacity: [0, p.opacity, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
