import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { SEVERIDADES, ZONAS } from './IncidenciasShared'
import styles from './IncidenciasFormulario.module.css'

export default function IncidenciasFormulario({ form, onChange, onCrear }) {
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => { onChange({ ...form, [field]: e.target.value }); if (errors[field]) setErrors(prev => ({ ...prev, [field]: null })) }

  const handleSubmit = () => {
    const newErrors = {}
    if (!form.equipo?.trim()) newErrors.equipo = 'El equipo es obligatorio'
    if (!form.operario?.trim()) newErrors.operario = 'El operario es obligatorio'
    if (!form.sintoma?.trim()) newErrors.sintoma = 'El síntoma es obligatorio'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    onCrear()
  }

  const isValid = form.equipo?.trim() && form.operario?.trim() && form.sintoma?.trim()

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Registrar nueva incidencia</h3>
      <div className={styles.group}>
        <label className={styles.label}>Equipo / Referencia <span style={{ color: 'var(--error)' }}>*</span></label>
        <Input value={form.equipo} onChange={set('equipo')} placeholder="Variador ATV320..." style={errors.equipo ? { borderColor: 'var(--error)' } : {}} />
        {errors.equipo && <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>{errors.equipo}</span>}
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Operario que reporta <span style={{ color: 'var(--error)' }}>*</span></label>
        <Input value={form.operario} onChange={set('operario')} placeholder="Nombre del operario" style={errors.operario ? { borderColor: 'var(--error)' } : {}} />
        {errors.operario && <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>{errors.operario}</span>}
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
        <label className={styles.label}>Síntoma <span style={{ color: 'var(--error)' }}>*</span></label>
        <textarea className={styles.textarea} value={form.sintoma} rows={4}
          placeholder="Describe el síntoma con detalle..." onChange={set('sintoma')} style={errors.sintoma ? { borderColor: 'var(--error)' } : {}} />
        {errors.sintoma && <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>{errors.sintoma}</span>}
      </div>
      <Button variant="primary" size="md" onClick={handleSubmit} style={{ width: '100%' }} disabled={!isValid}>
        Registrar incidencia
      </Button>
    </div>
  )
}
