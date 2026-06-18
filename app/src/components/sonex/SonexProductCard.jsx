import { CheckCircle2, Clipboard, FilePlus2, FileText, Tag } from 'lucide-react'
import ProductImage from '../ui/ProductImage'
import styles from '../../tools/Sonex.module.css'

const MATCH_LABELS = {
  exact: 'Exacta',
  partial: 'Parcial',
  related: 'Relacionada',
}

function getRef(product) {
  return product?.ref_fabricante || product?.ref || ''
}

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return ''
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)
}

export default function SonexProductCard({ result, onOpenFicha, onAddBudget, onCopyRef }) {
  const product = result.product
  const reference = getRef(product)
  const price = formatPrice(product.precio)

  return (
    <article className={styles.productCard} data-match={result.matchType} data-testid="sonex-product-card">
      <div className={styles.productCardImageWrap}>
        <ProductImage
          src={product.imagen}
          alt={product.name}
          marca={product.marca}
          className={styles.productCardImage}
          fallbackClassName={styles.productCardImageFallback}
        />
      </div>

      <div className={styles.productCardBody}>
        <div className={styles.productCardTopline}>
          <span className={`${styles.matchBadge} ${styles[`matchBadge--${result.matchType}`] || ''}`}>
            <CheckCircle2 size={14} aria-hidden="true" />
            {MATCH_LABELS[result.matchType] || 'Relacionada'}
          </span>
          {price && <span className={styles.productPrice}>{price}</span>}
        </div>

        <h3 className={styles.productTitle}>{product.name}</h3>

        <div className={styles.productMeta}>
          <span className={styles.productRef} data-testid="sonex-product-ref">{reference}</span>
          {product.marca && <span>{product.marca}</span>}
        </div>

        <div className={styles.productTaxonomy}>
          {[product.familia, product.subfamilia, product.Gama || product.Subgama].filter(Boolean).join(' · ')}
        </div>

        {result.matchedSpecs.length > 0 && (
          <div className={styles.specBadges} aria-label="Características coincidentes">
            {result.matchedSpecs.slice(0, 5).map(spec => (
              <span key={spec} className={styles.specBadge}>
                <Tag size={12} aria-hidden="true" />
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className={styles.productActions}>
          <button type="button" className={styles.productActionPrimary} onClick={() => onOpenFicha(product)} data-testid="sonex-open-ficha">
            <FileText size={16} aria-hidden="true" />
            Ver ficha
          </button>
          <button type="button" className={styles.productAction} onClick={() => onAddBudget(product)} data-testid="sonex-add-budget">
            <FilePlus2 size={16} aria-hidden="true" />
            Añadir
          </button>
          <button type="button" className={styles.productActionIcon} onClick={() => onCopyRef(reference)} aria-label={`Copiar referencia ${reference}`}>
            <Clipboard size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
