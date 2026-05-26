import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { useToast } from '../../contexts/ToastContext'
import { ESTADOS, PROMPT_DIAGNOSTICO, SevBadge, EstBadge } from './IncidenciasShared'
import styles from './IncidenciasDetalle.module.css'

function ObservacionesEditor({ initial, onSave }) {
  const [texto, setTexto] = useState(initial || '')
  const [editado, setEditado] = useState(false)
  const { toast } = useToast()
  useEffect(() => { setTexto(initial || ''); setEditado(false) }, [initial])
  const handleSave = () => { onSave(texto); setEditado(false); toast.show('Observación guardada', 'success') }
  return (
    <div>
      <textarea className={styles.textarea} value={texto} rows={3} maxLength={500}
        onChange={e => { setTexto(e.target.value); setEditado(true) }}
        placeholder="Notas de seguimiento..." />
      <div className={styles.editorFooter}>
        <span className={styles.charCount}>{texto.length}/500</span>
        {editado && <Button variant="primary" size="sm" onClick={handleSave}>Guardar observación</Button>}
      </div>
    </div>
  )
}

export default function IncidenciasDetalle({ incidencia, cargandoIA, onCambiarEstado, onGuardarObservacion, onGenerarDiagnostico, onVolver }) {
  const { toast } = useToast()

  const handleCambiarEstado = (estado) => {
    if (incidencia) onCambiarEstado(incidencia.id, estado)
  }

  const handleGuardarObservacion = (texto) => {
    if (incidencia) onGuardarObservacion(incidencia.id, texto)
  }

  const handleGenerarDiagnostico = () => {
    if (incidencia) onGenerarDiagnostico(incidencia)
  }

  return (
    <div>
      <button className={styles.volverBtn} onClick={onVolver}>← Volver a la lista</button>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <span className={styles.idBadge}>INCIDENCIA #{incidencia.id.toString().slice(-4)}</span>
            <div className={styles.title}>{incidencia.equipo}</div>
            <div className={styles.badgeRow}>
              <SevBadge sev={incidencia.severidad} />
              <EstBadge est={incidencia.estado} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Síntoma</div>
          <div className={styles.sectionText}>{incidencia.sintoma}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Cambiar estado</div>
          <div className={styles.estadoRow}>
            {ESTADOS.filter(e => e !== incidencia.estado).map(e => (
              <Button key={e} variant="secondary" size="sm" onClick={() => handleCambiarEstado(e)}>{e}</Button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Observaciones</div>
          <ObservacionesEditor initial={incidencia.observaciones} onSave={handleGuardarObservacion} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Diagnóstico IA</div>
          {!incidencia.diagnostico ? (
            <Button variant="primary" size="md" onClick={handleGenerarDiagnostico} loading={cargandoIA} style={{ width: '100%' }}>
              {cargandoIA ? 'Analizando...' : 'Generar diagnóstico IA'}
            </Button>
          ) : (
            <div className={styles.diagnosticoCard}>
              <div className={styles.diagItem}>
                <div className={styles.diagLabel}>Causa probable</div>
                <div className={styles.diagText}>{incidencia.diagnostico.causa_probable}</div>
              </div>
              <div className={styles.diagItem}>
                <div className={styles.diagLabel}>Pasos de verificación</div>
                <ul className={styles.diagSteps}>
                  {incidencia.diagnostico.pasos_verificacion?.map((item, i) => (
                    <li key={i} className={styles.diagStep}>
                      <span className={styles.diagStepNum}>{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.diagItem}>
                <div className={styles.diagLabel}>Solución</div>
                <div className={styles.diagText}>{incidencia.diagnostico.solucion}</div>
              </div>
              <div className={styles.diagItem}>
                <div className={styles.diagLabel}>Medidas preventivas</div>
                <ul className={styles.diagSteps}>
                  {incidencia.diagnostico.medidas_preventivas?.map((item, i) => (
                    <li key={i} className={styles.diagStep}>
                      <span className={styles.diagStepNum}>{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
