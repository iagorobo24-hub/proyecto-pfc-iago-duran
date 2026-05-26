import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { trackEvent } from '../hooks/useAnalytics'
import useFichasTecnicas from '../hooks/useFichasTecnicas'
import useNavegacionFichas from '../hooks/useNavegacionFichas'
import { FULL_CATEGORY_INFO } from '../data/categoryMapping'
import { Breadcrumb, ViewToggle } from '../components/ui/CircleLayout'
import Button from '../components/ui/Button'
import FichasTecnicasSidebar from '../components/fichas/FichasTecnicasSidebar'
import FichasTecnicasContent from '../components/fichas/FichasTecnicasContent'
import styles from './FichasTecnicas.module.css'

export default function FichasTecnicas() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    paso, categoria, marca, gamaComercial, subgama, gama, tipo, categoriaGrupo, subcategoria, grupos,
    referencia,
    categorias, marcasDisponibles, gamasDisponibles,
    tiposDisponibles, gamasComercialesDisponibles, subgamasDisponibles, referenciasDisponibles,
    breadcrumb, cargando: navegacionCargando, sugerenciasBusqueda, busquedaCargando,
    seleccionarCategoria, seleccionarMarca, seleccionarGama,
    seleccionarTipo, seleccionarCategoriaGrupo, seleccionarSubcategoria, seleccionarGamaComercial, seleccionarSubgama,
    seleccionarReferencia, volver, irAPaso,
    buscarReferenciaDirecta, buscarPorNombre, aiFicha, aiCargando,
  } = useNavegacionFichas()

  const {
    consulta,
    setConsulta,
    resultado,
    resultadosBusqueda,
    error,
    cargando: busquedaIACargando,
    buscar,
  } = useFichasTecnicas()

  const [modo, setModo] = useState('navegacion')

  const catInfo = FULL_CATEGORY_INFO[categoria] || {}
  const isCargando = navegacionCargando || busquedaIACargando

  const handleSugerenciaClick = useCallback((p) => {
    seleccionarReferencia(p)
    setConsulta('')
  }, [seleccionarReferencia, setConsulta])

  const handleSearch = useCallback((q) => {
    trackEvent('busqueda', 'iniciada', q)
    buscarReferenciaDirecta(q).then(found => {
      if (found) {
        trackEvent('busqueda', 'con_resultados', q, 1)
      } else {
        trackEvent('busqueda', 'sin_resultados', q)
        buscar()
      }
    })
  }, [buscarReferenciaDirecta, buscar])

  const handleCategoriaClick = useCallback((catId) => {
    seleccionarCategoria(catId)
    setModo('navegacion')
  }, [seleccionarCategoria])

  const copiarReferencia = useCallback((ref) => {
    navigator.clipboard.writeText(ref)
    toast.show(`Referencia "${ref}" copiada`, 'success')
  }, [toast])

  const anadirPresupuesto = useCallback((ficha) => {
    if (!ficha) return
    const params = new URLSearchParams({
      producto: ficha.name || ficha.desc || ficha.nombre || '',
      referencia: ficha.ref_fabricante || ficha.ref || '',
      precio: ficha.precio || '0',
    })
    navigate(`/app/presupuestos/editor?${params.toString()}`)
    toast.show(`${ficha.ref_fabricante || ficha.ref} anadido al presupuesto`, 'success')
  }, [navigate, toast])

  return (
    <div className={styles.layout}>
      <FichasTecnicasSidebar
        consulta={consulta}
        onConsultaChange={setConsulta}
        sugerenciasBusqueda={sugerenciasBusqueda}
        busquedaCargando={busquedaCargando}
        isCargando={isCargando}
        categorias={categorias}
        categoria={categoria}
        onCategoriaClick={handleCategoriaClick}
        onSugerenciaClick={handleSugerenciaClick}
        onSearch={buscarPorNombre}
        onSubmit={handleSearch}
      />
      <main className={styles.main} id="main-content">
        <div className={styles.main__content}>

          {breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb">
              <Breadcrumb
                items={breadcrumb.map((item, i) => {
                  const isLast = i === breadcrumb.length - 1
                  const label = typeof item === 'string' ? item : item.label
                  const image = typeof item === 'object' ? item.imagen : undefined
                  const isReferencia = paso === 'ficha' && isLast && typeof item === 'object'
                  return {
                    label: isReferencia ? referencia.ref_fabricante || referencia.ref : label,
                    image: isReferencia ? referencia.imagen : image,
                    onClick: i < breadcrumb.length - 1 ? () => irAPaso(i) : undefined,
                    current: isLast,
                  }
                })}
              />
            </nav>
          )}

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span aria-hidden="true">{categoria ? (catInfo.icon || '') : ''}</span>
              {' '}
              {categoria ? categorias.find(c => c.id === categoria)?.label : 'Fichas Técnicas'}
            </h1>
            {categoria && (
              <ViewToggle
                options={[{ label: 'Navegar', value: 'navegacion' }, { label: 'Buscar', value: 'busqueda' }]}
                active={modo}
                onChange={setModo}
              />
            )}
          </div>

          <section aria-live="polite">
            <FichasTecnicasContent
              paso={paso}
              categoria={categoria}
              marca={marca}
              gamaComercial={gamaComercial}
              subgama={subgama}
              gama={gama}
              tipo={tipo}
              categoriaGrupo={categoriaGrupo}
              subcategoria={subcategoria}
              grupos={grupos}
              referencia={referencia}
              categorias={categorias}
              marcasDisponibles={marcasDisponibles}
              gamasDisponibles={gamasDisponibles}
              tiposDisponibles={tiposDisponibles}
              gamasComercialesDisponibles={gamasComercialesDisponibles}
              subgamasDisponibles={subgamasDisponibles}
              referenciasDisponibles={referenciasDisponibles}
              aiFicha={aiFicha}
              aiCargando={aiCargando}
              isCargando={isCargando}
              resultado={resultado}
              error={error}
              resultadosBusqueda={resultadosBusqueda}
              modo={modo}
              catInfo={catInfo}
              onSeleccionarMarca={seleccionarMarca}
              onSeleccionarGama={seleccionarGama}
              onSeleccionarTipo={seleccionarTipo}
              onSeleccionarCategoriaGrupo={seleccionarCategoriaGrupo}
              onSeleccionarSubcategoria={seleccionarSubcategoria}
              onSeleccionarGamaComercial={seleccionarGamaComercial}
              onSeleccionarSubgama={seleccionarSubgama}
              onSeleccionarReferencia={seleccionarReferencia}
              onCopiarReferencia={copiarReferencia}
              onAnadirPresupuesto={anadirPresupuesto}
            />
          </section>

          {(paso !== 'categorias' && paso !== 'busqueda' && categoria) && (
            <div className={styles.backWrap}>
              <Button variant="ghost" size="sm" onClick={volver} aria-label="Volver al paso anterior">
                ← Volver
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
