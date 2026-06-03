# Referencia: Modo Oscuro

> Reglas detalladas extraídas de CLAUDE.md. Lo esencial queda en MAIN.md.

## Cómo se activa

`data-theme="dark"` en `<html>`, manejado por `ThemeContext.jsx`. Variables globales en `variables.css` se redefinen bajo `[data-theme="dark"]`.

## Reglas obligatorias

1. **`var(--white)` para fondos → NO** — Usa `var(--color-surface)` (cards/paneles) y `var(--color-bg)` (página). `--white` en dark mode es `#1c2439`.

2. **`background: white` → NO** — Siempre variables CSS semánticas.

3. **Variables semánticas, no grises por número:**

   | En vez de | Usar |
   |---|---|
   | `var(--gray-50)` | `var(--color-bg)` |
   | `var(--gray-100)` | `var(--color-border)` |
   | `var(--gray-200)` | `var(--color-border)` |
   | `var(--gray-500)` | `var(--color-text-secondary)` |
   | `var(--gray-700)` | `var(--color-text)` |
   | `var(--gray-900)` | `var(--color-text)` |
   | `var(--white)` | `var(--color-surface)` |
   | `#fff` / `white` | `var(--color-surface)` |

4. **Todo componente con `background` necesita selector dark:**
   ```css
   :global([data-theme="dark"]) .miCard {
     background: var(--color-surface);
     border-color: var(--color-border);
   }
   ```

5. **Selectores dark al final de cada CSS Module** — Justo antes de media queries.

6. **SimpleFooter (landing) es excepción** — Usar fondo fijo `#070a10` en dark mode.

7. **`var(--white)` solo para texto sobre fondo de color** — Botones `--brand-primary`, avatar gradients. Nunca fondos.

8. **Gradientes con `var(--white)` o `var(--blue-50)`** → Reemplazar por `var(--color-surface)` y `var(--blue-100)`.

## Variables que sí cambian automáticamente

| Variable | Light → Dark |
|---|---|
| `--color-surface` | blanco → gris oscuro |
| `--color-bg` | gris claro → casi negro |
| `--color-bg-alt` | alternativo |
| `--color-border` | bordes |
| `--color-text` | texto principal |
| `--color-text-secondary` | texto secundario |
| `--color-text-tertiary` | texto terciario |
| `--color-brand` | azul → ámbar |
