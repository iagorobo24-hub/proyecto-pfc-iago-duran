import React from 'react'
import styles from '../../tools/FichasTecnicas.module.css'
import { sanitizeUrl } from '../../services/anthropicService'
import LinearFichaCard from './LinearFichaCard'
import { TipCard } from '../ui/CircleLayout'

const getUrlFabricante = (prod) => {
  if (!prod) return null
  const docPagina = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('pagina') || d.nombre?.toLowerCase().includes('enlace'))
  if (docPagina?.url) return docPagina.url
  const docFicha = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('hoja') || d.url?.includes('prysmiangroup') || d.url?.includes('generalcable'))
  if (docFicha?.url) return docFicha.url
  return prod.pdf_url || prod.pdfUrl
}

const abrirPDF = (url) => {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

export default function StepFicha({
  referencia,
  aiFicha,
  aiCargando,
  onCopiarReferencia,
  onAnadirPresupuesto,
}) {
  const fichaDesc = referencia.name || referencia.desc || ''

  return (
    <div className={styles.linearLayout}>
      <article className={styles.fichaSection} aria-label={`Detalles de ${fichaDesc}`}>
        <LinearFichaCard
          refCode={referencia.ref_fabricante || referencia.ref}
          desc={fichaDesc}
          price={referencia.precio}
          image={referencia.imagen}
          specs={[
            ['Marca', referencia.marca],
            ['Familia', referencia.familia],
            ['Gama', referencia.subfamilia || referencia.gama],
            ['Tipo', referencia.tipo],
          ]}
          actions={[
            { label: 'Copiar referencia', variant: 'primary', onClick: () => onCopiarReferencia(referencia.ref_fabricante || referencia.ref) },
            { label: 'Ficha fabricante', variant: 'secondary', onClick: () => abrirPDF(getUrlFabricante(referencia)) },
            { label: 'Presupuesto', variant: 'secondary', onClick: () => onAnadirPresupuesto(referencia) },
          ]}
        />

        {aiCargando && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
            Buscando información técnica...
          </div>
        )}

        {aiFicha && (
          <div className={styles.aiInfo}>
            {aiFicha.caracteristicas && aiFicha.caracteristicas.length > 0 && (
              <div className={styles.aiInfo__block}>
                <h3 className={styles.aiInfo__title}>Características Técnicas</h3>
                <ul className={styles.aiInfo__list}>
                  {aiFicha.caracteristicas.map((c, i) => (
                    <li key={i} className={styles.aiInfo__item}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiFicha.aplicaciones && aiFicha.aplicaciones.length > 0 && (
              <div className={styles.aiInfo__block}>
                <h3 className={styles.aiInfo__title}>Aplicaciones</h3>
                <ul className={styles.aiInfo__list}>
                  {aiFicha.aplicaciones.map((a, i) => (
                    <li key={i} className={styles.aiInfo__item}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiFicha.normas && aiFicha.normas.length > 0 && (
              <div className={styles.aiInfo__block}>
                <h3 className={styles.aiInfo__title}>Normas</h3>
                <ul className={styles.aiInfo__list}>
                  {aiFicha.normas.map((n, i) => (
                    <li key={i} className={styles.aiInfo__item}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiFicha.url_manual && (
              <div className={styles.aiInfo__block}>
                <h3 className={styles.aiInfo__title}>Manual / Documentación</h3>
                <a href={sanitizeUrl(aiFicha.url_manual)} target="_blank" rel="noopener noreferrer" className={styles.aiInfo__link}>
                  {aiFicha.url_manual}
                </a>
              </div>
            )}

            {aiFicha.consejo_tecnico && (
              <TipCard text={aiFicha.consejo_tecnico} />
            )}
          </div>
        )}

        {!aiCargando && !aiFicha && (
          <TipCard text={`Producto: ${fichaDesc}. Marca: ${referencia.marca || ''}. Verificado por Proyectos PFC Tools.`} />
        )}
      </article>
    </div>
  )
}