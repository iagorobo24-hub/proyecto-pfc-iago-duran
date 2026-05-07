---
tool_id: AI-014
nombre: Devin (Cognition AI)
version_observada: Abril 2026 (usado vía GitHub PRs)
rol_principal: Agente de IA autónomo para código y documentación
url: https://cognition.ai/devin
---

# Ficha Técnica: Devin (Cognition AI)

## ¿Qué es?

Devin es un agente de IA autónomo desarrollado por Cognition AI (creadores de GitHub Copilot). A diferencia de los otros agentes, Devin trabaja de forma **autónoma**: recibe una tarea y la ejecuta completamente sin intervención constante, creando commits y PRs en GitHub.

## ¿Para qué lo usé?

### Limpieza y mejora del repositorio

Según el historial de commits, Devin ejecutó las siguientes tareas (a través de PRs automáticos):

```
cd8e106 chore: limpieza completa del repo — eliminar código muerto, 
         documentación obsoleta y archivos duplicados

1e0ef96 fix: actualizar tabla de herramientas con datos reales del Excel
```

### Fixes de bugs

```
caff145 fix: corregir scroll del chat en SONEX — la rueda del ratón no funcionaba
6d8fa8b fix: preferir gama/tipo del scraper + reordenar keywords por especificidad
8fb6aa1 fix: parsePrice maneja formato europeo con separador de miles
```

### Arquitectura de features

```
6595df1 feat: hacer sidebar de SONEX funcional + quitar contexto del turno
```

## ¿Cómo funciona?

1. Devin recibe un issue/ticket en GitHub
2. Crea un branch (`devin/1777538298-sonex-functional-sidebar`)
3. Ejecuta cambios en el código
4. Hace commit y crea PR
5. Tú revisas y haces merge

### Flujo de trabajo

```
Issue creado → Devin clona repo → Analiza código → Ejecuta cambios → Commit → PR
                                                                    ↓
                                                    Tú revisas → Mergas a main
```

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Trabajo autónomo (no requiere supervisión) | ⭐⭐⭐⭐⭐ |
| Commits limpios y bien estructurados | ⭐⭐⭐⭐ |
| Capacidad de análisis de código | ⭐⭐⭐⭐ |
| Documentación de cambios | ⭐⭐⭐ |
| Integración directa con GitHub | ⭐⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **No tiene contexto de negocio:** No entiende que "Sonepar" es una empresa de material eléctrico. Trata todo como código genérico.
2. **A veces propone cambios excesivos:** Algunos PRs incluían cambios que no eran estrictamente necesarios.
3. **No puede preguntar dudas:** Trabaja de forma autónoma, si algo no está claro, hace suposiciones.
4. **Coste:** Devin es un producto de pago (no disclosed pricing publicly).

## Lecciones aprendidas

1. **Los agentes autónomos son útiles para tareas técnicas:** No para diseño, pero sí para refactorización y fixes.
2. **Siempre revisar los PRs:** No hacer merge sin revisar los cambios de Devin.
3. **GitHub como interfaz es bueno:** Los PRs automatizados facilitan la revisión.

## Comparativa con otras herramientas

| Característica | Claude Web | Gemini CLI | OpenCode CLI | Devin |
|---|---|---|---|---|
| Tipo | Conversacional | CLI interactivo | CLI interactivo | Autónomo (GitHub) |
| Interacción | Chat | Chat | Chat | Issue → PR |
| Requiere supervisión | Sí | Sí | Sí | No |
| Autonomía | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Calidad de código | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Coste | Gratis | Gratis | Gratis | $$ |

## Referencias

- [Devin by Cognition](https://cognition.ai/devin)
- [Devin en GitHub](https://github.com/features/devin)

---

**Fecha de elaboración de esta ficha:** Abril 2026