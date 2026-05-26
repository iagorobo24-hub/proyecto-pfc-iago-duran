import { SENSIBILIDAD_DESC } from '../../hooks/useProductTable'
import styles from '../../tools/FichasTecnicas.module.css'

export default function VistaCalibre({ mode, calibres, sensibilidades, counts, onSelect }) {
  if (mode === 'magneto') {
    return (
      <div className={styles.vistaGrid} role="list" aria-label="Selección de calibre">
        {calibres.map(cal => (
          <button
            key={cal}
            className={styles.vistaCard}
            onClick={() => onSelect(cal)}
            role="listitem"
            aria-label={`${cal} A`}
          >
            <div className={styles.vistaCard__badge}>{cal}</div>
            <div className={styles.vistaCard__name}>{cal} A</div>
            <div className={styles.vistaCard__desc}>Calibre</div>
            {counts?.[cal] && (
              <div className={styles.vistaCard__count}>{counts[cal]} ref.</div>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.vistaGrid} role="list" aria-label="Selección de sensibilidad">
      {sensibilidades.map(sens => (
        <button
          key={sens}
          className={styles.vistaCard}
          onClick={() => onSelect(sens)}
          role="listitem"
          aria-label={`${sens} mA`}
        >
          <div className={styles.vistaCard__badge}>{sens}</div>
          <div className={styles.vistaCard__name}>{sens} mA</div>
          <div className={styles.vistaCard__desc}>{SENSIBILIDAD_DESC[sens] || ''}</div>
          {counts?.[sens] && (
            <div className={styles.vistaCard__count}>{counts[sens]} ref.</div>
          )}
        </button>
      ))}
    </div>
  )
}
