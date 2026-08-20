import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, BarChart3, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './styles/HowItWorks.module.css';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Elige tu herramienta',
      desc: 'Explora 7 herramientas integradas: fichas técnicas, SONEX, KPIs, simulador, incidencias, presupuestos y formación.',
      icon: <MousePointerClick size={28} />,
      link: '/app',
      linkText: 'Ver herramientas'
    },
    {
      step: '02',
      title: 'Consulta y analiza',
      desc: 'Navega por el catálogo técnico clasificado, pide ayuda a SONEX o analiza métricas logísticas desde el mismo entorno.',
      icon: <BarChart3 size={28} />,
      link: '/app/fichas',
      linkText: 'Explorar catálogo'
    },
    {
      step: '03',
      title: 'Exporta resultados',
      desc: 'Genera presupuestos e informes en PDF y conserva el resultado de los flujos que lo requieren.',
      icon: <FileDown size={28} />,
      link: '/app/presupuestos',
      linkText: 'Crear presupuesto'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Proceso simple</span>
          <h2 className={styles.title}>¿Cómo funciona?</h2>
          <p className={styles.subtitle}>
            Tres pasos para empezar a trabajar con las herramientas del proyecto.
          </p>
        </motion.header>

        <motion.div
          className={styles.stepsGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((s, i) => (
            <motion.div key={i} className={styles.stepCard} variants={item}>
              <div className={styles.stepNumber}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              <Link to={s.link} className={styles.stepLink}>
                {s.linkText} →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
