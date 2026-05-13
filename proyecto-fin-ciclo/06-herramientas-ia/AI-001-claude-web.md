---
tool_id: AI-001
nombre: Claude (Web) — Anthropic
version_observada: 2025-2026
rol_principal: Diseño de arquitectura y generación de componentes JSX
url: https://claude.ai
---

# Ficha Técnica: Claude Web (Anthropic)

## ¿Qué es?

Claude es un asistente de IA conversacional desarrollado por Anthropic. Tiene dos modalidades de uso relevantes para este proyecto:

- **Claude Web (gratuita):** Interfaz web en claude.ai con uso limitado pero gratuito.
- **Claude API (de pago):** Acceso programático mediante clave de API.

## ¿Para qué lo usé?

Claude Web fue la **primera herramienta de IA** que utilicé en el proyecto, cuando aún no sabía que existían agentes de IA para terminal. Fue fundamental en la fase de diseño inicial:

### Fase 1: Artefactos individuales (marzo 2026)

Generé **7 herramientas como archivos JSX sueltos**, cada uno autocontenido:

1. `Proyectos PFC-almacen-simulador.jsx`
2. `Proyectos PFC-fichas-tecnicas.jsx`
3. `Proyectos PFC-dashboard-incidencias.jsx`
4. `Proyectos PFC-kpi-logistico.jsx`
5. `Proyectos PFC-generador-presupuestos.jsx`
6. `Proyectos PFC-formacion-interna.jsx`
7. `Proyectos PFC-sonex-chatbot.jsx`

Cada artefacto era un archivo React completo con su propio estado, lógica y estilos inline.

### Fase 2: Migración a SPA

Claude también ayudó en el rediseño y reconstrucción de los artefactos sueltos en una **aplicación unificada** con:

- Routing con React Router DOM
- Layout AppShell con Topbar y Sidebar
- Sistema de componentes reutilizables

### Fase 3: Diseño visual

- Definición del sistema de diseño basado en colores corporativos la empresa
- Generación de componentes UI (Button, Badge, Input, Card, etc.)
- Implementación del modo oscuro/claro

## ¿Cómo lo usé? (Flujo de trabajo)

1. Abría claude.ai en el navegador
2. Describía la herramienta que necesitaba con el mayor detalle posible
3. Claude generaba el código JSX completo
4. Copiaba el código en un archivo `.jsx` en VSCode
5. Ejecutaba `npm run dev` para ver el resultado
6. Iteraba añadiendo correcciones y nuevas funcionalidades

## Prompts típicos que utilizaba

> "Crea un simulador de pedidos para un almacén de material eléctrico. Debe incluir: lista de productos con precios, carrito de la compra, cálculo de IVA, opción de recogida o envío, y confirmación del pedido. Usa React hooks y estilos inline."

> "Convierte este artefacto suelto en un componente React que se integre en una SPA con React Router. El componente debe recibir props y mantener todo su estado interno."

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Calidad del código | ⭐⭐⭐⭐⭐ |
| Comprensión del contexto | ⭐⭐⭐⭐⭐ |
| Diseño visual | ⭐⭐⭐⭐⭐ |
| Capacidad de razonamiento | ⭐⭐⭐⭐⭐ |
| Velocidad de respuesta | ⭐⭐⭐ |
| Límites de uso (gratis) | ⭐⭐ |

## Limitaciones que encontré

1. **Límites de uso:** En la versión gratuita, después de unas pocas conversaciones se activaba el rate limit. Tenía que esperar varias horas para continuar.
2. **No editable en tiempo real:** No podía modificar el código directamente en el navegador; era copiar y pegar a VSCode.
3. **Sin acceso al filesystem:** No podía leer mi codebase existente, solo generaba código nuevo.
4. **Coste de API:** Cuando probé la API de Anthropic directamente, el consumo de tokens era elevado y opted por OpenRouter como alternativa gratuita.

## ¿Por qué lo sigo usando / seguiría usando?

- **Es el mejor modelo para razonamiento complejo:** Cuando un problema requiere pensar en capas, Claude es superior.
- **Excelente en diseño de arquitectura:** Para estructurar nueva funcionalidad o refactorizar, da un nivel de detalle excelente.
- **Artefactos nativos:** La capacidad de generar código ejecutable directamente en la conversación es muy práctica para prototipos rápidos.

## ¿Cuándo NO lo usaría?

- Para refactorizaciones masivas de código existente (no tiene acceso al proyecto)
- Para debugging de errores de runtime en tu entorno local
- Para tareas que requieren ejecución de comandos en terminal

## Alternativas consideradas

- **GPT-4 (ChatGPT):** Generó código funcional pero con menor calidad de diseño visual.
- **Gemini (Google):** Muy rápido pero menos preciso en el seguimiento de instrucciones complejas.

## Comparativa con otras herramientas del proyectó

| Característica | Claude Web | Claude API (Anthropic) | OpenRouter |
|---|---|---|---|
| Coste | Gratis (con límites) | $$ (pago por token) | Gratis (modelos free tier) |
| Velocidad | Media | Rápida | Media / variable |
| Calidad de código | Alta | Alta | Alta |
| Acceso a proyecto local | No | No (vía código) | No (vía código) |
| Mejor para | Prototipos, arquitectura | Producción escalable | Producción gratuita |

## Lecciones aprendidas con esta herramienta

1. **La calidad del prompt determina la calidad del código:** Empecé con prompts genéricos y el código era mediocre. Cuando aprendí a ser específico ("usa React hooks no clases", "extráelo en un componente llamado X"), la calidad mejoró drásticamente.
2. **No confíes ciegamente:** Aunque Claude rara vez genera código que rompe, hay que revisar siempre las dependencias, los imports y la lógica de estado.
3. **Iteración vs. monocromo:** Es mejor pedir una versión básica y luego añadir funcionalidad en capas, que pedir todo de golpe.

## Ejemplo de prompt exitoso

```
Necesito un componente React para un generador de presupuestos. Requisitos:
- Lista de productos con buscador en tiempo real
- Carrito donde se acumulen items con cantidad
- Cálculo automático de subtotal, IVA 21% y total
- Botón de "generar presupuesto" que muestre un preview formateado
- Usa React hooks (useState, useEffect) y NO clases
- Estilos con CSS Modules
- Debe ser responsive (móvil + desktop)
- Los productos vienen de un array mock;

Genera solo el componente principal y su CSS Module.
```

## Referencias

- [Anthropic Claude](https://claude.ai)
- [Documentación API de Anthropic](https://docs.anthropic.com)

---

**Fecha de elaboración de esta ficha:** Abril 2026
**Última actualización:** Abril 2026
