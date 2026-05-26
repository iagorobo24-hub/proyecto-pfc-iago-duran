import './VisuallyHidden.module.css'

/**
 * Componente para texto solo visible para lectores de pantalla
 * Basado en las mejores prácticas de accesibilidad WCAG
 */
export default function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  const ComponentToUse = Component
  return (
    <ComponentToUse className="visually-hidden" {...props}>
      {children}
    </ComponentToUse>
  )
}
