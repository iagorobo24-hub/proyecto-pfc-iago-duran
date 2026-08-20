import React from 'react';
import { motion } from 'framer-motion';
import {
  BookText,
  Calculator,
  Cpu,
  FileSpreadsheet,
  Package,
  Database,
  FileDown,
  Zap
} from 'lucide-react';
import styles from './styles/FeaturesMini.module.css';

const FeaturesMini = () => {
  const features = [
    {
      title: 'Asistente SONEX',
      desc: 'Consultas técnicas asistidas por IA con contexto del catálogo.',
      icon: <Cpu size={20} />
    },
    {
      title: 'Catálogo técnico',
      desc: 'Referencias clasificadas por familias, marcas y categorías.',
      icon: <BookText size={20} />
    },
    {
      title: 'KPI Logístico',
      desc: 'Seis indicadores operativos, histórico y visualización gráfica.',
      icon: <Calculator size={20} />
    },
    {
      title: 'Presupuestos',
      desc: 'Generación de presupuestos con referencias del catálogo.',
      icon: <FileSpreadsheet size={20} />
    },
    {
      title: 'Simulador de Almacén',
      desc: 'Flujo interactivo desde recepción hasta expedición.',
      icon: <Package size={20} />
    },
    {
      title: 'Persistencia cloud',
      desc: 'PostgreSQL en Supabase para datos y sesiones de usuario.',
      icon: <Database size={20} />
    },
    {
      title: 'Exportación PDF',
      desc: 'Generación de documentos desde los módulos que lo requieren.',
      icon: <FileDown size={20} />
    },
    {
      title: 'Despliegue continuo',
      desc: 'SPA y funciones serverless desplegadas mediante Vercel.',
      icon: <Zap size={20} />
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      className={styles.featuresWrapper}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className={styles.featureCard}
          variants={item}
        >
          <div className={styles.iconWrapper}>
            {feature.icon}
          </div>
          <h3 className={styles.featureTitle}>{feature.title}</h3>
          <p className={styles.featureDesc}>{feature.desc}</p>
        </motion.div>
      ))}
    </motion.section>
  );
};

export default FeaturesMini;
