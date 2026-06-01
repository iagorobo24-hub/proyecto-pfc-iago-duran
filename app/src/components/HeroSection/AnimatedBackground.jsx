import React from 'react';
import styles from './styles/AnimatedBackground.module.css';

const AnimatedBackground = () => {
  return (
    <div className={styles.background}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
            <path
              d="M 10 10 L 190 10 L 190 190 L 10 190 Z"
              fill="none"
              stroke="var(--brand-blue)"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <circle cx="10" cy="10" r="3"                   fill="var(--brand-blue)" opacity="0.5" />
            <circle cx="190" cy="10" r="3"                  fill="var(--brand-blue)" opacity="0.5" />
            <circle cx="190" cy="190" r="3"                 fill="var(--brand-blue)" opacity="0.5" />
            <circle cx="10" cy="190" r="3"                  fill="var(--brand-blue)" opacity="0.5" />

            <motion.path
              d="M 10 100 L 190 100"
              stroke="var(--brand-blue)"
              strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.7, 0.7, 0],
                x: [0, 0, 200, 200]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <motion.path
              d="M 100 10 L 100 190"
              stroke="var(--brand-blue)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.6, 0.6, 0],
                y: [0, 200, 200, 0]
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <motion.path
              d="M 10 10 L 190 190"
              stroke="var(--brand-blue)"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1.5
              }}
            />

            <circle cx="100" cy="100" r="2.5"               fill="var(--brand-blue)" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
