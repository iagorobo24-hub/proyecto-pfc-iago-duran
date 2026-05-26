import { useEffect } from 'react'
import styles from './KeyboardShortcutsOverlay.module.css'

const GROUPS = [
  {
    title: 'Navegación',
    shortcuts: [
      { keys: 'Ctrl+1–7', desc: 'Ir a herramienta' },
      { keys: 'Ctrl+B', desc: 'Colapsar sidebar' },
    ],
  },
  {
    title: 'Búsqueda',
    shortcuts: [
      { keys: 'Ctrl+K', desc: 'Búsqueda global' },
      { keys: 'Escape', desc: 'Cerrar overlay' },
    ],
  },
  {
    title: 'Ayuda',
    shortcuts: [
      { keys: '?', desc: 'Mostrar este panel' },
    ],
  },
]

export default function KeyboardShortcutsOverlay({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Atajos de teclado">
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Atajos de teclado</h2>
          <p className={styles.hint}>Pulsa <kbd className={styles.kbd}>Escape</kbd> para cerrar</p>
        </div>
        <div className={styles.groups}>
          {GROUPS.map(group => (
            <div key={group.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <div className={styles.shortcuts}>
                {group.shortcuts.map(s => (
                  <div key={s.keys} className={styles.shortcut}>
                    <span className={styles.keys}>
                      {s.keys.split('+').map((k, i) => (
                        <span key={i}>
                          {i > 0 && <span className={styles.plus}>+</span>}
                          <kbd className={styles.kbd}>{k}</kbd>
                        </span>
                      ))}
                    </span>
                    <span className={styles.desc}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
