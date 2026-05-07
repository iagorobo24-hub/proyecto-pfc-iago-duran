---
tool_id: AI-006
nombre: Gemini CLI
version_observada: 2025-2026
rol_principal: Agente de IA en terminal, generación y ejecución de código
url: https://ai.google.dev/gemini-api/docs/gemini-cli
---

# Ficha Técnica: Gemini CLI

## ¿Qué es?

Gemini CLI es la interfaz de línea de comandos de los modelos Gemini de Google. Permite ejecutar agentes de IA que pueden interactuar con tu codebase, ejecutar comandos y modificar archivos directamente desde la terminal.

## ¿Para qué lo usé?

### Desarrollo iterativo

- Creación de componentes React desde cero
- Modificación de hooks existentes
- Escritura de scripts de sincronización
- Debugging de errores complejos

### Gestión del proyecto

- Análisis del estado del repositorio
- Lectura de múltiples archivos para entender el contexto
- Generación de commits semánticos
- Ejecución de comandos npm/scripts

## ¿Cómo lo usé?

1. Instalaba con npm:
   ```bash
   npm install -g @google/gemini-cli
   ```

2. Ejecutaba en la terminal:
   ```bash
   gemini
   ```

3. Escribía la tarea y Gemini la ejecutaba

### Ejemplo de uso

```bash
$ gemini
> Crea un nuevo hook useTema para el selector de modo oscuro. 
> Debe soportar tanto localStorage como el preference del sistema operativo.
> Añade un indicador visual en el Topbar que muestre el estado actual.
```

Gemini creaba el archivo, lo añadía al proyecto, y ejecutaba tests si los había.

## Autenticación

Gemini CLI requiere autenticación con cuenta de Google:
- Al ejecutar `gemini` por primera vez, abre el navegador
- Autorizas el acceso con tu cuenta de Google
- El token se guarda localmente

## Modelos disponibles

Gemini CLI usa los modelos Gemini de Google:
- **Gemini 2.0 Flash** — Rápido, gratuito, suficiente para la mayoría de tareas
- **Gemini 1.5 Pro** — Más capaz, con contexto más largo (limitado en versión gratuita)

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Ejecución de tareas completas | ⭐⭐⭐⭐⭐ |
| Acceso al codebase completo | ⭐⭐⭐⭐⭐ |
| Contexto largo (análisis de archivos múltiples) | ⭐⭐⭐⭐⭐ |
| Velocidad (Flash) | ⭐⭐⭐⭐⭐ |
| Coste (gratuito) | ⭐⭐⭐⭐⭐ |
| Autenticación Google (fácil) | ⭐⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Errores de autenticación:** La autenticación por cuenta de Google a veces expiraba o fallaba.
2. **Límites de uso:** Aunque gratuito, hay límites de requests por minuto.
3. **Menor calidad que Claude para arquitectura:** Para diseño complejo, prefería Claude Web.
4. **No siempre obedece instrucciones exactas:** A veces interpretaba mal los requisitos.

## ¿Cuándo lo usaba?

✅ **Sí lo usaba:**
- Refactorización de archivos existentes
- Creación de nuevos componentes siguiendo patrones del proyecto
- Scripts de automatización (los 8 scripts en `/scripts`)
- Análisis de errores y debugging

❌ **No lo usaba:**
- Diseño de arquitectura (Claude Web)
- Tareas que requerían mucho razonamiento estratégico
- Cuando fallaba la autenticación (me cambiaba a OpenCode)

## Lecciones aprendidas con esta herramienta

1. **Los agentes CLI cambian el workflow:** No tienes que cambiar de terminal a navegador constantemente.
2. **El contexto importa:** Cuantos más archivos le das a Gemini para analizar, mejores son las respuestas.
3. **Siempre revisar el output:** Los agentes pueden cometer errores. Hay que verificar antes de commit.

## Comparativa con otras herramientas CLI

| Característica | Qwen CLI | Gemini CLI | OpenCode CLI |
|---|---|---|---|
| Estado | Cerrado (abr 2026) | Activo | Activo |
| Coste | Gratis | Gratis (con límites) | Gratis (modelos NVIDIA) |
| Autenticación | Cuenta Alibaba | Cuenta Google | Sin autenticación |
| Calidad | Alta | Alta | Alta |
| Modelos disponibles | Qwen | Gemini | MiniMax, BigPickle, NVIDIA |

## Referencias

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)

---

**Fecha de elaboración de esta ficha:** Abril 2026
**Última actualización:** Abril 2026