import { useState, useEffect } from 'react'
import ProductImage from '../ui/ProductImage'
import styles from './LinearRefCard.module.css'

export default function LinearRefCard({ code, desc, price, onClick, image, marca, className = '' }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [image])

  return (
    <button className={`${styles.card} ${className}`} onClick={onClick}>
      <div className={styles.imageWrap}>
        <ProductImage
          src={image}
          alt={code}
          marca={marca}
          className={styles.image}
          fallbackClassName={styles.imageFallback}
          onError={() => setImgError(true)}
        />
        {image && !imgError && <span className={styles.badge}>REF</span>}
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
