import React, { useState } from 'react'
import { getBrandLogoData } from '../../services/brandService'
import { getEtiquetaSubcategoria, getCategoriaMeta } from '../../data/categories'
import Button from '../ui/Button'
import FichasTecnicasSkeleton from './FichasTecnicasSkeleton'
import StepReferencias from './StepReferencias'
import StepFicha from './StepFicha'
import styles from '../../tools/FichasTecnicas.module.css'

const renderHeader = (icon, title, desc) => (
  <div className={styles.linearHeader}>
    {icon && <div className={styles.linearHeader__icon}>{icon}</div>}
    {title && <div className={styles.linearHeader__title}>{title}</div>}
    {desc && <div className={styles.linearHeader__desc}>{desc}</div>}
  </div>
)

function FichasTecnicasContent({
  paso,
  categoria,
  marca,
  gamaComercial,
  subgama,
  gama,
  tipo,
  categoriaGrupo,
  subcategoria,
  grupos,
  referencia,
  categorias,
  marcasDisponibles,
  gamasDisponibles,
  tiposDisponibles,
  gamasComercialesDisponibles,
  subgamasDisponibles,
  referenciasDisponibles,
  aiFicha,
  aiCargando,
  isCargando,
  resultado,
  error,
  resultadosBusqueda,
  modo,
  catInfo,
  onSeleccionarMarca,
  onSeleccionarGama,
  onSeleccionarTipo,
  onSeleccionarCategoriaGrupo,
  onSeleccionarSubcategoria,
  onSeleccionarGamaComercial,
  onSeleccionarSubgama,
  onSeleccionarReferencia,
  onCopiarReferencia,
  onAnadirPresupuesto,
}) {
  const [vistas, setVistas] = useState({ framework: null, curva: null, tipo: null, polos: null, calibre: null, sensibilidad: null })
  const setVistaFramework = (v) => setVistas(prev => ({ ...prev, framework: v }))
  const setVistaCurva = (v) => setVistas(prev => ({ ...prev, curva: v }))
  const setVistaTipo = (v) => setVistas(prev => ({ ...prev, tipo: v }))
  const setVistaPolos = (v) => setVistas(prev => ({ ...prev, polos: v }))
  const setVistaCalibre = (v) => setVistas(prev => ({ ...prev, calibre: v }))
  const setVistaSensibilidad = (v) => setVistas(prev => ({ ...prev, sensibilidad: v }))

  // ── Resultados de búsqueda ──────────────────────────────────────────────────
  if (resultadosBusqueda && resultadosBusqueda.length > 0) {
    return (
      <div className={styles.linearLayout}>
        <div className={styles.sectionHeader}>
          <span className={`${styles.label} ${styles['label--brand']}`}>{resultadosBusqueda.length} resultados encontrados</span>
          <h2 className={styles.sectionTitle}>Selecciona un producto</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', width: '100%', padding: '0 20px' }}>
          {resultadosBusqueda.map(p => (
            <div
              key={p.ref}
              className={styles.aiCard}
              style={{ cursor: 'pointer', textAlign: 'left' }}
              onClick={() => onSeleccionarReferencia(p.ref)}
            >
              <div className={styles.aiCard__name} style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{p.nombre}</div>
              <div className={styles.aiCard__ref} style={{ color: 'var(--blue-600)', fontWeight: 'bold' }}>REF: {p.ref}</div>
              <div className={styles.aiCard__specs}>
                <span className={styles.aiCard__spec}>{p.marca}</span>
                <span className={styles.aiCard__spec}>{p.precio}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!categoria && modo === 'navegacion') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyState__icon} aria-hidden="true">📋</div>
        <h2 className={styles.emptyState__title}>Fichas Técnicas</h2>
        <p className={styles.emptyState__desc}>Selecciona una categoría del panel izquierdo o busca por referencia para navegar por el catálogo.</p>
      </div>
    )
  }

  if (isCargando) {
    return <FichasTecnicasSkeleton paso={paso} />
  }

  // ── Paso: Marcas ───────────────────────────────────────────────────────────
  if (paso === 'marcas') {
    const marcasConLogo = marcasDisponibles.map(m => {
      const { logo, initials, gradient } = getBrandLogoData(m.nombre)
      return { ...m, logo: logo || '', logoFallback: initials, logoGradient: gradient }
    })

    const categoriaLabel = getCategoriaMeta(categoria).desc || catInfo.desc || 'Categoría'

    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige marca', categoriaLabel)}
        {marcasConLogo.length > 0 ? (
          <div className={styles.brandGrid} role="list" aria-label="Marcas disponibles">
            {marcasConLogo.map(m => (
              <div key={m.nombre} role="listitem">
                <button
                  className={styles.brandCard}
                  onClick={() => onSeleccionarMarca(m.nombre)}
                  aria-label={`Seleccionar marca ${m.nombre}`}
                >
                  <div className={styles.brandCard__logo}>
                    {m.logo ? (
                      <img src={m.logo} alt={m.nombre} loading="lazy" />
                    ) : (
                      <div className={styles.brandCard__logoFallback} style={{ background: m.logoGradient }}>
                        {m.logoFallback}
                      </div>
                    )}
                  </div>
                  <div className={styles.brandCard__name}>{m.nombre}</div>
                  <div className={styles.brandCard__count}>Ver gamas</div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No hay marcas disponibles.</p>
        )}
      </div>
    )
  }

  // ── Paso: Categorías grupo ─────────────────────────────────────────────────
  if (paso === 'categorias_grupo') {
    const categoriasList = Object.entries(grupos)
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige categoría', marca)}
        {categoriasList.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Categorías de producto">
            {categoriasList.map(([cat, info]) => (
              <div key={cat} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarCategoriaGrupo(cat)}
                  aria-label={`Seleccionar categoría ${cat}`}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.25rem', marginRight: '8px' }}>{info.icon}</span>
                  <span className={styles.tipoCard__name}>{cat}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay categorías disponibles.</p>
        )}
      </div>
    )
  }

  // ── Paso: Subcategorías ───────────────────────────────────────────────────
  if (paso === 'subcategorias' && categoriaGrupo && grupos[categoriaGrupo]) {
    const subcats = Object.entries(grupos[categoriaGrupo].subcategorias)
    return (
      <div className={styles.linearLayout}>
        {renderHeader(grupos[categoriaGrupo]?.icon, categoriaGrupo, 'Selecciona tipo de producto')}
        {subcats.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Subcategorías">
            {subcats.map(([subcat, filtros]) => (
              <div key={subcat} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarSubcategoria(subcat)}
                  aria-label={`Seleccionar ${getEtiquetaSubcategoria(subcat)}`}
                >
                  <span className={styles.tipoCard__name}>{getEtiquetaSubcategoria(subcat)}</span>
                  <span className={styles.tipoCard__count}>{filtros.length} opción{filtros.length !== 1 ? 'es' : ''}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay subcategorías disponibles.</p>
        )}
      </div>
    )
  }

  // ── Paso: Gamas comerciales ────────────────────────────────────────────────
  if (paso === 'gamas_comerciales') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige gama', categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`)}
        {gamasComercialesDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Gamas disponibles">
            {gamasComercialesDisponibles.map(gc => (
              <div key={gc} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarGamaComercial(gc)}
                  aria-label={`Seleccionar gama ${gc}`}
                >
                  <span className={styles.tipoCard__name}>{gc}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{isCargando ? 'Cargando gamas...' : 'No hay gamas disponibles'}</p>
        )}
      </div>
    )
  }

  // ── Paso: Subgamas ─────────────────────────────────────────────────────────
  if (paso === 'subgamas') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige subgama', categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`)}
        {subgamasDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Subgamas disponibles">
            {subgamasDisponibles.map(sg => (
              <div key={sg} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarSubgama(sg)}
                  aria-label={`Seleccionar subgama ${sg}`}
                >
                  <span className={styles.tipoCard__name}>{sg}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{isCargando ? 'Cargando subgamas...' : 'No hay subgamas disponibles'}</p>
        )}
      </div>
    )
  }

  // ── Paso: Gamas ────────────────────────────────────────────────────────────
  if (paso === 'gamas') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige gama', marca)}
        {gamasDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label={`Gamas de ${marca}`}>
            {gamasDisponibles.map((gName) => (
              <div key={gName} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarGama(gName)}
                  aria-label={`Seleccionar gama ${gName}`}
                >
                  <span className={styles.tipoCard__name}>{gName}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No hay gamas disponibles.</p>
        )}
      </div>
    )
  }

  // ── Paso: Tipos ─────────────────────────────────────────────────────────────
  if (paso === 'tipos') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige tipo', `${gama} — ${marca}`)}
        <div className={styles.itemList} role="list" aria-label="Tipos de productos">
          {tiposDisponibles.map(t => (
            <div key={t} role="listitem" style={{ width: '100%' }}>
              <button
                className={styles.tipoCard}
                onClick={() => onSeleccionarTipo(t)}
                aria-label={`Seleccionar tipo ${t}`}
              >
                <span className={styles.tipoCard__name}>{t}</span>
                <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Paso: Referencias ──────────────────────────────────────────────────────
  if (paso === 'referencias') {
    return (
      <StepReferencias
        referenciasDisponibles={referenciasDisponibles}
        gamaComercial={gamaComercial}
        subgama={subgama}
        gama={gama}
        tipo={tipo}
        vistaFramework={vistas.framework} setVistaFramework={setVistaFramework}
        vistaCurva={vistas.curva} setVistaCurva={setVistaCurva}
        vistaTipo={vistas.tipo} setVistaTipo={setVistaTipo}
        vistaPolos={vistas.polos} setVistaPolos={setVistaPolos}
        vistaCalibre={vistas.calibre} setVistaCalibre={setVistaCalibre}
        vistaSensibilidad={vistas.sensibilidad} setVistaSensibilidad={setVistaSensibilidad}
        onSeleccionarReferencia={onSeleccionarReferencia}
      />
    )
  }

  // ── Paso: Ficha ─────────────────────────────────────────────────────────────
  if (paso === 'ficha' && referencia) {
    return (
      <StepFicha
        referencia={referencia}
        aiFicha={aiFicha}
        aiCargando={aiCargando}
        onCopiarReferencia={onCopiarReferencia}
        onAnadirPresupuesto={onAnadirPresupuesto}
      />
    )
  }

  // ── Resultado búsqueda ─────────────────────────────────────────────────────
  if (resultado && !error) {
    return (
      <div className={styles.linearLayout}>
        <div className={styles.aiResult} role="status" aria-live="polite">
          <h2 className={styles.sectionTitle}>Resultado Búsqueda</h2>
          <div className={styles.aiCard}>
            <div className={styles.aiCard__name}>{resultado.desc || resultado.nombre}</div>
            <div className={styles.aiCard__ref}>{resultado.ref || resultado.referencia}</div>
            <div className={styles.aiCard__desc}>{resultado.desc || resultado.descripcion}</div>
            {resultado.marca && (
              <div className={styles.aiCard__specs}>
                <span className={styles.aiCard__spec}>{resultado.marca}</span>
                <span className={styles.aiCard__spec}>{resultado.familia}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSeleccionarReferencia(resultado.ref || resultado.referencia)}
              aria-label="Ver detalles completos del producto"
            >
              Ver Ficha Completa
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.linearLayout}>
        <div className={styles.errorBox} role="alert">
          <div className={styles.errorBox__title}>⚠ Sin resultados</div>
          <div className={styles.errorBox__msg}>{error.mensaje}</div>
          {error.sugerencias?.length > 0 && (
            <div className={styles.suggWrap}>
              {error.sugerencias.map((s, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSeleccionarReferencia(s)}
                  aria-label={`Buscar sugerencia: ${s}`}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default React.memo(FichasTecnicasContent)