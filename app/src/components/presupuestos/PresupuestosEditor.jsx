import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FULL_CATEGORY_INFO } from '../../data/categoryMapping'
import Button from '../ui/Button'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

const CATEGORIAS = Object.keys(FULL_CATEGORY_INFO).map(key => ({
  id: key,
  label: key,
  icon: FULL_CATEGORY_INFO[key].icon,
}))

export default function PresupuestosEditor() {
  const navigate = useNavigate()
  const {
    categoria,
    partidas,
    dispatchPartidas,
    datosCliente,
    setDatosCliente,
    numPresupuesto,
    totalBase,
    ivaAmount,
    totalFinal,
    guardarPresupuesto,
    setNumPresupuesto,
  } = usePresupuestosContext()
  const [guardando, setGuardando] = useState(false)

  const guardar = () => {
    setGuardando(true)
    guardarPresupuesto()
    setGuardando(false)
  }

  const exportarPDF = () => {
    navigate('pdf')
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{numPresupuesto}</h1>
        <p className={styles.pageSubtitle}>
          {datosCliente.nombre || 'Presupuesto sin cliente'} · {partidas.length} partidas
        </p>
      </div>

      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumb__link} onClick={() => navigate('/app/presupuestos')}>
          Categorías
        </button>
        <span className={styles.breadcrumb__sep}>›</span>
        <button className={styles.breadcrumb__link} onClick={() => navigate('seleccion')}>
          {CATEGORIAS.find(c => c.id === categoria)?.label || 'Catálogo'}
        </button>
        <span className={styles.breadcrumb__sep}>›</span>
        <span className={styles.breadcrumb__current}>Presupuesto</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCard__header}>
          <div className={styles.formCard__icon} aria-hidden="true">👤</div>
          <h2 className={styles.formCard__title}>Datos del cliente</h2>
          <p className={styles.formCard__subtitle}>Información para la cabecera del presupuesto</p>
        </div>
        <div className={styles.formCard__grid}>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Nombre / Razón social</label>
            <input className={styles.formCard__input} value={datosCliente.nombre || ''} onChange={e => setDatosCliente(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Electro Industrial SL" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>CIF / NIF</label>
            <input className={styles.formCard__input} value={datosCliente.cif || ''} onChange={e => setDatosCliente(p => ({ ...p, cif: e.target.value }))} placeholder="B-12345678" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Persona de contacto</label>
            <input className={styles.formCard__input} value={datosCliente.contacto || ''} onChange={e => setDatosCliente(p => ({ ...p, contacto: e.target.value }))} placeholder="Nombre del contacto" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Email</label>
            <input className={styles.formCard__input} type="email" value={datosCliente.email || ''} onChange={e => setDatosCliente(p => ({ ...p, email: e.target.value }))} placeholder="cliente@empresa.com" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Teléfono</label>
            <input className={styles.formCard__input} type="tel" value={datosCliente.telefono || ''} onChange={e => setDatosCliente(p => ({ ...p, telefono: e.target.value }))} placeholder="666 777 888" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Provincia</label>
            <input className={styles.formCard__input} value={datosCliente.provincia || ''} onChange={e => setDatosCliente(p => ({ ...p, provincia: e.target.value }))} placeholder="A Coruña" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Dirección</label>
            <input className={styles.formCard__input} value={datosCliente.direccion || ''} onChange={e => setDatosCliente(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle Mayor 123" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Población</label>
            <input className={styles.formCard__input} value={datosCliente.poblacion || ''} onChange={e => setDatosCliente(p => ({ ...p, poblacion: e.target.value }))} placeholder="Santiago de Compostela" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Código postal</label>
            <input className={styles.formCard__input} value={datosCliente.cp || ''} onChange={e => setDatosCliente(p => ({ ...p, cp: e.target.value }))} placeholder="15701" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>País</label>
            <input className={styles.formCard__input} value={datosCliente.pais || ''} onChange={e => setDatosCliente(p => ({ ...p, pais: e.target.value }))} placeholder="España" />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>IVA (%)</label>
            <input className={styles.formCard__input} type="number" value={datosCliente.iva} onChange={e => setDatosCliente(p => ({ ...p, iva: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Forma de pago</label>
            <select className={styles.formCard__select} value={datosCliente.forma_pago} onChange={e => setDatosCliente(p => ({ ...p, forma_pago: e.target.value }))}>
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Cheque</option>
              <option>PayPal</option>
            </select>
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Plazo de entrega</label>
            <select className={styles.formCard__select} value={datosCliente.plazo_entrega} onChange={e => setDatosCliente(p => ({ ...p, plazo_entrega: e.target.value }))}>
              <option>Inmediato</option>
              <option>5 días</option>
              <option>10 días</option>
              <option>15 días</option>
              <option>30 días</option>
              <option>60 días</option>
            </select>
          </div>
          <div className={styles.formCard__group}>
            <label className={styles.formCard__label}>Validez del presupuesto</label>
            <select className={styles.formCard__select} value={datosCliente.validez} onChange={e => setDatosCliente(p => ({ ...p, validez: e.target.value }))}>
              <option>15 días</option>
              <option>30 días</option>
              <option>60 días</option>
              <option>90 días</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div>Referencia</div><div>Descripción</div><div>Cant.</div><div>Precio €</div><div>Total €</div><div></div>
        </div>
        {partidas.map(p => (
          <div key={p._id} className={styles.editorRow}>
            <div className={styles.editorRow__producto}>
              <input className={styles.editorRow__input} value={p.ref} onChange={e => dispatchPartidas({ type: 'UPDATE', id: p._id, field: 'ref', value: e.target.value })} style={{ textAlign: 'left' }} />
            </div>
            <div className={styles.editorRow__ref}>
              <input className={styles.editorRow__input} value={p.desc} onChange={e => dispatchPartidas({ type: 'UPDATE', id: p._id, field: 'desc', value: e.target.value })} style={{ textAlign: 'left' }} />
            </div>
            <input className={styles.editorRow__input} type="number" value={p.cantidad} onChange={e => dispatchPartidas({ type: 'UPDATE', id: p._id, field: 'cantidad', value: parseFloat(e.target.value) || 0 })} />
            <input className={styles.editorRow__input} type="number" step="0.01" value={p.precio_unitario} onChange={e => dispatchPartidas({ type: 'UPDATE', id: p._id, field: 'precio_unitario', value: parseFloat(e.target.value) || 0 })} />
            <div className={styles.editorRow__total}>{p.precio_total.toFixed(2)}</div>
            <button className={styles.editorRow__delete} onClick={() => dispatchPartidas({ type: 'DELETE', id: p._id })}>✕</button>
          </div>
        ))}
        <div style={{ padding: '12px 20px' }}>
          <Button variant="ghost" size="sm" onClick={() => dispatchPartidas({ type: 'ADD' })}>+ Añadir partida manual</Button>
        </div>
      </div>

      <div className={styles.editorFooter}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Base imponible: {totalBase.toFixed(2)}€</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>IVA ({datosCliente.iva}%): {ivaAmount.toFixed(2)}€</div>
        </div>
        <div className={styles.editorFooter__total}>{totalFinal.toFixed(2)}€</div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
        <Button variant="secondary" size="md" onClick={() => navigate('seleccion')}>← Volver al catálogo</Button>
        <Button variant="primary" size="md" onClick={guardar} loading={guardando}>Guardar presupuesto</Button>
        <Button variant="secondary" size="md" onClick={exportarPDF}>📄 Exportar PDF</Button>
        <Button variant="ghost" size="md" onClick={() => { navigate('/app/presupuestos'); setNumPresupuesto(genNum) }}>Nuevo presupuesto</Button>
      </div>
    </>
  )
}
