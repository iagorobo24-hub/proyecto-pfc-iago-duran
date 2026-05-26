import Input from '../ui/Input'
import Button from '../ui/Button'
import { SEVERIDADES, ZONAS } from './IncidenciasShared'
import styles from './IncidenciasFormulario.module.css'

export default function IncidenciasFormulario({ form, onChange, onCrear }) {
  const set = (field) => (e) => onChange({ ...form, [field]: e.target.value })

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Registrar nueva incidencia</h3>
      <div className={styles.group}>
        <label className={styles.label}>Equipo / Referencia</label>
        <Input value={form.equipo} onChange={set('equipo')} placeholder="Variador ATV320..." />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Operario que reporta</label>
        <Input value={form.operario} onChange={set('operario')} placeholder="Nombre del operario" />
      </div>
      <div className={styles.row}>
        <div className={styles.group}>
          <label className={styles.label}>Zona</label>
          <select className={styles.select} value={form.zona} onChange={set('zona')}>
            {ZONAS.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Severidad</label>
          <select className={styles.select} value={form.severidad} onChange={set('severidad')}>
            {SEVERIDADES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Síntoma</label>
        <textarea className={styles.textarea} value={form.sintoma} rows={4}
          placeholder="Describe el síntoma con detalle..." onChange={set('sintoma')} />
      </div>
      <Button variant="primary" size="md" onClick={onCrear} style={{ width: '100%' }}>
        Registrar incidencia
      </Button>
    </div>
  )
}
