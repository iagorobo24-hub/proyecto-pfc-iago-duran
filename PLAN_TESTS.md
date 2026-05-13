# Plan de Tests para Proyectos PFC

## Visión General
Este plan define la estrategia de testing para la aplicación web Proyectos PFC, incluyendo tests unitarios, de integración y end-to-end (e2e) usando Playwright.

## Alcance
- **Frontend:** Aplicación React (app/src/)
- **Backend:** Vercel Functions (app/api/)
- **Integraciones:** Firebase Auth, Firestore, OpenRouter API
- **Responsive:** Desktop, Tablet, Mobile

## Estrategia de Testing

### 1. Tests Unitarios
**Objetivo:** Verificar lógica individual de funciones, hooks y componentes aislados.
**Herramientas:** Vitest/Jest + React Testing Library
**Cobertura objetivo:** 80%+

**Áreas a testear:**
- Custom hooks (useAuth, useFichas, useAlmacen, etc.)
- Funciones de utilidad (formato de fechas, cálculos, validaciones)
- Componentes UI aislados (Button, Input, Card, Badge)
- Lógica de contexto (AuthContext, ThemeContext, ToastContext)
- Servicios de API (authService, firestoreService, aiService)

### 2. Tests de Integración
**Objetivo:** Verificar interacción entre múltiples componentes y servicios.
**Herramientas:** React Testing Library + Mock Service Worker (MSW)
**Enfoque:**
- Flujo de autenticación completo (login → protected routes)
- Interacción con Firebase Auth (mock)
- Operaciones CRUD en Firestore (mock)
- Integración con servicios de IA (mock OpenRouter)
- Navegación entre páginas y módulos

### 3. Tests End-to-End (e2e)
**Objetivo:** Verificar flujos de usuario completos desde la perspectiva real.
**Herramientas:** Playwright
**Navegadores:** Chromium, Firefox, WebKit
**Dispositivos:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

## Flujos Críticos a Testear (e2e)

### Flujo 1: Autenticación y Acceso
1. **Login exitoso con Google**
   - Navegar a /login
   - Click en botón "Iniciar sesión con Google"
   - Verificar redirección a dashboard (/fichas)
   - Verificar presencia de usuario en UI
   
2. **Protección de rutas**
   - Intentar acceder directamente a /fichas sin login
   - Verificar redirección a /login
   - Intentar acceder a ruta protegida después de logout
   - Verificar redirección a login

3. **Logout**
   - Click en menú de usuario → "Cerrar sesión"
   - Verificar redirección a /login
   - Verificar limpieza de estado de auth

### Flujo 2: Gestión de Fichas Técnicas
1. **Navegación y visualización**
   - Acceder a módulo `/fichas`
   - Verificar carga de lista de fichas (estado loading)
   - Verificar mostrar fichas cuando hay datos
   - Verificar mensaje vacío cuando no hay fichas
   
2. **Búsqueda y filtrado**
   - Buscar ficha por código/descripción
   - Filtrar por categoría/jerarquía
   - Verificar resultados actualizados
   - Limpiar filtros y ver todos los resultados

3. **Detalle de ficha**
   - Click en ficha de la lista
   - Verificar carga de detalle
   - Verificar todos los campos mostrados correctamente
   - Verificar botón "Volver al listado"

### Flujo 3: Simulador de Almacén
1. **Inicio de simulación**
   - Acceder a `/almacen`
   - Verificar estado inicial vacío
   - Seleccionar producto del catálogo
   - Verificar agregado al carrito
   
2. **Proceso de pedido completo**
   - Agregar múltiples productos con cantidades
   - Modificar cantidades en carrito
   - Eliminar items del carrito
   - Calcular total correcto
   - Iniciar proceso de checkout
   - Llenar formulario de datos de entrega
   - Confirmar pedido
   - Verificar pantalla de confirmación con número de pedido
   - Verificar limpieza del carrito

3. **Historial de pedidos**
   - Ver historial de pedidos realizados
   - Ver detalle de pedido específico
   - Ver estados de pedido (pendiente, procesado, completado)

### Flujo 4: Gestión de Presupuestos
1. **Creación de presupuesto**
   - Acceder a `/presupuestos`
   - Click en "Nuevo presupuesto"
   - Llenar datos del cliente
   - Agregar productos del catálogo
   - Aplicar descuentos/impuestos
   - Ver cálculo automático de total
   - Guardar presupuesto
   - Ver lista actualizada con nuevo presupuesto

2. **Operaciones sobre presupuestos**
   - Ver detalle de presupuesto
   - Editar presupuesto existente
   - Duplicar presupuesto
   - Eliminar presupuesto (con confirmación)
   - Exportar presupuesto (PDF/imprimir)

### Flujo 5: Dashboard de KPIs
1. **Visualización de métricas**
   - Acceder a `/kpi`
   - Verificar carga de 6 KPIs con semáforos
   - Verificar tooltips con información detallada
   - Verificar gráfico de tendencia (si aplica)
   
2. **Filtros temporales**
   - Cambiar rango de fechas (últimos 7 días, 30 días, 90 días, personalizado)
   - Ver actualización de KPIs según filtro
   - Ver descarga de informe ejecutivo

