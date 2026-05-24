import { useState, useEffect, useReducer, useMemo, useCallback } from "react";
import React from "react";
import { useSearchParams } from 'react-router-dom'
import { FULL_CATEGORY_INFO } from '../data/categoryMapping'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import Button from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'
import catalogService from '../services/catalogService'
import styles from './Presupuestos.module.css'

const CATEGORIAS = Object.keys(FULL_CATEGORY_INFO).map(key => ({
  id: key,
  label: key,
  icon: FULL_CATEGORY_INFO[key].icon
}));

const genNum = () => { const d = new Date(); return `SNP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${String(Math.floor(Math.random()*900)+100)}`; };

function partidasReducer(state, action) {
  switch (action.type) {
    case "SET": return action.payload.map((p, i) => ({ ...p, _id: i }));
    case "UPDATE": return state.map(p => p._id === action.id ? { ...p, [action.field]: action.value, precio_total: action.field === "precio_unitario" ? action.value * p.cantidad : action.field === "cantidad" ? p.precio_unitario * action.value : p.precio_total } : p);
    case "ADD": return [...state, { _id: state.length, ref: "", desc: "", cantidad: 1, precio_unitario: 0, precio_total: 0 }];
    case "ADD_FROM_CATALOG": return [...state, { _id: state.length, ref: action.ref, desc: action.desc, cantidad: action.cantidad || 1, precio_unitario: action.precio || 0, precio_total: (action.precio || 0) * (action.cantidad || 1) }];
    case "DELETE": return state.filter(p => p._id !== action.id);
    default: return state;
  }
}

