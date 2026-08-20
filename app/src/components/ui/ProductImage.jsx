/* eslint-disable react-hooks/set-state-in-effect -- image fallback state must reset when src changes */
import { useState, useEffect } from 'react'
import { getBrandLogoData } from '../../services/brandService'
import styles from './ProductImage.module.css'

export default function ProductImage({ src, alt, marca, className = '', fallbackClassName = '', style = {}, onError }) {
  const [imgError, setImgError] = useState(false)
  
  // Reset error state if the product image source changes (e.g. when paginating or selecting another product)
  useEffect(() => {
    setImgError(false)
  }, [src])

  const brandData = getBrandLogoData(marca)
  const showMainImage = src && !imgError

  if (showMainImage) {
    return (
      <img
        src={src}
        alt={alt || `Imagen de ${marca || 'producto'}`}
        className={className}
        style={style}
        loading="lazy"
        onError={() => {
          setImgError(true)
          if (onError) onError()
        }}
      />
    )
  }

  // Fallback 1: Show the manufacturer's logo
  if (brandData.logo) {
    return (
      <img
        src={brandData.logo}
        alt={`Logo de ${marca}`}
        className={`${className} ${styles.brandLogo}`}
        style={{ ...style, objectFit: 'contain', padding: '12px' }}
      />
    )
  }

  // Fallback 2: Show the brand's initials with its calculated gradient background
  return (
    <div
      className={`${fallbackClassName || styles.initialsFallback} ${className}`}
      style={{
        ...style,
        background: brandData.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '1.75rem',
        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        width: '100%',
        height: '100%'
      }}
    >
      {brandData.initials}
    </div>
  )
}
