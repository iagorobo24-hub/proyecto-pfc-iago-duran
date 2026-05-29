import styles from '../../tools/FichasTecnicas.module.css'

export default function VistaFramework({ frameworks, counts, description, onSelect }) {
  return (
    <div className={styles.vistaGrid} role="list" aria-label="Selección de framework">
      {frameworks.map(fw => (
        <button
          key={fw}
          className={styles.vistaCard}
          onClick={() => onSelect(fw)}
          role="listitem"
          aria-label={`Framework ${fw}: ${description?.[fw] || ''}`}
        >
          <div className={styles.vistaCard__badge}>{fw.replace('NSX', '')}</div>
          <div className={styles.vistaCard__name}>NSX{fw}</div>
          <div className={styles.vistaCard__desc}>
            {description?.[fw] || 'Interruptor caja moldeada'}
          </div>
          {counts?.[fw] && (
            <div className={styles.vistaCard__count}>{counts[fw]} ref.</div>
          )}
        </button>
      ))}
    </div>
  )
}