export default function Presupuestos() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState(null);
  const [gama, setGama] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [partidas, dispatchPartidas] = useReducer(partidasReducer, []);
  const [datosCliente, setDatosCliente] = useState({ nombre: "", cif: "", contacto: "", email: "", telefono: "", direccion: "", poblacion: "", cp: "", provincia: "", pais: "España", iva: 21, forma_pago: "Transferencia", plazo_entrega: "15 días", validez: "30 días" });
  const [vista, setVista] = useState("wizard");
  const [guardando, setGuardando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [numPresupuesto, setNumPresupuesto] = useState(genNum());
  const [filtroCatalogo, setFiltroCatalogo] = useState("");
  const [añadidos, setAñadidos] = useState({});

  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [gamasDisponibles, setGamasDisponibles] = useState([]);
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [pasoCatalogo, setPasoCatalogo] = useState("marcas");
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);

  useEffect(() => { const h = safeGetJSON("pfc_presupuestos_historial"); if (h) setHistorial(h); }, []);
  useEffect(() => {
    const producto = searchParams.get('producto');
    const referencia = searchParams.get('referencia');
    const precio = searchParams.get('precio');
    if (producto && referencia) {
      dispatchPartidas({ type: "ADD_FROM_CATALOG", ref: referencia, desc: producto, precio: parseFloat(precio) || 0 });
      setVista("editor");
    }
  }, [searchParams]);

  useEffect(() => {
    if (vista !== "seleccion" || !categoria) return;
    setCargandoCatalogo(true);
    catalogService.getMarcasPorCategoria(categoria).then(data => {
      setMarcasDisponibles(data);
      setPasoCatalogo("marcas");
      setCargandoCatalogo(false);
    });
  }, [vista, categoria]);

  useEffect(() => {
    if (!categoria || !marca) return;
    setCargandoCatalogo(true);
    catalogService.getGamasPorMarcaYCategoria(marca, categoria).then(data => {
      setGamasDisponibles(data.map(g => g.nombre));
      setCargandoCatalogo(false);
    });
  }, [categoria, marca]);

  useEffect(() => {
    if (!categoria || !marca || !gama) return;
    setCargandoCatalogo(true);
    catalogService.getTiposPorGamaMarcaYFamilia(gama, marca, categoria).then(data => {
      setTiposDisponibles(data);
      setCargandoCatalogo(false);
    });
  }, [categoria, marca, gama]);

  useEffect(() => {
    if (!categoria || !marca || !gama || !tipo) return;
    setCargandoCatalogo(true);
    catalogService.getProductosPorFiltro(categoria, marca, gama, tipo).then(data => {
      setProductosDisponibles(data);
      setCargandoCatalogo(false);
    });
  }, [categoria, marca, gama, tipo]);

  const continuarASleccion = () => {
    if (!categoria) { toast.show("Selecciona una categoría primero"); return; }
    setMarca(null);
    setGama(null);
    setTipo(null);
    setProductosDisponibles([]);
    setAñadidos({});
    setVista("seleccion");
  };

  const añadirProducto = (prod) => {
    const key = prod.ref_fabricante || prod.ref;
    dispatchPartidas({ type: "ADD_FROM_CATALOG", ref: key, desc: prod.name || prod.desc, precio: prod.precio });
    setAñadidos(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    toast.show(`${key} añadido al presupuesto`, "success");
  };

  const irAEditor = () => {
    if (partidas.length === 0) { toast.show("Añade al menos un producto al presupuesto"); return; }
    setVista("editor");
  };

  const guardar = () => {
    setGuardando(true);
    const presupuesto = { numero: numPresupuesto, fecha: new Date().toISOString(), cliente: datosCliente, partidas, categoria, total: partidas.reduce((s, p) => s + p.precio_total, 0) };
    const nuevo = [presupuesto, ...historial].slice(0, 20);
    setHistorial(nuevo);
    safeSetJSON("pfc_presupuestos_historial", nuevo)
    setGuardando(false);
    toast.show("Presupuesto guardado", "success");
  };

  const totalBase = partidas.reduce((s, p) => s + p.precio_total, 0);
  const ivaAmount = totalBase * (datosCliente.iva / 100);
  const totalFinal = totalBase + ivaAmount;

  const breadcrumbItems = useMemo(() => {
    const items = [];
    items.push({ label: CATEGORIAS.find(c => c.id === categoria)?.label || 'Seleccionar', onClick: () => { setMarca(null); setGama(null); setTipo(null); setProductosDisponibles([]); setPasoCatalogo("marcas"); } });
    if (marca) items.push({ label: marca, onClick: () => { setGama(null); setTipo(null); setProductosDisponibles([]); setPasoCatalogo("gamas"); } });
    if (gama) items.push({ label: gama, onClick: () => { setTipo(null); setProductosDisponibles([]); setPasoCatalogo("tipos"); } });
    if (tipo) items.push({ label: tipo, current: true });
    return items;
  }, [categoria, marca, gama, tipo]);

  /* ── WIZARD: Selección de categoría ── */
  if (vista === "wizard") {
    return (
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.main__content}>
            <div className={styles.pageHeader}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2rem' }}>💰</span>
                <h1 className={styles.pageTitle}>Presupuestos</h1>
              </div>
              <p className={styles.pageSubtitle}>Genera presupuestos técnicos seleccionando referencias del catálogo</p>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '24px' }}>Selecciona la categoría de instalación</h3>
            <div className={styles.categoriasGrid}>
              {CATEGORIAS.map(c => (
                <button key={c.id} className={`${styles.catCard} ${categoria === c.id ? styles['catCard--active'] : ''}`} onClick={() => setCategoria(c.id)}>
                  <span className={styles.catCard__icon}>{c.icon}</span>
                  <span className={styles.catCard__name}>{c.label}</span>
                </button>
              ))}
            </div>

            {categoria && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button variant="primary" size="lg" onClick={continuarASleccion}>
                  Ver catálogo de {CATEGORIAS.find(c => c.id === categoria)?.label} →
                </Button>
              </div>
            )}

            {historial.length > 0 && !categoria && (
              <div style={{ marginTop: '48px' }}>
                <h3 style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-400)', marginBottom: '16px' }}>Últimos presupuestos</h3>
                <div className={styles.historialList}>
                  {historial.slice(0, 5).map((h, i) => (
                    <button key={i} className={styles.historialItem} onClick={() => { dispatchPartidas({ type: "SET", payload: h.partidas || [] }); setDatosCliente(h.cliente || datosCliente); setVista("editor"); }}>
                      <div className={styles.historialItem__header}>
                        <span className={styles.historialItem__delegacion}>{h.numero}</span>
                        <span className={styles.historialItem__fecha}>{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className={styles.historialItem__turno}>{h.cliente?.nombre || 'Sin cliente'} · {h.partidas?.length || 0} partidas</div>
                      <div className={styles.historialItem__total}>{h.total?.toFixed(2) || '0'}€</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── SELECCIÓN: Navegación jerárquica del catálogo ── */
  if (vista === "seleccion") {
    const renderBreadcrumb = () => (
      <div className={styles.breadcrumb}>
        {breadcrumbItems.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={styles.breadcrumb__sep}>›</span>}
            {item.onClick ? (
              <button className={styles.breadcrumb__link} onClick={item.onClick}>{item.label}</button>
            ) : (
              <span className={styles.breadcrumb__current}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );

    const catLabel = CATEGORIAS.find(c => c.id === categoria)?.label || '';

    return (
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.main__content}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                <span aria-hidden="true">{CATEGORIAS.find(c => c.id === categoria)?.icon}</span>
                {' '}{catLabel}
              </h1>
              <p className={styles.pageSubtitle}>Selecciona marca, gama y tipo para encontrar productos</p>
            </div>

            {renderBreadcrumb()}

            {cargandoCatalogo && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                Cargando catálogo...
              </div>
            )}

            {!cargandoCatalogo && pasoCatalogo === "marcas" && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selecciona una marca</h3>
                <div className={styles.catalogGrid}>
                  {marcasDisponibles.map(m => (
                    <button
                      key={m.nombre}
                      className={`${styles.productCard}`}
                      onClick={() => { setMarca(m.nombre); setPasoCatalogo("gamas"); }}
                    >
                      <div className={styles.productCard__ref}>{m.nombre}</div>
                      <div className={styles.productCard__desc}>Ver gamas disponibles</div>
                    </button>
                  ))}
                  {marcasDisponibles.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyState__icon}>📭</div>
                      <div className={styles.emptyState__title}>Sin marcas</div>
                      <div className={styles.emptyState__text}>No hay marcas disponibles en esta categoría</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!cargandoCatalogo && pasoCatalogo === "gamas" && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selecciona una gama</h3>
                <div className={styles.catalogGrid}>
                  {gamasDisponibles.map(g => (
                    <button
                      key={g}
                      className={`${styles.productCard}`}
                      onClick={() => { setGama(g); setPasoCatalogo("tipos"); }}
                    >
                      <div className={styles.productCard__ref}>{g}</div>
                      <div className={styles.productCard__desc}>Ver tipos de producto</div>
                    </button>
                  ))}
                  {gamasDisponibles.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyState__icon}>📭</div>
                      <div className={styles.emptyState__title}>Sin gamas</div>
                      <div className={styles.emptyState__text}>No hay gamas disponibles para esta marca</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!cargandoCatalogo && pasoCatalogo === "tipos" && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selecciona un tipo</h3>
                <div className={styles.catalogGrid}>
                  {tiposDisponibles.map(t => (
                    <button
                      key={t}
                      className={`${styles.productCard}`}
                      onClick={() => { setTipo(t); setPasoCatalogo("productos"); }}
                    >
                      <div className={styles.productCard__ref}>{t}</div>
                      <div className={styles.productCard__desc}>Ver productos</div>
                    </button>
                  ))}
                  {tiposDisponibles.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyState__icon}>📭</div>
                      <div className={styles.emptyState__title}>Sin tipos</div>
                      <div className={styles.emptyState__text}>No hay tipos disponibles para esta gama</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!cargandoCatalogo && pasoCatalogo === "productos" && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {productosDisponibles.length} producto{productosDisponibles.length !== 1 ? 's' : ''}
                  </h3>
                  <div className={styles.catalogSearch} style={{ maxWidth: '300px' }}>
                    <input
                      className={styles.catalogSearch__input}
                      placeholder="Filtrar productos..."
                      value={filtroCatalogo}
                      onChange={e => setFiltroCatalogo(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.catalogGrid}>
                  {(filtroCatalogo
                    ? productosDisponibles.filter(p =>
                        (p.ref_fabricante || '').toLowerCase().includes(filtroCatalogo.toLowerCase()) ||
                        (p.name || '').toLowerCase().includes(filtroCatalogo.toLowerCase())
                      )
                    : productosDisponibles
                  ).map(prod => {
                    const key = prod.ref_fabricante || prod.ref;
                    const vecesAñadido = añadidos[key] || 0;
                    return (
                      <button
                        key={prod.id || key}
                        className={`${styles.productCard} ${vecesAñadido > 0 ? styles['productCard--popular'] : ''}`}
                        onClick={() => añadirProducto(prod)}
                      >
                        <div className={styles.productCard__ref}>{key}</div>
                        <div className={styles.productCard__desc}>{prod.name || ''}</div>
                        <div className={styles.productCard__price}>{prod.precio ? `${prod.precio.toFixed(2)} €` : '—'}</div>
                        {vecesAñadido > 0 && (
                          <span className={styles.productCard__added}>✓ ×{vecesAñadido}</span>
                        )}
                        {prod.imagen && (
                          <img
                            src={prod.imagen}
                            alt={key}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', marginTop: '8px', alignSelf: 'center' }}
                          />
                        )}
                      </button>
                    );
                  })}
                  {productosDisponibles.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyState__icon}>📭</div>
                      <div className={styles.emptyState__title}>Sin productos</div>
                      <div className={styles.emptyState__text}>No hay productos disponibles para esta selección</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botón volver */}
            {pasoCatalogo !== "marcas" && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (pasoCatalogo === "productos") { setTipo(null); setProductosDisponibles([]); setPasoCatalogo("tipos"); }
                  else if (pasoCatalogo === "tipos") { setGama(null); setProductosDisponibles([]); setPasoCatalogo("gamas"); }
                  else if (pasoCatalogo === "gamas") { setMarca(null); setProductosDisponibles([]); setPasoCatalogo("marcas"); }
                }}>
                  ← Volver
                </Button>
              </div>
            )}

            {/* Barra inferior con resumen y botón editor */}
            {partidas.length > 0 && (
              <div className={styles.catalogBar}>
                <div className={styles.catalogBar__info}>
                  <span>{partidas.length} producto{partidas.length > 1 ? 's' : ''} añadido{partidas.length > 1 ? 's' : ''}</span>
                  <span className={styles.catalogBar__total}>{totalBase.toFixed(2)} €</span>
                </div>
                <div className={styles.catalogBar__actions}>
                  <Button variant="secondary" size="md" onClick={() => setVista("wizard")}>Cambiar categoría</Button>
                  <Button variant="primary" size="md" onClick={irAEditor}>Ir al presupuesto →</Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── EDITOR: Tabla de partidas ── */
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.main__content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{numPresupuesto}</h1>
            <p className={styles.pageSubtitle}>{datosCliente.nombre || 'Presupuesto sin cliente'} · {partidas.length} partidas</p>
          </div>

          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <button className={styles.breadcrumb__link} onClick={() => setVista("wizard")}>Categorías</button>
            <span className={styles.breadcrumb__sep}>›</span>
            <button className={styles.breadcrumb__link} onClick={() => setVista("seleccion")}>{CATEGORIAS.find(c => c.id === categoria)?.label || 'Catálogo'}</button>
            <span className={styles.breadcrumb__sep}>›</span>
            <span className={styles.breadcrumb__current}>Presupuesto</span>
          </div>

          {/* Datos cliente */}
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

          {/* Tabla de partidas */}
          <div className={styles.editorCard}>
            <div className={styles.editorHeader}>
              <div>Referencia</div><div>Descripción</div><div>Cant.</div><div>Precio €</div><div>Total €</div><div></div>
            </div>
            {partidas.map(p => (
              <div key={p._id} className={styles.editorRow}>
                <div className={styles.editorRow__producto}>
                  <input className={styles.editorRow__input} value={p.ref} onChange={e => dispatchPartidas({ type: "UPDATE", id: p._id, field: "ref", value: e.target.value })} style={{ textAlign: 'left' }} />
                </div>
                <div className={styles.editorRow__ref}>
                  <input className={styles.editorRow__input} value={p.desc} onChange={e => dispatchPartidas({ type: "UPDATE", id: p._id, field: "desc", value: e.target.value })} style={{ textAlign: 'left' }} />
                </div>
                <input className={styles.editorRow__input} type="number" value={p.cantidad} onChange={e => dispatchPartidas({ type: "UPDATE", id: p._id, field: "cantidad", value: parseFloat(e.target.value) || 0 })} />
                <input className={styles.editorRow__input} type="number" step="0.01" value={p.precio_unitario} onChange={e => dispatchPartidas({ type: "UPDATE", id: p._id, field: "precio_unitario", value: parseFloat(e.target.value) || 0 })} />
                <div className={styles.editorRow__total}>{p.precio_total.toFixed(2)}</div>
                <button className={styles.editorRow__delete} onClick={() => dispatchPartidas({ type: "DELETE", id: p._id })}>✕</button>
              </div>
            ))}
            <div style={{ padding: '12px 20px' }}>
              <Button variant="ghost" size="sm" onClick={() => dispatchPartidas({ type: "ADD" })}>+ Añadir partida manual</Button>
            </div>
          </div>

          {/* Totales */}
          <div className={styles.editorFooter}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Base imponible: {totalBase.toFixed(2)}€</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>IVA ({datosCliente.iva}%): {ivaAmount.toFixed(2)}€</div>
            </div>
            <div className={styles.editorFooter__total}>{totalFinal.toFixed(2)}€</div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="md" onClick={() => setVista("seleccion")}>← Volver al catálogo</Button>
            <Button variant="primary" size="md" onClick={guardar} loading={guardando}>Guardar presupuesto</Button>
            <Button variant="ghost" size="md" onClick={() => { setVista("wizard"); setNumPresupuesto(genNum()); }}>Nuevo presupuesto</Button>
          </div>
        </div>
      </main>
    </div>
  );
}