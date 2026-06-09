/**
 * @file VisuallyHidden.jsx
 * @description Componente utilitario de accesibilidad (A11y).
 * Oculta visualmente a los elementos en pantalla mediante estilos CSS pero manteniéndolos
 * completamente legibles para lectores de pantalla de personas con discapacidad visual,
 * cumpliendo con las pautas WCAG 2.2.
 */

import './VisuallyHidden.module.css'

/**
 * Renderiza contenido visible únicamente para tecnologías de asistencia (screen readers).
 * 
 * @export
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Texto o elementos ocultados
 * @param {React.ElementType} [props.as='span'] - Elemento HTML semántico a utilizar (ej: 'div', 'span', 'p')
 * @returns {JSX.Element}
 */
export default function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  const ComponentToUse = Component
  return (
    <ComponentToUse className="visually-hidden" {...props}>
      {children}
    </ComponentToUse>
  )
}

