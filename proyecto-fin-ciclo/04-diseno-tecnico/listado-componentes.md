# Listado de Componentes del Sistema

> En un proyecto de automatización normal, aquí iría el listado de entradas y salidas del PLC.
> Como mi proyecto es una aplicación web, este listado recoge todas las piezas que la forman:
> pantallas, componentes, funciones y conexiones con servicios externos.

---

## 1. Rutas de la aplicación (las pantallas)

Cada ruta es una página distinta dentro de la web. Algunas requieren haber iniciado sesión.

| Ruta | Pantalla | ¿Requiere login? | ¿Qué hace? |
|------|----------|------------------|------------|
| `/` | Landing page | No | Página principal con presentación del proyecto |
| `/login` | Inicio de sesión | No | Botón para entrar con Google |
| `/fichas` | Fichas Técnicas | Sí | Catálogo de productos con navegador por familias |
| `/almacen` | Simulador Almacén | Sí | Simulación paso a paso de un pedido |
| `/incidencias` | Dashboard Incidencias | Sí | Registro y seguimiento de fallos |
| `/kpi` | KPI Logístico | Sí | Gráficos con indicadores del almacén |
| `/presupuestos` | Presupuestos | Sí | Generador de presupuestos con productos reales |
| `/formacion` | Formación Interna | Sí | Matriz de competencias de empleados |
| `/sonex` | SONEX Asistente | Sí | Chat con IA para preguntas técnicas |

---

## 2. Componentes de la interfaz

Son los "cachos" de los que está hecha cada pantalla. Separarlos así ayuda a que el código sea más fácil de mantener.

### 2.1 Componentes generales (se usan en varias pantallas)

| Componente | ¿Qué hace? |
|------------|------------|
| `Button` | Botón con varios estilos (principal, secundario, peligro) |
| `Badge` | Etiqueta pequeña para mostrar estados (ej: "Nuevo", "Urgente") |
| `Input` | Campo de texto con etiqueta y mensaje de error |
| `Card` | Caja con sombra para mostrar contenido |
| `Spinner` | Rueda de carga mientras se espera |
| `Modal` | Ventana emergente para confirmar acciones |
| `Toast` | Aviso que aparece y desaparece solo |

### 2.2 Layout (la estructura de la web)

| Componente | ¿Qué hace? |
|------------|------------|
| `AppShell` | Esqueleto principal: barra arriba, menú lateral, contenido en medio |
| `Topbar` | Barra superior con el logo, el tema claro/oscuro y el avatar del usuario |
| `Sidebar` | Menú lateral con los iconos de cada herramienta |

### 2.3 Auth (inicio de sesión)

| Componente | ¿Qué hace? |
|------------|------------|
| `LoginPage` | Pantalla con el botón "Iniciar sesión con Google" |
| `ProtectedRoute` | Envoltura que redirige al login si no has iniciado sesión |

### 2.4 Fichas Técnicas

| Componente | ¿Qué hace? |
|------------|------------|
| `TarjetaFicha` | Muestra un producto con foto, nombre, referencia y marca |

### 2.5 Landing Page

| Componente | ¿Qué hace? |
|------------|------------|
| `HeroContainer` | Sección principal con el título grande |
| `HeroContent` | Texto de presentación |
| `HeroHeader` | Cabecera de la landing |
| `HeroVisual` | Capturas de las herramientas |
| `FeaturesMini` | Lista de características |
| `ToolsShowcase` | Muestra las 7 herramientas |
| `HowItWorks` | Explicación de cómo funciona |
| `StatsSection` | Estadísticas del proyecto |
| `TechStack` | Tecnologías usadas |
| `Roadmap` | Historia de versiones |
| `FinalCTA` | Botón final para empezar |
| `SimpleFooter` | Pie de página |
| `FloatingParticles` | Fondo animado con partículas |
| `AnimatedBackground` | Fondo con animación |
| `TypingEffect` | Texto que se escribe solo |

---

## 3. Hooks (funciones reutilizables)

Los hooks son trozos de código que encapsulan lógica para no repetirla. Son como las "funciones de control" del programa.

| Hook | ¿Para qué sirve? |
|------|-------------------|
| `useAuth` | Gestiona si el usuario ha iniciado sesión o no |
| `useFichas` | Carga los productos del catálogo y gestiona la navegación |
| `useAlmacen` | Controla el flujo de pasos del simulador de almacén |
| `useIncidencias` | Añade, edita y filtra incidencias |
| `useKPI` | Calcula los indicadores del almacén |
| `usePresupuestos` | Gestiona la creación y el historial de presupuestos |
| `useFormacion` | Maneja la matriz de empleados y sus competencias |
| `useSonex` | Controla el chat con la IA (envía mensajes, recibe respuestas) |
| `useScrollReveal` | Detecta cuando un elemento aparece en pantalla (para animaciones) |

---

## 4. Servicios (conexión con el exterior)

Son los archivos que se encargan de hablar con otras aplicaciones o bases de datos.

| Servicio | ¿Qué hace? |
|----------|------------|
| `firebaseConfig.js` | Configura la conexión con Firebase (es como enchufar el aparato) |
| `firestoreService.js` | Función para leer y escribir datos en la base de datos |
| `catalogService.js` | Funciones para buscar productos en el catálogo |
| `brandLogoService.js` | Carga los logos de las marcas de los productos |
| `anthropicService.js` | Antigua conexión con la IA (ahora usa OpenRouter) |

---

## 5. APIs (Vercel Functions)

Son las funciones que se ejecutan en el servidor (no en el navegador del usuario). Solo tenemos una, pero es importante.

| API | ¿Qué hace? |
|-----|------------|
| `api/ai.js` | Recibe un mensaje del usuario, lo envía a OpenRouter (o Groq, o Gemini) y devuelve la respuesta de la IA |

---

## 6. Colecciones en Firestore (la base de datos)

Aquí se guarda todo. Cada usuario tiene sus propios datos.

| Colección | ¿Qué guarda? |
|-----------|--------------|
| `users/{userId}/fichas/` | Productos del catálogo (solo lectura para el usuario) |
| `users/{userId}/presupuestos/` | Presupuestos que ha creado el usuario |
| `users/{userId}/incidencias/` | Incidencias que ha registrado el usuario |
| `users/{userId}/kpis/` | Datos históricos de los indicadores |
| `users/{userId}/formacion/` | Información de los empleados y sus competencias |

---

## 7. Resumen visual

Si tuviera que hacer un esquema como el de un PLC, sería algo así:

```
ENTRADAS (inputs)                    PROCESO (código)                    SALIDAS (outputs)
─────────────────                   ────────────────                    ─────────────────
• Click del usuario       ───→      • React Router (rutas)      ───→    • Pantalla renderizada
• Texto escrito           ───→      • Hooks (lógica)            ───→    • Componentes UI
• Google login            ───→      • AuthContext (sesión)      ───→    • Avatar + nombre
• Datos de Firestore      ───→      • Servicios (firestore)     ───→    • Tarjetas, listas, tablas
• Pregunta al asistente   ───→      • API ai.js → OpenRouter    ───→    • Respuesta de IA
• Tema claro/oscuro       ───→      • ThemeContext               ───→    • Colores cambiados
```

---

*Documento generado: Mayo 2026*
*Equivalente a: listado de señales E/S y esquemas eléctricos en proyectos de automatización*
