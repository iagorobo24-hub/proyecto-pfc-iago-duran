import styles from './IncidenciasShared.module.css'

export const SEVERIDADES = ['Crítica', 'Alta', 'Media', 'Baja']
export const ESTADOS = ['Abierta', 'En diagnóstico', 'Resuelta', 'Escalada']
export const ZONAS = ['Zona A — Recepción', 'Zona B — Almacén alto', 'Zona C — Picking', 'Zona D — Expedición', 'Zona E — Mantenimiento']

export const PROMPT_DIAGNOSTICO = (inc) =>
  `Eres un técnico de mantenimiento industrial con 15 años de experiencia.\nIncidencia: ${inc.equipo}\nZona: ${inc.zona}\nSíntoma: ${inc.sintoma}\nSeveridad: ${inc.severidad}\n\nResponde con JSON: {"causa_probable":"...","pasos_verificacion":["...","...","..."],"solucion":"...","medidas_preventivas":["...","..."]}`

const SEV_CLS = { 'Crítica': 'critica', 'Alta': 'alta', 'Media': 'media', 'Baja': 'baja' }
const EST_CLS = { 'Abierta': 'abierta', 'En diagnóstico': 'diagnostico', 'Resuelta': 'resuelta', 'Escalada': 'escalada' }

export function SevBadge({ sev }) {
  const cls = styles[`badge--${SEV_CLS[sev] || 'media'}`]
  return <span className={`${styles.badge} ${cls}`}>{sev.toUpperCase()}</span>
}

export function EstBadge({ est }) {
  const cls = styles[`badge--${EST_CLS[est] || 'media'}`]
  return <span className={`${styles.badge} ${cls}`}>{est.toUpperCase()}</span>
}
