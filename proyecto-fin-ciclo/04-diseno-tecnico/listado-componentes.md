# Inventario funcional de componentes

Este documento evita mantener conteos rígidos de componentes, hooks o archivos: esos números envejecen con cada refactor. El inventario se organiza por **responsabilidad** y remite al árbol del repositorio para el detalle exacto.

## Capas principales

| Ruta | Responsabilidad |
|---|---|
| `src/components/auth/` | Login y protección de rutas |
| `src/components/layout/` | AppShell, topbar, sidebar y atajos |
| `src/components/fichas/` | Navegación, tarjetas, tablas y detalle de catálogo |
| `src/components/incidencias/` | Lista, formulario y detalle de incidencias |
| `src/components/presupuestos/` | Wizard, selección, editor, gestión y PDF |
| `src/components/simulador/` | Perfil, onboarding, etapas, resultados y multijugador |
| `src/components/sonex/` | Presentación de resultados de producto de SONEX |
| `src/components/ui/` | Componentes visuales reutilizables |
| `src/tools/` | Pantallas de las 7 herramientas + Dashboard Global |
| `src/hooks/` | Estado y lógica reutilizable |
| `src/services/` | Catálogo, IA y servicios auxiliares |
| `src/contexts/` | Auth, tema y toasts |
| `src/utils/` | PDF, sanitización, validación, storage y helpers |

## Componentes de página/routing

`App.jsx` define las pantallas principales y subrutas de Presupuestos. La carga diferida reduce el código inicial que necesita el navegador.

## Hooks destacados

- `useNavegacionFichas`: navegación jerárquica del catálogo.
- `useFichasTecnicas`: búsqueda/selección y enriquecimiento.
- `useUserData`: persistencia Supabase + local.
- `useSonex`: sesiones e historial del chat.
- `useKeyboardShortcuts`: atajos globales.
- `useSimuladorMultijugador`: estado del modo multijugador.

## Servicios destacados

- `catalogService.ts`: acceso tipado al catálogo.
- `anthropicService.ts`: cliente de la API de IA y streaming; el nombre es histórico y no implica que todas las llamadas utilicen Anthropic.
- `sonex*`: intención, búsqueda y orquestación específica de SONEX.

## Regla de mantenimiento

Si se necesita una cifra exacta de componentes, hooks o tests para una entrega, debe calcularse desde el árbol del commit y citarse como snapshot. No se mantiene aquí una cifra manual como parte del contrato del sistema.
