# Diseño UI/UX

## Sistema de diseño

La aplicación usa un **sistema de diseño propio** basado en los colores corporativos de Sonepar, implementado con CSS Modules y Variables CSS.

---

## Paleta de colores

### Colores corporativos Sonepar

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **Azul Sonepar** | `#004B8D` | 0, 75, 141 | Primary, botones principales |
| **Azul claro** | `#4A90D9` | 74, 144, 217 | Links, acentos |
| **Verde éxito** | `#28A745` | 40, 167, 69 |KPIs OK, confirmaciones |
| **Amarillo warning** | `#FFC107` | 255, 193, 7 |KPIs Warning |
| **Rojo error** | `#DC3545` | 220, 53, 69 |Errores, KPIs críticos |
| **Gris texto** | `#333333` | 51, 51, 51 | Texto principal |
| **Gris secundario** | `#666666` | 102, 102, 102 | Texto secundario |
| **Fondo claro** | `#F5F7FA` | 245, 247, 250 | Background light |
| **Fondo oscuro** | `#1A1A2E` | 26, 26, 46 | Background dark |
| **Borde** | `#E0E0E0` | 224, 224, 224 | Bordes, separadores |

### CSS Variables

```css
:root {
  /* Primary */
  --color-primary: #004B8D;
  --color-primary-light: #4A90D9;
  --color-primary-dark: #003366;
  
  /* Estados */
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-error: #DC3545;
  
  /* Texto */
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-text-inverse: #FFFFFF;
  
  /* Fondo */
  --color-bg-primary: #F5F7FA;
  --color-bg-secondary: #FFFFFF;
  --color-bg-card: #FFFFFF;
  
  /* Bordes */
  --color-border: #E0E0E0;
  
  /* Radio */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

## Modo oscuro

El sistema incluye **toggle de modo oscuro** mediante ThemeContext:

```css
[data-theme="dark"] {
  --color-text-primary: #F5F7FA;
  --color-text-secondary: #A0A0A0;
  --color-bg-primary: #1A1A2E;
  --color-bg-secondary: #16213E;
  --color-bg-card: #1F2937;
  --color-border: #374151;
}
```

**Transiciones:**
- View Transitions API para animación suave
- `flushSync` para sincronización de DOM

---

## Tipografía

### Familia principal

**IBM Plex Sans** (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

body {
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

### Escalera tipográfica

| Tamaño | Uso | CSS |
|--------|-----|-----|
| **24px** | Títulos h1 | `font-size: 1.5rem; font-weight: 700;` |
| **20px** | Títulos h2 | `font-size: 1.25rem; font-weight: 600;` |
| **18px** | Títulos h3 | `font-size: 1.125rem; font-weight: 600;` |
| **16px** | Body | `font-size: 1rem; font-weight: 400;` |
| **14px** | Small | `font-size: 0.875rem; font-weight: 400;` |
| **12px** | Caption | `font-size: 0.75rem; font-weight: 400;` |

---

## Componentes UI

### Button

| Variante | Uso | Estilo |
|----------|-----|--------|
| **primary** | Acciones principales | Fondo azul, texto blanco |
| **secondary** | Acciones secundarias | Fondo transparente, borde |
| **ghost** | Acciones menores | Sin fondo, texto azul |
| **danger** | Acciones destructivas | Fondo rojo |

**Estados:** default, hover, active, disabled

### Input

- Borde redondeado (`--radius-md`)
- Padding consistente (12px 16px)
- Focus: borde azul con shadow
- Error: borde rojo + mensaje

### Card

- Fondo blanco (light) / card (dark)
- Borde sutil
- Sombras suaves
- Padding 16-24px

### Badge

- Estados: default, success, warning, error
- Border-radius: pill (`--radius-full`)
- Padding: 4px 8px

---

## Layout

### AppShell

```
┌────────────────────────────────────────────────────────┐
│  TOPBAR (fixed)                                        │
│  [≡] [Logo] [Buscador]              [Tema] [Avatar]   │
├────────────┬───────────────────────────────────────────┤
│  SIDEBAR   │  CONTENIDO PRINCIPAL                      │
│  (fixed)   │                                           │
│            │  ┌─────────────────────────────────────┐  │
│  [Fichas]  │  │                                     │  │
│  [Almacén] │  │         Route actual                │  │
│  [KPI]     │  │                                     │  │
│  [Presup]  │  │                                     │  │
│  [Formac]  │  │                                     │  │
│  [SONEX]   │  └─────────────────────────────────────┘  │
│            │                                           │
└────────────┴───────────────────────────────────────────┘
```

### Responsive

| Breakpoint | Ancho | Layout |
|------------|-------|--------|
| **Desktop** | > 1024px | Sidebar visible, topbar inline |
| **Tablet** | 640-1024px | Sidebar oculto, hamburguesa |
| **Mobile** | < 640px | Sidebar oculto, hamburguesa |

---

## Accesibilidad

### Implementado

- **Navegación por teclado:** Todos los interactivos tienen `:focus-visible`
- **ARIA labels:** Para iconos sin texto
- **Roles semánticos:** `<nav>`, `<main>`, `<aside>`
- **Contraste:** Cumple WCAG AA (4.5:1 mínimo)

### Ejemplo de implementación

```jsx
<button
  className="hamburger"
  onClick={toggleMenu}
  aria-expanded={isOpen}
  aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
  aria-haspopup="menu"
>
  <MenuIcon />
</button>
```

---

## Iconografía

**Librería:** lucide-react

| Icono | Uso |
|-------|-----|
| `Home` | Navegación inicio |
| `FileText` | Fichas técnicas |
| `Package` | Almacén |
| `AlertTriangle` | Incidencias |
| `BarChart3` | KPIs |
| `FileCheck` | Presupuestos |
| `GraduationCap` | Formación |
| `MessageCircle` | SONEX |
| `Moon` / `Sun` | Tema |
| `LogOut` | Cerrar sesión |

---

## Animaciones

### Transiciones de página

- Fade in/out básico
- Duración: 200-300ms
- Easing: ease-in-out

### Indicadores de estado

| Elemento | Animación |
|----------|-----------|
| Loading | Spinner rotativo |
| Sending | Stream indicator (pulsing) |
| Success | Checkmark animado |
| Error | Shake sutil |

---

## Guías de estilo rápido

### Para nuevos componentes

1. **Usa las variables CSS** — No hardcodear colores
2. **Sigue los tamaños de spacing** — 4, 8, 12, 16, 24, 32, 48
3. **Card tiene padding** — Mínimo 16px
4. **Botones tienen min-height** — 40px
5. **Inputs tienen altura** — 40-44px
6. **Radio consistente** — 4px (sm), 8px (md), 12px (lg)
7. **Sombras sutiles** — No exagerar

---

*Sistema de diseño documentado: Mayo 2026*
*Ver también: app/src/styles/variables.css y componentes en app/src/components/ui/*
