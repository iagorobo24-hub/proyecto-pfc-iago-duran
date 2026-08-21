import React, { useState } from 'react';
import catalogService from '../../services/catalogService';
import { supabaseConfig } from '../../supabase/config';
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
  const [catalogStats, setCatalogStats] = useState(null);

  React.useEffect(() => {
    if (supabaseConfig.mode !== 'cloud') return;

    let active = true;

    const fetchStats = async () => {
      try {
        const data = await catalogService.getCatalogStats();
        if (!active || !data?.totalProducts) return;

        setCatalogStats({
          totalProducts: parseFloat((data.totalProducts / 1000).toFixed(1)),
          totalFamilies: data.totalFamilies || 0,
          totalBrands: data.totalBrands || 0
        });
      } catch {
        // Las métricas cloud se omiten si no se pueden verificar.
      }
    };

    fetchStats();
    return () => { active = false; };
  }, []);

  const statsData = [
    { label: "Herramientas Integradas", value: 7, suffix: "" },
    ...(catalogStats ? [
      { label: "Referencias en Catálogo", value: catalogStats.totalProducts, suffix: "k+" },
      { label: "Familias en DB", value: catalogStats.totalFamilies, suffix: "" },
      { label: "Marcas Disponibles", value: catalogStats.totalBrands, suffix: "+" }
    ] : [])
  ];

  return (
    <section className={styles.statsWrapper}>
      {statsData.map((stat) => (
        <div key={stat.label} className={styles.statItem}>
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