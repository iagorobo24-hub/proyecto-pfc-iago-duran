# Plan: Correcciones y Mejoras del Sistema de Memoria

## Estado: Implementado → Necesita Fixes

---

## Fix 1 — `analyze_session` con contenido real

### Problema
`analyze_session(session_id)` ignora `session_id` y re-imprime la lista de sesiones.

### Solución
Usar `session_search(session_id=..., around_message_id=last, window=5)` para obtener los últimos mensajes de la sesión. El contenido real tiene toda la información sobre qué se implementó.

### Cambios en script:
- Importar `session_search` de `hermes_tools`
- `analyze_session` hace `session_search(session_id=id, around_message_id=last_id, window=10)`
- Del contenido: extraer proyectos, estado, decisiones, tool count real (número de mensajes con tool_calls)

---

## Fix 2 — Consumer de `pending_updates.md` (morning-brief)

### Problema
`pending_updates.md` se genera pero nadie lo consume.

### Solución
Crear un segundo cron job, `memory-morning-brief` (9:00 AM):

1. Lee `~/.hermes/cron/output/pending_updates.md`
2. Si existe y tiene contenido real (no solo placeholders):
   → Envía a Telegram: "Buenos días.昨晚 trabajamos en [proyectos]. ¿Aplico los cambios a memoria?"
3. Si usuario responde "sí": ejecuta `honcho_conclude` con los datos del archivo
4. Si no hay nada pendiente: silencio

Este cron SÍ necesita LLM para razonar sobre el contenido del archivo.

---

## Fix 3 — Deduplicación antes de guardar Honcho

### Problema
Cada conclusión nueva crea una entrada, no actualiza la existente.

### Solución
Antes de hacer `honcho_conclude`:
1. `honcho_search` con nombre del proyecto → ¿existe?
2. Si existe: `honcho_conclude` con `action=replace` (eliminando la conclusión anterior)
3. Si no existe: `honcho_conclude` con `action=add`

El skill ya lo dice, falta implementarlo en el comportamiento.

---

## Fix 4 — Honcho project registry (estructura)

### Problema
Honcho tiene facts planos, no hay noción de proyecto activo.

### Solución
Guardar en Honcho un bloque estructurado por proyecto:

```
conclusion: "PROYECTO: GestionaB2B | REPO: ~/gestiona-b2b | ESTADO: active | ULTIMO: Implementado esquema multi-tenant | SIGUIENTE: Autenticación JWT | ULTIMA_SESION: 2026-05-29"
```

Y al inicio de cada sesión:
1. `honcho_profile` → cargar todos los proyectos
2. `session_search` → buscar la última sesión de cada proyecto
3. Mostrar al usuario: "Vemos que GestionaB2B estaba en 'autenticación JWT'. Continúo desde ahí?"

---

## Fix 5 — Tool call counter persistent via memory

### Problema
El skill dice "track tool count" pero no hay forma real de contar entre turnos.

### Solución
Cada vez que el agente detecta un trigger alto (deploy, build, nuevo archivo):
→ Guardar en `memory`: `"session_tool_count: N (al momento del trigger)"`

El contador se inyecta en system prompt para sesiones subsecuentes.

Alternativa más limpia: usar una variable interna del skill que se mantiene mientras la sesión está activa (no persistente entre sesiones).

---

## Fix 6 — Cron inteligente (LLM + no_agent híbrido)

### Problema
`no_agent=True` es tonto, `no_agent=False` falla.

### Solución
El cron de 2 AM ejecuta el script Python (no_agent=True) para:
- Recoger datos (sesiones, timestamps)
- Guardar en `~/.hermes/cron/output/raw_data.json`

El cron de 9 AM (LLM-driven, no_agent=False) hace:
- Leer `raw_data.json`
- Razonar con `honcho_reasoning` sobre qué ha cambiado
- Generar propuesta de update
- Enviar a Telegram

Así cada parte hace lo que mejor sabe hacer.

---

## Fix 7 — Análisis real de sesión vs. título

### Problema
Solo se lee el título de 30 caracteres de la sesión.

### Solución
Para cada sesión en `get_recent_sessions`:
1. Obtener session_id
2. `session_search(session_id, around_message_id, window=10)` → obtener contenido
3. Analizar: proyectos mencionados, estado, decisiones, errores resueltos
4. Guardar todo en `raw_data.json` para que la mañana siguiente tenga datos reales

---

## Fix 8 — Archivo de estado de proyectos

### Problema
No hay un lugar centralizado que diga "qué proyectos existen, dónde están, qué estado tienen".

### Solución
Crear `~/.hermes/project_registry.json`:

```json
{
  "projects": [
    {
      "id": "gestiona-b2b",
      "name": "GestionaB2B",
      "repo": "~/gestiona-b2b",
      "state": "active",
      "next_step": "Autenticación JWT RS256",
      "last_session": "20260529_004052",
      "last_updated": "2026-05-29"
    },
    {
      "id": "sonex",
      "name": "SONEX",
      "repo": "~/sonex",
      "state": "active",
      "next_step": "Navegador de fichas técnicas v2",
      "last_session": "20260528_114412",
      "last_updated": "2026-05-28"
    }
  ]
}
```

- El skill actualiza este archivo después de cada conclusión guardada
- El script lo usa para detección precisa de proyectos
- La próxima sesión puede preguntar "Seguimos con GestionaB2B?"

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `memory_nightly_analyzer.py` | Fix `analyze_session` con `session_search` real, output a `raw_data.json` |
| `project_registry.json` (nuevo) | Estado centralizado de todos los proyectos |
| `memory-conclusion-protocol/SKILL.md` | Añadir deduplicación, tool counter persistente, project registry update |
| Cron `memory-nightly-analyzer` | Mantener `no_agent=True` pero output `raw_data.json` |
| Cron `memory-morning-brief` (nuevo) | LLM-driven, lee `raw_data.json`, propone updates a Honcho |

---

## Orden de implementación

1. **Fix 1** (analyze_session real) — foundation de todo
2. **Fix 8** (project registry) — estructura que lo hace todo más preciso
3. **Fix 7** (contenido real) — usa fix 1
4. **Fix 2** (morning-brief cron) — cierra el loop de feedback
5. **Fix 3** (deduplicación) — previene ruido en Honcho
6. **Fix 4** (Honcho project registry) — contexto al inicio de sesión
7. **Fix 6** (híbrido cron) — calidad del análisis nocturno
8. **Fix 5** (tool counter) — nice-to-have, complejidad alta