import { useState, useEffect, useRef } from 'react';
import useMemoriaUsuario from '../hooks/useMemoriaUsuario';
import IncidenciasLista from '../components/incidencias/IncidenciasLista';
import IncidenciasDetalle from '../components/incidencias/IncidenciasDetalle';
import IncidenciasFormulario from '../components/incidencias/IncidenciasFormulario';
import { generarPDFResumenIncidencias } from '../utils/pdfGenerator';
import styles from './DashboardIncidencias.module.css';

export default function DashboardIncidencias() {
  const memoria = useMemoriaUsuario()
  const [incidencias, setIncidencias] = memoria.incidencias.listado.use()
  const [filtroEstado, setFiltroEstado] = useState('Todas')
  const [filtroSev, setFiltroSev] = useState('Todas')
  const [seleccionada, setSeleccionada] = useState(null)
  const [mostrandoDetalle, setMostrandoDetalle] = useState(false)
  const [modo, setModo] = useState('lista')
  const [form, setForm] = useState({ equipo: '', zona: 'Zona A — Recepción', operario: '', sintoma: '', severidad: 'Media' })
  const [cargandoIA, setCargandoIA] = useState(false)
  const [ahora, setAhora] = useState(Date.now())
  const [exportandoPDF, setExportandoPDF] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => { const t = setInterval(() => setAhora(Date.now()), 30000); return () => clearInterval(t) }, [])

  const guardar = (data) => setIncidencias(data)

  const kpis = {
    criticas: incidencias.filter(i => i.severidad === 'Crítica' && i.estado !== 'Resuelta').length,
    abiertas: incidencias.filter(i => i.estado === 'Abierta').length,
    enDiag: incidencias.filter(i => i.estado === 'En diagnóstico').length,
    resueltas: incidencias.filter(i => i.estado === 'Resuelta').length,
  }

  const criticas = incidencias.filter(i =>
    i.severidad === 'Crítica' && i.estado !== 'Resuelta' && (ahora - i.fechaCreacion) > 7200000
  )

  const formatTiempo = (ts) => {
    const min = Math.floor((ahora - ts) / 60000)
    if (min < 60) return `Hace ${min}m`
    const h = Math.floor(min / 60)
    if (h < 24) return `Hace ${h}h`
    return `Hace ${Math.floor(h / 24)}d`
  }

  const cambiarEstado = (id, nuevoEstado) => {
    const data = incidencias.map(i =>
      i.id === id ? { ...i, estado: nuevoEstado, fechaResolucion: nuevoEstado === 'Resuelta' ? Date.now() : i.fechaResolucion } : i
    )
    guardar(data)
    if (seleccionada?.id === id) setSeleccionada(data.find(i => i.id === id))
  }

  const guardarObservacion = (id, texto) => {
    const data = incidencias.map(i => i.id === id ? { ...i, observaciones: texto } : i)
    guardar(data)
    if (seleccionada?.id === id) setSeleccionada(data.find(i => i.id === id))
  }

  const crearIncidencia = () => {
    if (!form.equipo || !form.operario || !form.sintoma) return
    const nueva = { ...form, id: Date.now(), estado: 'Abierta', fechaCreacion: Date.now(), fechaResolucion: null, observaciones: '', diagnostico: null }
    guardar([nueva, ...incidencias])
    setForm({ equipo: '', zona: 'Zona A — Recepción', operario: '', sintoma: '', severidad: 'Media' })
    setModo('lista')
  }

  const generarDiagnostico = async (inc) => {
    setCargandoIA(true)
    try {
      const { callAnthropicAI, parseAIJsonResponse } = await import('../services/anthropicService')
      const { text } = await callAnthropicAI({
        model: 'anthropic/claude-3.5-haiku', max_tokens: 1000,
        system: `Eres un técnico de mantenimiento industrial con 15 años de experiencia.\nIncidencia: ${inc.equipo}\nZona: ${inc.zona}\nSíntoma: ${inc.sintoma}\nSeveridad: ${inc.severidad}\n\nResponde con JSON: {"causa_probable":"...","pasos_verificacion":["...","...","..."],"solucion":"...","medidas_preventivas":["...","..."]}`,
        messages: [{ role: 'user', content: 'Diagnostica esta incidencia.' }],
      })
      const diag = parseAIJsonResponse(text, p => p.causa_probable && p.pasos_verificacion)
      if (!diag || diag.error) { setCargandoIA(false); return }
      const updated = incidencias.map(i =>
        i.id === inc.id ? { ...i, diagnostico: diag, estado: i.estado === 'Abierta' ? 'En diagnóstico' : i.estado } : i
      )
      guardar(updated)
      setSeleccionada(updated.find(i => i.id === inc.id))
    } catch { /* ignore */ }
    setCargandoIA(false)
  }

  const mostrarDetalle = (inc) => { setSeleccionada(inc); setMostrandoDetalle(true) }
  const ocultarDetalle = () => { setSeleccionada(null); setMostrandoDetalle(false) }

  const exportarPDF = async () => {
    setExportandoPDF(true)
    try {
      await generarPDFResumenIncidencias(incidencias)
    } catch (err) {
      console.error('Error exportando PDF:', err)
    }
    setExportandoPDF(false)
  }

  const hasIncidencias = incidencias.length > 0

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.main__content} ref={contentRef}>
          <div className={styles.pageHeader}>
            <div className={styles.pageHeader__inner}>
              <span className={styles.pageHeader__icon}>🛡️</span>
              <h1 className={styles.pageTitle}>Dashboard Incidencias</h1>
            </div>
            <p className={styles.pageSubtitle}>Registra, diagnostica y resuelve incidencias de equipos industriales</p>
          </div>

          <div className={styles.tabsWrap}>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewToggle__btn} ${modo === 'lista' ? styles['viewToggle__btn--active'] : ''}`}
                onClick={() => setModo('lista')}>Lista</button>
              <button className={`${styles.viewToggle__btn} ${modo === 'nueva' ? styles['viewToggle__btn--active'] : ''}`}
                onClick={() => setModo('nueva')}>Nueva</button>
              {hasIncidencias && (
                <button
                  className={styles.viewToggle__btn}
                  onClick={exportarPDF}
                  disabled={exportandoPDF}
                  title="Exportar informe PDF"
                >
                  {exportandoPDF ? '...' : '📄 PDF'}
                </button>
              )}
            </div>
          </div>

          {criticas.length > 0 && (
            <div className={styles.alertBanner}>
              <div className={styles.alertBanner__title}>
                ⚠ {criticas.length} incidencia{criticas.length > 1 ? 's' : ''} crítica{criticas.length > 1 ? 's' : ''} sin atender +2h
              </div>
              <div className={styles.alertBanner__text}>
                {criticas.map(i => i.equipo.split('—')[0].trim()).join(' · ')}
              </div>
            </div>
          )}

          <div className={styles.kpiGrid}>
            {[
              { label: 'Críticas', valor: kpis.criticas, cls: kpis.criticas > 0 ? 'kpiCard--critico' : '' },
              { label: 'Abiertas', valor: kpis.abiertas },
              { label: 'Diagnóstico', valor: kpis.enDiag },
              { label: 'Resueltas', valor: kpis.resueltas },
            ].map(({ label, valor, cls }) => (
              <div key={label} className={`${styles.kpiCard} ${cls || ''}`}>
                <div className={styles.kpiCard__value}>{valor}</div>
                <div className={styles.kpiCard__label}>{label}</div>
              </div>
            ))}
          </div>

          {modo === 'nueva' && (
            <IncidenciasFormulario form={form} onChange={setForm} onCrear={crearIncidencia} />
          )}

          {modo === 'lista' && !mostrandoDetalle && hasIncidencias && (
            <IncidenciasLista
              incidencias={incidencias}
              filtroEstado={filtroEstado}
              filtroSev={filtroSev}
              onFiltroEstado={setFiltroEstado}
              onFiltroSev={setFiltroSev}
              onSeleccionar={mostrarDetalle}
              formatTiempo={formatTiempo}
            />
          )}

          {modo === 'lista' && mostrandoDetalle && seleccionada && (
            <IncidenciasDetalle
              incidencia={seleccionada}
              cargandoIA={cargandoIA}
              onCambiarEstado={cambiarEstado}
              onGuardarObservacion={guardarObservacion}
              onGenerarDiagnostico={generarDiagnostico}
              onVolver={ocultarDetalle}
            />
          )}

          {modo === 'lista' && !hasIncidencias && (
            <div className={styles.emptyStateFinal}>
              <div className={styles.emptyStateFinal__icon}>🛡️</div>
              <div className={styles.emptyStateFinal__title}>Sin incidencias</div>
              <div className={styles.emptyStateFinal__text}>
                No hay incidencias registradas. Crea una nueva o cambia a la pestaña "Nueva".
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
