import React, { useState } from 'react';
import catalogService from '../../services/catalogService';
import styles from './styles/StatsSection.module.css';

const Counter = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    let started = false;
    const start = performance.now();
    const duration = 2000;
    
    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = value * easeProgress;
      
      if (!started) {
        started = true;
      }
      
      const decimals = value % 1 === 0 ? 0 : 1;
      setDisplayValue(current.toFixed(decimals));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalProducts: 2.4,
    totalTools: 7,
    totalFamilies: 7,
    totalBrands: 5
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await catalogService.getCatalogStats();
        if (data.totalProducts) {
          setStats({
            totalProducts: parseFloat((data.totalProducts / 1000).toFixed(1)),
            totalTools: 7,
            totalFamilies: data.totalFamilies || 7,
            totalBrands: data.totalBrands || 5
          });
        }
      } catch {
        // Fallback silencioso
      }
    };
    fetchStats();
  }, []);

  const statsData = [
    { label: "Referencias en Catálogo", value: stats.totalProducts, suffix: "k+" },
    { label: "Herramientas Integradas", value: stats.totalTools, suffix: "" },
    { label: "Familias en DB", value: stats.totalFamilies, suffix: "" },
    { label: "Marcas Disponibles", value: stats.totalBrands, suffix: "+" }
  ];

  return (
    <section className={styles.statsWrapper}>
      {statsData.map((stat, index) => (
        <div key={index} className={styles.statItem}>
          <div className={styles.statValue}>
            <Counter value={stat.value} suffix={stat.suffix} />
          </div>
          <div className={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </section>
  );
};

export default StatsSection;