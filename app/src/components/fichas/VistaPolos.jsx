import styles from '../../tools/FichasTecnicas.module.css'

export default function VistaPolos({ polos, counts, onSelect }) {
  return (
    <div className={styles.vistaGrid} role="list" aria-label="Selección de polos">
      {polos.map(polo => (
        <button
          key={polo}
          className={styles.vistaCard}
          onClick={() => onSelect(polo)}
          role="listitem"
          aria-label={`${polo}`}
        >
          <div className={styles.vistaCard__badge}>{polo}</div>
          <div className={styles.vistaCard__name}>{polo}</div>
          <div className={styles.vistaCard__desc}>polos</div>
          {counts?.[polo] && (
            <div className={styles.vistaCard__count}>{counts[polo]} ref.</div>
          )}
        </button>
      ))}
    </div>
  )
}
