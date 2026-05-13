---
tool_id: AI-005
nombre: Qwen CLI
version_observada: Marzo-Abril 2026 (cerrado el 15 abr 2026)
rol_principal: Agente de IA en terminal, ejecución de tareas completas
url: https://qwenlm.ai
---
Qwen CLI fue un agente de IA que ejecutaba tareas directamente desde la terminal. Le decías "refactoriza esto" y él solo lo hacía. Lástima que lo cerraron sin avisar — duró como un mes activo y luego desapareció.

## ¿Qué es?

Qwen CLI es un agente de IA en línea de comandos desarrollado por Alibaba Cloud. Permite ejecutar tareas de desarrollo directamente desde la terminal mediante comandos conversacionales.

**Estado actual: CERRADO (desde el 15 de abril de 2026)**

## ¿Para qué lo usé?

Durante el período en que estuvo disponible (marzo-abril 2026), lo utilicé para:

### Refactorización de código

- Renombrado de archivos y funciones
- Migración de código entre archivos
- Actualización de imports

### Generación de documentación

- Escritura de JSDoc para funciones
- Generación de CHANGELOG
- Documentación de APIs

### Debugging

- Análisis de errores en consola
- Sugerencias de fixes
- Explicación de errores de Vite/build

## ¿Cómo lo usé?

1. Instalaba con `npm install -g @qwen/cli` o similar
2. Ejecutaba `qwen` en la terminal
3. Escribía la tarea en lenguaje natural
4. Qwen ejecutaba acciones en el filesystem

### Ejemplo de uso

```bash
$ qwen
> Refactoriza el hook useSonex para separar la lógica de UI del estado
> Añade JSDoc a todas las funciones
> Ejecuta los tests para verificar que sigue funcionando
```

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Ejecución de tareas completas | ⭐⭐⭐⭐⭐ |
| Acceso al filesystem | ⭐⭐⭐⭐⭐ |
| Integración con el proyecto | ⭐⭐⭐⭐ |
| Coste (era gratuito) | ⭐⭐⭐⭐⭐ |
| Velocidad de respuesta | ⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Errores ocasionales:** A veces ejecutaba comandos incorrectos o borraba algo que no debía.
2. **Rate limits agresivos:** 1000 requests/día parecían mucho pero se agotaban rápido.
3. **Dependencia de conexión:** Sin internet, no funcionaba.
4. **Cerrado inesperadamente:** El servicio dejó de funcionar el 15 de abril de 2026.

## ¿Por qué cerró?

Qwen CLI fue una herramienta de promoción de Alibaba para dar a conocer sus modelos Qwen. Después de unos meses de funcionamiento gratuito, el servicio fue cerrado o transformado en producto de pago.

## Lecciones aprendidas con esta herramienta

1. **Las herramientas gratuitas de grandes empresas son inestables:** Pueden cerrar sin previo aviso.
2. **Hay que tener backup:** Nunca depender de una sola herramienta.
3. **Los agentes CLI son el futuro:** Poder ejecutar tareas completas en la terminal sin cambiar de contexto es extremadamente productivo.

## Alternativas actuales

Después del cierre de Qwen CLI, migré a:

- **OpenCode CLI** — Agente CLI con modelos NVIDIA (gratuito)
- **Gemini CLI** — Agente CLI de Google (en uso actual)
- **Hermes Agent** — Mi agente actual, el que estás usando ahora 😄

## Referencias históricas

- [Qwen LM (Alibaba)](https://qwenlm.ai)
- [Qwen en GitHub](https://github.com/QwenLM)

---

**Nota:** Esta ficha documenta Qwen CLI como herramienta histórica usada en el proyecto. El servicio ya no está disponible.

**Fecha de elaboración de esta ficha:** Abril 2026