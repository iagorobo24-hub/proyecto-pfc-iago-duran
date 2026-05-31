# Presentación del proyecto

## El proyecto en una frase

He creado una **aplicación web con 8 herramientas** pensada para técnicos electricistas, usando **IA generativa** para escribir el código. La idea principal es demostrar que un alumno de ciclo puede hacer algo profesional sin saber programar de antes.

---

## ¿Qué es Proyecto PFC?

Es una web (SPA) con **8 módulos** que resuelven cosas que los técnicos eléctricos se encuentran cada día:

| Módulo | Para qué sirve |
|--------|---------------|
| **Fichas Técnicas** | Buscar productos en un catálogo de 400.000+ referencias, navegando por familias, marcas y gamas |
| **Simulador Almacén** | Simular todo el proceso de un pedido: desde que llega hasta que sale, con cronómetro real e incidencias |
| **Dashboard Incidencias** | Apuntar fallos en equipos industriales y que la IA te diga cuál puede ser la causa |
| **KPI Logístico** | Meter los datos del turno y que te saque 6 indicadores con semáforo (verde/amarillo/rojo) |
| **Presupuestos** | Hacer presupuestos con productos reales del catálogo, con IVA calculado automáticamente |
| **Formación Interna** | Llevar el control de quién sabe qué y generar planes de formación con IA |
| **SONEX** | Chatbot técnico que responde dudas sobre productos, normativas y procedimientos |
| **Dashboard Global** | Panel principal con accesos rápidos a todas las herramientas |

---

## ¿Por qué hice esto?

### Lo que vi en las prácticas

Cuando estaba haciendo las prácticas en una empresa de distribución de material eléctrico, me di cuenta de que los técnicos:

- Se pasaban media hora buscando una ficha técnica de un producto
- No sabían si dos productos eran compatibles entre sí
- Hacían presupuestos a mano en Excel
- No había ningún sitio donde apuntar las incidencias de forma ordenada

### Lo que se me ocurrió

Pensé: ¿por qué no hago una web que junte todo esto? Y como no sé programar, usaría IA para que me escriba el código.

### Lo que hace diferente a este proyecto

No es solo la aplicación. Lo que de verdad tiene gracia es **cómo la he hecho**: documentando cada paso de cómo trabajo con IA, para que otro alumno pueda hacer lo mismo.

---

## Números rápidos

| Dato | Valor |
|------|-------|
| **Productos en catálogo** | 400.000+ |
| **Módulos** | 8 |
| **Tecnologías** | React 19, Vite 7, Supabase, Vercel |
| **Coste** | 0€ (todo gratis) |
| **Herramientas IA probadas** | 15+ |
| **Tiempo** | ~3 meses (marzo-mayo 2026) |
| **Tests** | 272 unitarios + 7 E2E |

---

## ¿A quién le sirve?

### A la empresa
- Los técnicos buscan productos más rápido
- Las incidencias quedan registradas y diagnosticadas
- La formación se puede hacer de forma más organized

### Al ciclo formativo
- Demuestra que la IA generativa sirve para proyectos reales
- Otros alumnos pueden reusear los manuales y las fichas de herramientas
- Todo está documentado

### A mí
- Tengo un proyecto para el portfolio
- He aprendido a desarrollar web en serio
- Sé cómo funciona una base de datos, una API, un deployment...

---

## Tecnologías que usé

```
Frontend:      React 19 + Vite 7 + React Router v7
Estilos:       CSS Modules + Variables CSS + Dark Mode
Auth:          Supabase Auth (Google OAuth)
Base de datos: Supabase PostgreSQL (400K+ productos)
IA:            OpenRouter API (Claude, DeepSeek, Qwen, Gemini)
Hosting:      Vercel (hobby tier, gratis)
Testing:      Vitest (272 tests) + Playwright (7 specs E2E)
Seguridad:    ProtectedRoute, CSP headers, rate limiting
```

---

## Estructura de la memoria

Esta documentación está dividida en 10 capítulos:

1. Presentación del proyecto (este capítulo)
2. Estado del arte — qué es la IA generativa y por qué importa
3. Análisis y requisitos — qué necesitaba la empresa
4. Diseño técnico — cómo está construido
5. Proceso de desarrollo — cómo trabajé con IA
6. Herramientas IA — fichas técnicas de cada una
7. Manuales de uso — cómo se usa cada módulo
8. Resultados — números y validación
9. Conclusiones — qué aprendí y qué haría después
10. Manual para profesores — cómo usar esto en clase

---

*Escrito: Mayo 2026*
*Proyecto Fin de Ciclo — Automatización y Robótica Industrial*
