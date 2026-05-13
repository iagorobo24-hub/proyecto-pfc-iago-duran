# Líneas Futuras — Mejoras y Ampliaciones

## Introducción

Este documento enumera las posibles mejoras y ampliaciones del proyecto, tanto a corto como a medio y largo plazo.

---

## Corto plazo (0-3 meses)

### 1. Completar migración a Supabase

**Estado:** En progreso

- Migrar catálogo de Firestore a Supabase
- Actualizar catalogService
- Beneficio: mejor escalabilidad, PostgreSQL

### 2. Tests E2E con Playwright

**Estado:** Pendiente

- Recuperar suite de tests perdidos
- Añadir a CI/CD
- Cobertura: login, navegación, módulos principales

### 3. Mejora de SONEX

**Estado:** Pendiente

- Modelo más capaz (Claude Sonnet)
- Contexto de conversación más amplio
- Historial persistente

---

## Medio plazo (3-12 meses)

### 4. APP móvil

**Estado:** Idea

- PWA (Progressive Web App)
- O bien React Native / Expo
- Funcionalidad offline

### 5. Integración con la empresa

**Estado:** Idea

- Acceso a sistemas internos (con autorización)
- Sincronización automática de catálogo
- API oficial de productos

### 6. Módulo de pedidos real

**Estado:** Idea

- Conexión con ERP
- Seguimiento de pedidos reales
- Notificaciones

### 7. Multiidioma

**Estado:** Idea

- Español (actual)
- Inglés
- Otros idiomas relevantes

---

## Largo plazo (12+ meses)

### 8. IA que mantenga el proyecto

**Estado:** Idea

- Agentes que hagan mantenimiento automático
- Actualización de dependencias
- Fix de bugs

### 9. Expansión a otras empresas

**Estado:** Idea

- Adaptar el modelo a otros distribuidores
- Plantilla reutilizable
- SaaS

### 10. Comunidad

**Estado:** Idea

- Foro de usuarios
- Mejoras propuestas
- Documentación colaborativa

---

## Mejoras técnicas identificadas

| Mejora | Prioridad | Dificultad |
|--------|-----------|------------|
| Migración Supabase | Alta | Media |
| Tests E2E | Alta | Baja |
| Mejora SONEX | Media | Alta |
| PWA | Media | Media |
| TypeScript | Baja | Alta |
| GraphQL | Baja | Alta |

---

## Deprecaciones y riesgos

### Herramientas que pueden desaparecer

| Herramienta | Riesgo | Alternativa |
|-------------|--------|-------------|
| Qwen CLI | Cerró en abril 2026 | OpenCode, Hermes |
| Firebase Spark | Puede cambiar | Supabase |

### Mantenimiento necesario

| Componente | Frecuencia |
|------------|------------|
| Dependencias npm | Mensual |
| Documentación | Trimestral |
| Tests | Con cada feature |

---

## Cómo contribuir

Si quieres continuar este proyecto:

1. **Clona el repo:** `git clone https://github.com/iagorobo24-hub/proyecto-pfc-iago-duran`
2. **Instala dependencias:** `cd app && npm install`
3. **Ejecuta en local:** `npm run dev`
4. **Revisa los issues:** Busca en GitHub

---

*Lineas futuras documentadas: Mayo 2026*
*Ver también: TODO.md para tareas inmediatas*
