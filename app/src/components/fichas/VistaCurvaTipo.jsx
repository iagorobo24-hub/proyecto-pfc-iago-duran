import { CURVA_DESC, TIPO_DIFERENCIAL_DESC } from '../../hooks/useProductTable'
import styles from '../../tools/FichasTecnicas.module.css'

export default function VistaCurvaTipo({ mode, curvas, tipos, counts, onSelect }) {
  if (mode === 'magneto') {
    return (
      <div className={styles.vistaGrid} role="list" aria-label="Selección de curva">
        {curvas.map(curva => (
          <button
            key={curva}
            className={styles.vistaCard}
            onClick={() => onSelect(curva)}
            role="listitem"
            aria-label={`Curva ${curva}: ${CURVA_DESC[curva] || ''}`}
          >
            <div className={styles.vistaCard__badge}>{curva}</div>
            <div className={styles.vistaCard__name}>Curva {curva}</div>
            <div className={styles.vistaCard__desc}>{CURVA_DESC[curva] || ''}</div>
            {counts?.[curva] && (
              <div className={styles.vistaCard__count}>{counts[curva]} ref.</div>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.vistaGrid} role="list" aria-label="Selección de tipo diferencial">
      {tipos.map(tipo => (
        <button
          key={tipo}
          className={styles.vistaCard}
          onClick={() => onSelect(tipo)}
          role="listitem"
          aria-label={`Tipo ${tipo}: ${TIPO_DIFERENCIAL_DESC[tipo] || ''}`}
        >
          <div className={styles.vistaCard__badge}>{tipo}</div>
          <div className={styles.vistaCard__name}>Tipo {tipo}</div>
          <div className={styles.vistaCard__desc}>{TIPO_DIFERENCIAL_DESC[tipo] || ''}</div>
          {counts?.[tipo] && (
            <div className={styles.vistaCard__count}>{counts[tipo]} ref.</div>
          )}
        </button>
      ))}
    </div>
  )
}