### Flujo 6: Asistente Técnico SONEX
1. **Interacción con IA**
   - Acceder a `/sonex`
   - Verificar carga de interfaz de chat
   - Enviar mensaje de prueba
   - Ver respuesta del asistente (con loading y errores manejados)
   - Ver historial de conversación
   - Limpiar conversación
   - Ver sugerencias de preguntas predefinidas

### Flujo 7: Gestión de Incidencias
1. **Registro de incidencia**
   - Acceder a `/incidencias`
   - Click en "Nueva incidencia"
   - Llenar formulario (título, descripción, prioridad, categoría)
   - Adjuntar archivo (opcional)
   - Guardar incidencia
   - Ver aparición en lista de incidencias
   
2. **Operaciones sobre incidencias**
   - Ver detalle de incidencia
   - Cambiar estado (pendiente → en progreso → resuelta → cerrada)
   - Agregar comentario/resolución
   - Filtrar por estado/prioridad/categoría
   - Estadísticas de incidencias

### Flujo 8: Formación Interna
1. **Matriz de competencias**
   - Acceder a `/formacion`
   - Ver matriz empleados × competencias
   - Ver niveles de competencia (0-3)
   - Filtrar por departamento/empleado
   
2. **Planes de formación**
   - Crear plan de formación para empleado
   - Asignar cursos/módulos con fechas
   - Ver progreso del plan
   - Marcar actividades como completadas
   - Ver historial de formación completada

## Consideraciones de Responsive Design
Para cada flujo crítico, verificar:
- **Desktop (≥1024px):** Layout completo con sidebar expandible
- **Tablet (768px-1023px):** Sidebar colapsable, adaptación de grids
- **Mobile (<768px):** Sidebar como drawer, columnas apilables, touch-friendly

## Manejo de Errores y Estados de Carga
Tests deben verificar:
- **Estados loading:** Spinners, placeholders, esqueletos
- **Estados error:** Mensajes de error amigables, botones de reintento
- **Estados vacíos:** Mensajes descriptivos cuando no hay datos
- **Límites de tasa:** Manejo de 429 de APIs externas
- **Offline:** Comportamiento cuando Firebase no está disponible (si aplica)

## Seguridad y Privacidad
Tests para verificar:
- **Protección de rutas:** No acceso a datos sin auth
- **Sanitización:** Prevención de XSS en campos de entrada
- **Privacidad:** No exposición de datos sensibles en URLs o console
- **Tokens:** Manejo adecuado de tokens de auth (no en localStorage plano)

## Performance
Tests básicos para:
- **Tiempo de carga:** Verificar que página principal carga en <3s (en 3G simulado)
- **Renderizado:** Verificar FID y CLS aceptables
- **Recursos:** Verificar optimización de imágenes y bundle splitting

## Estrategia de Mocks
### Firebase Auth
- Mock de providers (Google)
- Simulación de login/logout
- Manejo de diferentes estados de usuario

### Firestore
- Mock de collections: users, fichas, presupuestos, incidencias, etc.
- Simulación de operaciones CRUD
- Manejo de errores de permisos y falta de conexión

### OpenRouter API
- Mock de endpoints de chat/completions
- Simulación de respuestas válidas y errores
- Testing de timeouts y reintentos

### Servicios Externos
- Mock de descarga de PDFs/imágenes
- Simulación de fallos de red

## Organización de Tests
```
app/
├── src/
│   ├── __tests__/                 # Tests unitarios e integración
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── services/
│   │   └── contexts/
│   ├── tests/
│   │   ├── e2e/                   # Tests e2e con Playwright
│   │   │   ├── flows/
│   │   │   │   ├── auth.spec.ts
│   │   │   │   ├── fichas.spec.ts
│   │   │   │   ├── almacen.spec.ts
│   │   │   │   ├── presupuestos.spec.ts
│   │   │   │   ├── kpi.spec.ts
│   │   │   │   ├── sonex.spec.ts
│   │   │   │   ├── incidencias.spec.ts
│   │   │   │   └── formacion.spec.ts
│   │   │   ├── pages/
│   │   │   └── helpers/
│   │   └── fixtures/
│   └── playwright.config.js
```

## Prioridad de Implementación
### Fase 1 (Inmediata)
- Setup de entorno de testing (Vitest, Playwright)
- Tests de autenticación básica
- Tests de rutas protegidas
- Tests de componentes UI críticos

### Fase 2 (Corto plazo)
- Tests de módulos principales: fichas, almacen, presupuestos
- Tests e2e de flujos críticos
- Tests de integración con servicios mock

### Fase 3 (Mediano plazo)
- Tests de módulos secundarios: kpi, sonex, incidencias, formacion
- Tests de responsive design
- Tests de performance básicos
- Tests de seguridad y privacidad

## Métricas de Éxito
- **Cobertura de código:** ≥80% unitarios + integración
- **Tests e2e pasantes:** ≥95% en todos los navegadores/dispositivos
- **Tiempo de ejecución:** Suite completa <5 minutos en CI
- **Feedback rápido:** Tests unitarios <30 segundos en watch mode

## Próximos Pasos
1. Configurar entorno de testing en el repositorio
2. Crear primer test e2e de autenticación como ejemplo
3. Establecer guía de contribución para tests
4. Integrar tests en pipeline de CI/CD (GitHub Actions)
5. Generar reportes de cobertura automáticos

---
*Este plan debe revisarse y actualizarse cada sprint según evolucionen los requerimientos y se agreguen nuevas funcionalidades.*