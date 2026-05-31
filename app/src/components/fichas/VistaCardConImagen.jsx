import styles from './VistaCardConImagen.module.css'

export default function VistaCardConImagen({ badge, name, desc, count, image, onSelect }) {
  return (
    <button
      className={styles.card}
      onClick={() => onSelect?.(name)}
      role="listitem"
      aria-label={`${name}: ${desc}`}
    >
      <div className={styles.card__imageWrap}>
        {image ? (
          <img src={image} alt={name || ''} className={styles.card__image} loading="lazy" />
        ) : (
          <div className={styles.card__imagePlaceholder}>
            <span className={styles.card__imageIcon}>⚡</span>
          </div>
        )}
      </div>
      
      <div className={styles.card__badge}>{badge}</div>
      <div className={styles.card__name}>{name}</div>
      {desc && <div className={styles.card__desc}>{desc}</div>}
      {count !== undefined && count !== null && (
        <div className={styles.card__count}>{count} ref.</div>
      )}
    </button>
  )
}