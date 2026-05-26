import { SEVERIDADES, ESTADOS, SevBadge, EstBadge } from './IncidenciasShared'
import styles from './IncidenciasLista.module.css'

export default function IncidenciasLista({ incidencias, filtroEstado, filtroSev, onFiltroEstado, onFiltroSev, onSeleccionar, formatTiempo }) {
  const filtradas = incidencias.filter(i =>
    (filtroEstado === 'Todas' || i.estado === filtroEstado) &&
    (filtroSev === 'Todas' || i.severidad === filtroSev)
  )

  return (
    <div>
      <div className={styles.filtrosBlock}>
        <div className={styles.filtroGrupo}>
          <div className={styles.filtroGrupo__titulo}>Estado</div>
          <div className={styles.filtroChips}>
            {['Todas', ...ESTADOS].map(e => (
              <button
                key={e}
                className={`${styles.filtroChip} ${filtroEstado === e ? styles['filtroChip--active'] : ''}`}
                onClick={() => onFiltroEstado(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filtroGrupo}>
          <div className={styles.filtroGrupo__titulo}>Severidad</div>
          <div className={styles.filtroChips}>
            {['Todas', ...SEVERIDADES].map(s => (
              <button
                key={s}
                className={`${styles.filtroChip} ${filtroSev === s ? styles['filtroChip--active'] : ''}`}
                onClick={() => onFiltroSev(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.incidenciasList}>
        {filtradas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyState__icon}>🔍</div>
            <div className={styles.emptyState__title}>Sin incidencias</div>
            <div className={styles.emptyState__text}>No hay incidencias con estos filtros</div>
          </div>
        ) : (
          filtradas.map(inc => (
            <button
              key={inc.id}
              className={styles.incidenciaItem}
              onClick={() => onSeleccionar(inc)}
            >
              <div className={styles.incidenciaItem__info}>
                <div className={styles.incidenciaItem__equipo}>{inc.equipo}</div>
                <div className={styles.incidenciaItem__sintoma}>{inc.sintoma.slice(0, 80)}{inc.sintoma.length > 80 ? '...' : ''}</div>
                <div className={styles.incidenciaItem__meta}>{inc.zona.split('—')[0].trim()} · {formatTiempo(inc.fechaCreacion)}</div>
              </div>
              <div className={styles.incidenciaItem__badges}>
                <SevBadge sev={inc.severidad} />
                <EstBadge est={inc.estado} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
