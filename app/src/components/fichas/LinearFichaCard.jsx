import ProductImage from '../ui/ProductImage'
import styles from './LinearFichaCard.module.css'

export default function LinearFichaCard({ refCode, desc, price, specs, actions, image, marca, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.imageWrap}>
        <ProductImage
          src={image}
          alt={refCode || desc}
          marca={marca}
          className={styles.image}
        />
      </div>

      <div className={styles.header}>
        <div>
          <span className={styles.badge}>REFERENCIA</span>
          <div className={styles.refCode}>{refCode}</div>
          {desc && <div className={styles.desc}>{desc}</div>}
        </div>
        {price && (
          <div className={styles.priceBlock}>
            <div className={styles.priceValue}>{price}€</div>
            <div className={styles.priceLabel}>IVA incluido</div>
          </div>
        )}
      </div>

      {specs && specs.length > 0 && (
        <div className={styles.specs}>
          {specs.map(([label, value]) => (
            <div key={label} className={styles.spec}>
              <div className={styles.specLabel}>{label}</div>
              <div className={styles.specValue}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map(({ label, variant = 'primary', icon, onClick }, i) => (
            <button
              key={i}
              className={`${styles.btn} ${variant === 'primary' ? styles.btnPrimary : variant === 'secondary' ? styles.btnSecondary : styles.btnGhost}`}
              onClick={onClick}
            >
              {icon && <span>{icon}</span>}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
