# Presentación del proyecto

## El proyecto en una frase

Desarrollo de la aplicación **Proyecto PFC**, una **suite de herramientas web** para técnicos eléctricos del sector de distribución de material eléctrico, construida íntegramente con **IA generativa** como metodología de trabajo, demostrando que un estudiante de ciclo formativo puede crear soluciones profesionales sin conocimientos previos de programación.

---

## ¿Qué es Proyecto PFC?

**Proyecto PFC** es una aplicación web (SPA) con **7 módulos funcionales** que resuelven necesidades reales de técnicos electricistas en su día a día:

| Módulo | Función |
|--------|---------|
| **Fichas Técnicas** | Catálogo de 400.000+ productos con navegación jerárquica (familia → marca → gama → referencia) |
| **Simulador Almacén** | Simulación del ciclo completo de un pedido: recepción, almacenamiento, preparación, envío |
| **Dashboard Incidencias** | Registro y diagnóstico de fallos industriales con categorías y niveles de severidad |
| **KPI Logístico** | 6 indicadores clave con visualización de semáforo (verde/amarillo/rojo) + informe ejecutivo exportable |
| **Presupuestos** | Generador de presupuestos con productos reales del catálogo, cálculo automático de IVA |
| **Formación Interna** | Matriz de competencias y planes de formación personalizados por empleado |
| **SONEX** | Asistente técnico con IA que responde preguntas sobre productos, normativas y procedimientos |

---

## ¿Por qué este proyecto?

### El problema encontrado

Durante mis prácticas en una empresa de distribución de material eléctrico, observé que los técnicos:

- Tardaban mucho buscando fichas técnicas de productos
- No tenían acceso fácil a información de compatibilidad entre productos
- Necesitaban calcular presupuestos manualmente
- No existía una forma estandarizada de registrar incidencias

### La solución propuesta

Crear una **herramienta centralizada** que agrupara todas estas funcionalidades en una sola aplicación web, accesible desde cualquier dispositivo.

### El valor diferenciador

Lo que hace único este proyecto no es solo la aplicación en sí, sino **cómo se desarrolló**: utilizando IA generativa como herramienta principal de desarrollo, documentando el proceso para que otros alumnos puedan replicarlo.

---

## Resultados cuantitativos

| Métrica | Valor |
|---------|-------|
| **Productos en catálogo** | 400.000+ |
| **Módulos funcionales** | 8 (7 herramientas + Dashboard Global) |
| **Stack tecnológico** | React 19, Vite 7, Supabase, Vercel |
| **Coste en producción** | 0€ (tier gratuito) |
| **Herramientas IA usadas** | 15+ |
| **Tiempo de desarrollo** | ~3 meses (marzo-mayo 2026) |
| **Tests unitarios** | 272 (Vitest) |
| **Tests E2E** | 7 specs (Playwright) |

---

## Impacto esperado

### Para la empresa
- Reducción del tiempo de búsqueda de productos
- Estandarización en el registro de incidencias
- Mejora en la formación de nuevos técnicos

### Para el ciclo formativo
- Demostración de que IA generativa es viable para proyectos técnicos
- Materiales reutilizables para futuros alumnos
- Metodología documentada

### Para mí
- Portfolio técnico demostrable
- Experiencia real con herramientas profesionales
- Comprensión profunda del desarrollo web moderno

---

## Tecnologías principales

```
Frontend:      React 19 + Vite 7 + React Router v7
Estilos:       CSS Modules + Variables CSS + Dark Mode
Auth:          Supabase Auth (Google OAuth)
Base de datos: Supabase PostgreSQL (400K+ productos)
IA:            OpenRouter API (Claude, DeepSeek, Qwen, Gemini)
Hosting:       Vercel (hobby tier, gratis)
Testing:       Vitest (272 tests) + Playwright (7 specs E2E)
Seguridad:     ProtectedRoute, CSP headers, rate limiting, input sanitization
```

---

## Estructura del documento

Este proyecto fin de ciclo se documenta en 10 capítulos:

1. ✅ Resumen ejecutivo
2. ✅ Estado del arte (IA generativa en desarrollo web)
3. ✅ Análisis de requisitos
4. ✅ Diseño técnico
5. ✅ Proceso de desarrollo con IA
6. ✅ Catálogo de herramientas IA (13 fichas técnicas)
7. ✅ Manuales de uso
8. ✅ Resultados y validación
9. ✅ Conclusiones
10. ✅ Manual para profesores

---

*Documento elaborado: Mayo 2026*
*Proyecto: Proyecto PFC — PFC Automatización y Robótica Industrial*
