import { useState } from 'react'
import styles from './LinearRefCard.module.css'

export default function LinearRefCard({ code, desc, price, onClick, image, marca, className = '' }) {
  const initials = code ? code.slice(0, 2).toUpperCase() : '??'
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <button className={`${styles.card} ${className}`} onClick={onClick}>
      <div className={styles.imageWrap}>
        {showImage ? (
          <>
            <img src={image} alt={code} className={styles.image} onError={() => setImgError(true)} />
            <span className={styles.badge}>REF</span>
          </>
        ) : (
          <div className={styles.imageFallback}>{initials}</div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.code} title={code}>{code}</div>
        {desc && <div className={styles.desc} title={desc}>{desc}</div>}
        {marca && <span className={styles.marca}>{marca}</span>}
      </div>
      <div className={styles.footer}>
        {price !== undefined && price !== null && (
          <span className={styles.price}>{typeof price === 'number' ? price.toFixed(2) : price}€</span>
        )}
        <span className={styles.action} aria-hidden="true">→</span>
      </div>
    </button>
  )
}
