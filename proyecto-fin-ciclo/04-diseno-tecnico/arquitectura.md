# Arquitectura del Sistema

## Visión general

**Proyecto PFC** es una **Single Page Application (SPA)** construida con React 19, desplegada en Vercel, con autenticación y base de datos en Firebase, e integrada con OpenRouter para funcionalidades de IA.

---

## Diagramas del sistema

En vez de esquemas eléctricos (que no tocan aquí), el proyecto tiene diagramas visuales que explican cómo está montado todo. Están hechos con Excalidraw y guardados como SVG en la carpeta `diagramas/`.

### Diagrama de arquitectura general

El archivo `diagramas/arquitectura_sistema.svg` muestra cómo se conectan todas las piezas:

```
Navegador (React) ──→ Firebase Auth ──→ Google Login
                  ──→ Firestore ──→ Base de datos
                  ──→ Vercel Functions ──→ OpenRouter ──→ IA
```

**Para verlo:** abrir el archivo `diagramas/arquitectura_sistema.svg` en cualquier navegador.

### Otros diagramas disponibles

En la carpeta `diagramas/` hay más esquemas que ayudan a entender el proyecto:

| Archivo | Muestra |
|---------|---------|
| `arquitectura_sistema.svg` | Cómo se conectan frontend, Firebase, Vercel y la IA |
| `modelo_datos.svg` | Estructura de las colecciones en Firestore |
| `modulos_funcionales.svg` | Los 7 módulos y cómo se relacionan entre sí |
| `seguridad_capas.svg` | Las 4 capas de seguridad (auth, datos, red, API) |
| `flujo_desarrollo_ia.svg` | Cómo se usó la IA durante el desarrollo |
| `fases_desarrollo.svg` | Las 12 fases del proyecto en orden cronológico |
| `comparativa_herramientas_ia.svg` | Comparación visual de las herramientas IA usadas |
| `resultados_cuantitativos.svg` | Gráficos con los resultados numéricos del proyecto |

---

## Componentes principales

### Capa de presentación (Frontend)

| Componente | Tecnología | Función |
|------------|------------|---------|
| **App.jsx** | React Router v7 | Routing, rutas protegidas |
| **AppShell** | Layout | Estructura común (Topbar, Sidebar) |
| **ThemeContext** | React Context | Modo claro/oscuro |
| **AuthContext** | React Context | Estado de autenticación |
| **ToastContext** | React Context | Notificaciones |

### Módulos de aplicación

| Módulo | Componente | Descripción |
|--------|------------|-------------|
| **Fichas Técnicas** | `TarjetaFicha` | Catálogo de productos |
| **Almacén** | `SimuladorAlmacen` | Flujo de pedido |
| **Incidencias** | `DashboardIncidencias` | Registro y seguimiento |
| **KPI** | `KpiDashboard` | Indicadores visuales |
| **Presupuestos** | `GeneradorPresupuestos` | Creación de presupuestos |
| **Formación** | `GestionFormacion` | Matriz de competencias |
| **SONEX** | `ChatSonex` | Asistente IA |

### Capa de datos

| Servicio | Tecnología | Función |
|----------|------------|---------|
| **catalogService** | Firestore | Lectura de productos |
| **authService** | Firebase Auth | Autenticación |
| **aiService** | OpenRouter | Chat con IA |

---

## Flujo de datos

### Flujo 1: Carga de catálogo

```
1. Usuario entra en Fichas Técnicas
2. Hook useFichasTecnicas se monta
3. catalogService.getHierarchy() → jerarquía familias/marcas/gamas
4. catalogService.getProductosPorFiltro() → productos filtrados
5. Componente renderiza con datos
```

### Flujo 2: Chat con SONEX

```
1. Usuario envía mensaje
2. handleSendMessage() llama a aiService
3. aiService.sendMessage() → Vercel Function /api/ai
4. Vercel Function → OpenRouter API (Claude/GPT)
5. Respuesta.stream() → UI con streaming
6. useEffect detecta referencias → añade botones "Ver ficha"
```

### Flujo 3: Autenticación

```
1. Usuario entra en app
2. ProtectedRoute verifica AuthContext
3. Si no auth → redirect a /login
4. LoginPage → Firebase Google OAuth
5. onAuthStateChanged → AuthContext actualizado
6. Redirect a HomePage
```

---

## Capas de seguridad

### Capa 1: Autenticación
- Firebase Auth (Google Sign-In)
- Sesión persistente

### Capa 2: Autorización
- Firebase Security Rules
- Datos por usuario (`auth.uid`)

### Capa 3: Red
- HTTPS obligatorio (Vercel)
- CSP headers

### Capa 4: API
- API key en servidor (Vercel Function)
- No expuesta al cliente

---

## Servicios externos

| Servicio | Uso | Tier |
|----------|-----|------|
| **Firebase Auth** | Autenticación | Spark (gratis) |
| **Firestore** | Base de datos | Spark (gratis) |
| **Vercel** | Hosting + Functions | Hobby (gratis) |
| **OpenRouter** | API de IA | Free (gratis) |

---

## Consideraciones de escalabilidad

### Problema: 400K+ productos

**Solución implementada:**
- Paginación en Firestore (`.limit(50)` + cursor)
- Búsqueda por keywords precalculadas
- Navegación jerárquica (no listado plano)

### Problema: Rate limits

**Solución:**
- OpenRouter tiene límites diarios
- MessageQueue para evitar flooding
- UI muestra estado de "escribiendo..."

### Problema: Coste

**Solución:**
- Solo tier gratuito
- Alertas de uso (pendiente)
- Migración a Supabase en curso

---

*Arquitectura documentada: Mayo 2026*
*Ver también:*
- `listado-componentes.md` — Inventario completo de rutas, componentes, hooks y APIs
- `EVOLUCION.md` — Cronología de decisiones técnicas
- `diagramas/` — Esquemas visuales del sistema*
