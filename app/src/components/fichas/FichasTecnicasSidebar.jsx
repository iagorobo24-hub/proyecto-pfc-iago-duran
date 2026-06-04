import React, { useRef, useEffect } from 'react'
import Button from '../ui/Button'
import styles from './FichasTecnicasSidebar.module.css'

export default function FichasTecnicasSidebar({
  consulta,
  onConsultaChange,
  sugerenciasBusqueda,
  busquedaCargando,
  isCargando,
  categorias,
  categoria,
  onCategoriaClick,
  onSugerenciaClick,
  onSearch,
  onSubmit,
}) {
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (consulta.trim().length >= 2) {
      debounceRef.current = setTimeout(() => onSearch?.(consulta), 250)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [consulta, onSearch])

  if (!categorias || categorias.length === 0) {
    return (
      <aside className={styles.sidebar} aria-label="Categorías de productos">
        <div className={styles.empty}>Cargando categorías...</div>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar} aria-label="Categorías de productos">
      <div className={styles.search} role="search">
        <input
          id="catalog-search"
          className={styles.searchInput}
          value={consulta}
          onChange={e => onConsultaChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSubmit?.(consulta)
          }}
          placeholder="Buscar referencia o nombre..."
          aria-label="Buscar producto por referencia o nombre comercial"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {sugerenciasBusqueda?.length > 0 && (
          <ul className={styles.sugerencias} role="listbox" aria-label="Sugerencias de búsqueda">
            {sugerenciasBusqueda.map(p => (
              <li
                key={p.id}
                className={styles.sugerenciaItem}
                role="option"
                tabIndex={0}
                onClick={() => onSugerenciaClick?.(p)}
                onKeyDown={e => { if (e.key === 'Enter') onSugerenciaClick?.(p) }}
              >
                <span className={styles.sugerenciaRef}>{p.ref_fabricante}</span>
                <span className={styles.sugerenciaName}>{p.name}</span>
                <span className={styles.sugerenciaMarca}>{p.marca}</span>
              </li>
            ))}
          </ul>
        )}
        {busquedaCargando && <div className={styles.busquedaCargando}>Buscando...</div>}
        <Button
          variant="primary"
          size="sm"
          loading={isCargando}
          onClick={() => onSubmit?.(consulta)}
          aria-label="Ejecutar búsqueda"
          style={{ width: '100%' }}
        >
          Buscar
        </Button>
      </div>

      <div className={styles.label} id="categories-label">Categorías</div>
      <nav aria-labelledby="categories-label">
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${categoria === cat.id ? styles.catBtnActive : ''}`}
            onClick={() => onCategoriaClick?.(cat.id)}
            aria-pressed={categoria === cat.id}
            aria-label={`Ver productos de ${cat.label}`}
          >
            <div className={styles.catBtnIcon} aria-hidden="true">{cat.icon}</div>
            <div className={styles.catBtnInfo}>
              <div className={styles.catBtnName}>{cat.label}</div>
              <div className={styles.catBtnCount}>Ver marcas</div>
            </div>
          </button>
        ))}
      </nav>
      <div className={styles.footer}>
        <p className={styles.footerText}>Proyectos PFC · Iago Durán</p>
        <p className={styles.footerText}>PFC CFGS · 2026</p>
      </div>
    </aside>
  )
}
