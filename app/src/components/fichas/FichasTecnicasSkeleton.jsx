import styles from './FichasTecnicasSkeleton.module.css'

export function SkeletonCard({ type = 'brand' }) {
  const style = {
    background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%)',
    backgroundSize: '200% 100%',
    animation: `${styles.shimmer} 1.5s infinite`,
    borderRadius: '12px',
  }

  if (type === 'brand') return <div style={{ ...style, width: '120px', height: '140px' }} aria-hidden="true" />
  if (type === 'gama') return <div style={{ ...style, width: '100%', height: '60px', marginBottom: '12px' }} aria-hidden="true" />
  if (type === 'ref') return <div style={{ ...style, width: '180px', height: '100px' }} aria-hidden="true" />
  return <div style={{ ...style, width: '100%', height: '200px' }} aria-hidden="true" />
}

export default function FichasTecnicasSkeleton({ paso }) {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Cargando catálogo...</span>
      <div className={styles.ring} />
      <div className={styles.rows}>
        <div className={styles.row}>
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
        </div>
        <div className={styles.row}>
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
        </div>
      </div>
    </div>
  )
}
