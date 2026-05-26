import Button from '../ui/Button'
import styles from '../../tools/SimuladorAlmacen.module.css'

export default function SimuladorPerfil({ operario, setOperario, guardarPerfil }) {
  return (
    <div className={styles.circleLayout}>
      <div className={styles.formCard}>
        <div className={styles.formCard__header}>
          <div className={styles.formCard__icon} aria-hidden="true">👤</div>
          <h2 className={styles.formCard__title}>Perfil del operario</h2>
          <p className={styles.formCard__subtitle}>Introduce tus datos para comenzar la simulación</p>
        </div>
        <div className={styles.formCard__group}>
          <label className={styles.formCard__label} htmlFor="sim-nombre">Nombre</label>
          <input
            id="sim-nombre"
            className={styles.formCard__input}
            value={operario.nombre}
            onChange={e => setOperario(p => ({ ...p, nombre: e.target.value }))}
            placeholder="Tu nombre"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label} htmlFor="sim-turno">Turno</label>
            <select
              id="sim-turno"
              className={styles.formCard__select}
              value={operario.turno}
              onChange={e => setOperario(p => ({ ...p, turno: e.target.value }))}
            >
              <option>Mañana</option><option>Tarde</option><option>Noche</option>
            </select>
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label} htmlFor="sim-area">Área</label>
            <select
              id="sim-area"
              className={styles.formCard__select}
              value={operario.area}
              onChange={e => setOperario(p => ({ ...p, area: e.target.value }))}
            >
              <option>Almacén</option><option>Expedición</option><option>Recepción</option>
            </select>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={guardarPerfil} className={styles.formCard__btn}>
          Iniciar simulación →
        </Button>
      </div>
    </div>
  )
}
