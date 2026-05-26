import { useState } from 'react'
import styles from './LinearRefCard.module.css'

export default function LinearRefCard({ code, desc, price, onClick, image, className = '' }) {
  const initials = code ? code.slice(0, 2).toUpperCase() : '??'
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <button className={`${styles.card} ${className}`} onClick={onClick}>
      <div className={styles.imageWrap}>
        {showImage ? (
          <img src={image} alt={code} className={styles.image} onError={() => setImgError(true)} />
        ) : (
          <div className={styles.imageFallback}>{initials}</div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.code} title={code}>{code}</div>
        {desc && <div className={styles.desc} title={desc}>{desc}</div>}
      </div>
      {price !== undefined && price !== null && (
        <div className={styles.price}>{typeof price === 'number' ? price.toFixed(2) : price}€</div>
      )}
    </button>
  )
}
