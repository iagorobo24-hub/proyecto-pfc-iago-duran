# Requisitos No Funcionales

## Definición

Los requisitos no funcionales definen **cómo debe funcionar el sistema**, estableciendo restricciones de calidad, rendimiento y seguridad.

---

## RNF-01: Rendimiento

### RNF-01.1 — Tiempo de carga
**Criterio:** La página principal debe cargar en menos de 3 segundos (3G)

**Medición:** Lighthouse, WebPageTest

### RNF-01.2 — Respuesta de interfaz
**Criterio:** Las interacciones deben responder en menos de 100ms

**Medición:** Chrome DevTools Performance

### RNF-01.3 — Rendering de catálogos grandes
**Criterio:** El catálogo de 400K productos debe renderizar sin bloquear la UI

**Medición:** Virtualización con react-window

---

## RNF-02: Usabilidad

### RNF-02.1 — Diseño responsive
**Criterio:** La aplicación debe ser usable en 3 breakpoints

| Breakpoint | Ancho | Dispositivo |
|------------|-------|-------------|
| Mobile | < 640px | Teléfono |
| Tablet | 640-1024px | Tablet |
| Desktop | > 1024px | Ordenador |

**Medición:** Pruebas manuales en cada breakpoint

### RNF-02.2 — Accesibilidad
**Criterio:** Cumplir nivel AA de WCAG 2.2

- Contraste de colores mínimo 4.5:1
- Navegación por teclado
- Atributos ARIA donde corresponda
- Texto alternativo en imágenes

**Medición:** Lighthouse, axe DevTools

### RNF-02.3 — Modo oscuro
**Criterio:** El usuario debe poder alternar entre modo claro y oscuro

**Implementación:** ThemeContext con CSS variables

---

## RNF-03: Seguridad

### RNF-03.1 — Autenticación
**Criterio:** Solo usuarios autenticados pueden acceder a la aplicación

**Implementación:** Firebase Auth + ProtectedRoute

### RNF-03.2 — Datos de usuario aislados
**Criterio:** Cada usuario solo ve sus propios datos

**Implementación:** Firebase Security Rules con `auth.uid`

### RNF-03.3 — API de IA protegida
**Criterio:** La clave de API no debe exponerse en cliente

**Implementación:** Vercel Functions como proxy

### RNF-03.4 — Content Security Policy
**Criterio:** Prevenir XSS y ataques de inyección

**Implementación:** Headers CSP en vercel.json

---

## RNF-04: Escalabilidad

### RNF-04.1 — Catálogo escalable
**Criterio:** El sistema debe soportar 1M+ productos

**Implementación:**
- Firestore con paginación
- Índices compuestos
- Búsqueda por keywords precalculadas

### RNF-04.2 — Crecimiento de usuarios
**Criterio:** Soportar al menos 100 usuarios concurrentes

**Implementación:**
- Firebase Spark: hasta 100 conexiones simultáneas
- Vercel hobby: sin límite específico

---

## RNF-05: Disponibilidad

### RNF-05.1 — Uptime objetivo
**Criterio:** 99% de disponibilidad

**Implementación:**
- Vercel: infraestructura redundante
- Firebase: SLA del 99.9%

### RNF-05.2 — Fallback offline
**Criterio:** La app debe funcionar si la API de IA falla

**Implementación:** Mensaje de error claro + retry

---

## RNF-06: Mantenibilidad

### RNF-06.1 — Código documentado
**Criterio:** Componentes complejos deben tener JSDoc/comentarios

**Implementación:** Convenciones en CLAUDE.md

### RNF-06.2 — Estructura consistente
**Criterio:** Estructura de carpetas predecible

**Implementación:**
```
src/
├── components/  # Componentes reutilizables
├── pages/       # Componentes de página
├── hooks/       # Custom hooks
├── services/    # Lógica de negocio
├── contexts/    # React contexts
└── styles/      # Estilos globales
```

### RNF-06.3 — Control de versiones
**Criterio:** Todo el código en Git con commits significativos

**Implementación:** Conventional commits

---

## RNF-07: Coste

### RNF-07.1 — Coste cero en producción
**Criterio:** El proyecto debe funcionar sin pagar nada

**Implementación:** Exclusivamente tiers gratuitos

| Servicio | Tier usado | Límite |
|----------|------------|--------|
| Firebase Auth | Spark | 100 usuarios |
| Firestore | Spark | 50K escrituras/día, 1GB storage |
| Vercel | Hobby | 100GB bandwidth, 500min build |
| OpenRouter | Free Tier | 10K tokens/día |

### RNF-07.2 — Alerta de costes
**Criterio:** Notificar si se acercan a límites

**Implementación:** Scripts de monitoring (pendiente)

---

## RNF-08: Testing

### RNF-08.1 — Tests E2E
**Criterio:** Core flows deben tener tests automatizados

**Implementación:** Playwright
- Login con Google
- Navegación entre módulos
- Responsive design
- Dark mode

### RNF-08.2 — Cobertura objetivo
**Criterio:** Mínimo 50% de cobertura en lógica de negocio

**Estado:** Pendiente de implementar con Vitest

---

## Resumen de requisitos no funcionales

| Categoría | Requisitos | Estado |
|-----------|------------|--------|
| Rendimiento | 3 | ✅ Implementado |
| Usabilidad | 3 | ✅ Implementado |
| Seguridad | 4 | ✅ Implementado |
| Escalabilidad | 2 | ✅ Parcial |
| Disponibilidad | 2 | ✅ Implementado |
| Mantenibilidad | 3 | ✅ Parcial |
| Coste | 2 | ✅ Implementado |
| Testing | 2 | 🔄 Parcial |

---

*Requisitos no funcionales: Abril 2026*
*Revisados: Mayo 2026*
