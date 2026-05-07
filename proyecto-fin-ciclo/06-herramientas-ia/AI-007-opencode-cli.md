---
tool_id: AI-007
nombre: OpenCode CLI
version_observada: 2025-2026
rol_principal: Agente CLI con modelos NVIDIA, ejecución de tareas de desarrollo
url: https://opencode.ai
---

# Ficha Técnica: OpenCode CLI

## ¿Qué es?

OpenCode CLI es un agente de IA en terminal que usa los modelos de NVIDIA (a través de su plataforma). Es completamente gratuito y no requiere autenticación. Funciona mediante una API que conecta con los modelos NVIDIA Nemotron, MiniMax y otros.

## ¿Para qué lo usé?

### Desarrollo principal (herramienta actual)

OpenCode se convirtió en mi herramienta principal de desarrollo en terminal:

- **Creación de archivos:** Generaba componentes React, hooks, servicios
- **Refactorización:** Mejoraba código existente siguiendo los patrones del proyecto
- **Debugging:** Analizaba errores y proponía soluciones
- **Scripts:** Creaba scripts de sincronización (sync-catalog-enhanced.mjs, verify-data.mjs, etc.)

### Análisis del repositorio

Con `opencode --repo` podía analizar el codebase completo:
- Entender la estructura del proyecto
- Identificar patrones y convenciones
- Proponer mejoras de arquitectura

## ¿Cómo lo usé?

1. Instalaba con npm:
   ```bash
   npm install -g opencode
   ```

2. Ejecutaba con:
   ```bash
   opencode
   # o con análisis de repo:
   opencode --repo /ruta/al/proyecto
   ```

3. Escribía la tarea y OpenCode la ejecutaba

### Ejemplo de uso

```bash
$ opencode
> Analiza el hook useSonex y crea tests unitarios con Vitest
> Los tests deben cubrir: envío de mensajes, cambio de modo, cambio de categoría

> Crea un nuevo componente Button que siga el patrón de los demás componentes UI en /components/ui/
> Debe soportar: variants (primary/secondary/ghost), sizes (sm/md/lg), loading state
```

## Modelos disponibles

OpenCode conecta con los modelos NVIDIA a través de su API:

| Modelo | Uso | Calidad |
|--------|-----|---------|
| NVIDIA Nemotron | General | ⭐⭐⭐⭐ |
| MiniMax | Rápido | ⭐⭐⭐ |
| BigPickle | Código | ⭐⭐⭐⭐ |

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Coste (100% gratis, sin AUTH) | ⭐⭐⭐⭐⭐ |
| Ejecución de tareas completas | ⭐⭐⭐⭐⭐ |
| Acceso al filesystem | ⭐⭐⭐⭐⭐ |
| Modelos NVIDIA (alta calidad) | ⭐⭐⭐⭐ |
| Sin límites de autenticación | ⭐⭐⭐⭐⭐ |
| Integración con repos locales | ⭐⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Modelo a veces lento:** Especialmente con modelos grandes, la respuesta puede tardar segundos.
2. **Errores ocasionales:** Como todo agente, a veces genera código con bugs.
3. **No tiene acceso a internet:** No puede buscar documentación externa.

## ¿Cuándo lo usaba?

✅ **Sí lo usaba:**
- Tareas de refactorización
- Creación de nuevos archivos siguiendo patrones existentes
- Scripts de automatización
- Análisis de errores

❌ **No lo usaba:**
- Tareas que requieren información actualizada (documentación, cambios recientes)
- Cuando necesitaba buscar en internet

## Lecciones aprendidas con esta herramienta

1. **Los modelos NVIDIA son unterschätz:** Nemotron produce código de alta calidad.
2. **La clave está en ser específico:** Cuanto más detallados los requisitos, mejor el resultado.
3. **Siempre verificar:** Revisar el código generado antes de commit.

## Comparativa con otras herramientas CLI

| Característica | Qwen CLI | Gemini CLI | OpenCode CLI | Hermes CLI |
|---|---|---|---|---|
| Estado | Cerrado | Activo | Activo | Activo |
| Coste | Gratis | Gratis | Gratis | Gratis |
| Autenticación | Sí (Alibaba) | Sí (Google) | No | No |
| Calidad código | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Modelos | Qwen | Gemini | NVIDIA | NVIDIA |
| Velocidad | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

## Referencias

- [OpenCode](https://opencode.ai)
- [NVIDIA Nemotron](https://build.nvidia.com/nvidia/nemotron-3-4b-super-free)

---

**Fecha de elaboración de esta ficha:** Abril 2026