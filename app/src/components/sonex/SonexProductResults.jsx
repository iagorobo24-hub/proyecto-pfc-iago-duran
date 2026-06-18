import SonexProductCard from './SonexProductCard'
import styles from '../../tools/Sonex.module.css'

export default function SonexProductResults({
  catalogCards = [],
  externalCards = [],
  onOpenFicha,
  onAddBudget,
  onCopyRef,
}) {
  const hasCatalog = catalogCards.length > 0
  const hasExternal = externalCards.length > 0

  if (!hasCatalog && !hasExternal) return null

  return (
    <div className={styles.catalogResults}>
      {hasCatalog && (
        <section className={styles.catalogSection} aria-label="Productos verificados en catálogo">
          <div className={styles.catalogResultsHeader}>
            <div>
              <h2 className={styles.catalogResultsTitle}>En catálogo</h2>
              <p className={styles.catalogResultsMeta}>{catalogCards.length} referencia{catalogCards.length === 1 ? '' : 's'} verificada{catalogCards.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className={styles.catalogCardsGrid}>
            {catalogCards.map(result => (
              <SonexProductCard
                key={result.product.ref_fabricante || result.product.id}
                result={result}
                onOpenFicha={onOpenFicha}
                onAddBudget={onAddBudget}
                onCopyRef={onCopyRef}
              />
            ))}
          </div>
        </section>
      )}

      {hasExternal && (
        <section className={styles.catalogSection} aria-label="Alternativas fuera del catálogo">
          <div className={styles.catalogResultsHeader}>
            <div>
              <h2 className={styles.catalogResultsTitle}>Alternativas fuera del catálogo</h2>
              <p className={styles.catalogResultsMeta}>No verificadas en base de datos</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
