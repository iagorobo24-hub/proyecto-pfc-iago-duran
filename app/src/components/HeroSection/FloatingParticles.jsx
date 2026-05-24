import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './styles/FloatingParticles.module.css';

const FloatingParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 3 + Math.random() * 5,
      opacity: 0.25 + Math.random() * 0.4,
      xOffset: Math.random() > 0.5 ? 40 : -40
    }));
  }, []);

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
