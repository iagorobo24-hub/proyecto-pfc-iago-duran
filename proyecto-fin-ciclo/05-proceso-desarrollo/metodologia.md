# Metodología — Cómo trabajé con IA

## Introducción

No empecé con un plan de trabajo escrito. La metodología de este proyecto se fue inventando sobre la marcha, según iba viendo qué funcionaba y qué no con cada herramienta. Esto es lo que acabó siendo mi forma de trabajar.

---

## El enfoque general

### No es "la IA hace todo"

Error común: pensar que la IA reemplaza al desarrollador.

Realidad en este proyecto:

- **La IA genera código** — Pero yo decido qué pedir
- **La IA propone soluciones** — Pero yo elijo la mejor
- **La IA itera** — Pero yo verifico que funcione

### Es "la IA amplify mis capacidades"

```
MI EXPERIENCIA          IA COMO HERRAMIENTA
SIN EXPERIENCIA    →    AMPLIFICADOR
    previa               de mi potencial
─────────────────────────────────────────────────
Prompt          →    Código generado    →    Revisión
Diseño          →    Propuesta          →    Decisión
Problema        →    Análisis           →    Solución
```

---

## El workflow básico

### Fase 1: Análisis (antes de pedir código)

Antes de pedir algo a la IA, necesito:

1. **Entender qué necesito** — No pedir "un código", sino "un componente que haga X"
2. **Conocer el contexto** — Si la IA no tiene acceso al proyecto, proporcionarlo
3. **Definir restricciones** — Tecnologías, estilo, limitaciones

### Fase 2: Prompt

El prompt ideal tiene:

| Elemento | Ejemplo |
|----------|---------|
| **Qué necesito** | "Crea un componente React" |
| **Para qué sirve** | "Para mostrar una tarjeta de producto" |
| **Requisitos técnicos** | "Usa React hooks, CSS Modules" |
| **Datos de entrada** | "Recibe un objeto product como prop" |
| **Qué debe hacer** | "Muestra imagen, nombre, referencia, precio" |
| **Comportamiento** | "Si no hay imagen, muestra placeholder" |

### Fase 3: Revisión

Nunca confiar ciegamente:

1. **Leer el código** — Entender qué hace
2. **Ejecutar** — Ver si funciona
3. **Probar edge cases** — Datos vacíos, errores
4. **Iterar** — Si no funciona, explicar el error

### Fase 4: Integración

El código generado no vive solo:

1. **Adaptar al proyecto** — Imports, rutas, estilos
2. **Conectar con servicios** — APIs, contextos
3. **Documentar** — Para recordar después

---

## Herramientas por fase

### Para análisis y diseño

| Herramienta | Uso | Por qué |
|-------------|-----|---------|
| **Claude Web** | Diseño de arquitectura | Mejor razonamiento complejo |
| **ChatGPT** | Segunda opinión | Rápido, diferente perspectiva |

### Para implementación

| Herramienta | Uso | Por qué |
|-------------|-----|---------|
| **Windsurf** | Coding diario | IDE completo, acceso a proyecto |
| **OpenCode CLI** | Scripts, refactorización | Potencia, acceso terminal |
| **Qwen CLI** (antes) | Tareas complejas | Buenos resultados |

### Para documentación

| Herramienta | Uso | Por qué |
|-------------|-----|---------|
| **Hermes Agent** | Análisis y documentación | Memoria persistente, skills |

---

## El ciclo de iteración

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌──────────┐                                            │
│    │ Prompt   │                                            │
│    │ (Qué     │                                            │
│    │ necesito)│                                            │
│    └────┬─────┘                                            │
│         │                                                  │
│         ▼                                                  │
│    ┌──────────┐                                            │
│    │ Código   │◄────────────────────┐                      │
│    │generado  │                     │                      │
│    └────┬─────┘                     │                      │
│         │                          │                      │
│         ▼                          │                      │
│    ┌──────────┐     NO       ┌─────┴─────┐                │
│    │ Funciona?├──────────────►│ Iterar    │                │
│    └────┬─────┘               │ (corregir)│                │
│         │ SÍ                  └───────────┘                │
│         ▼                                              │
│    ┌──────────┐                                        │
│    │Integrar  │                                        │
│    │+ Document│                                        │
│    └──────────┘                                        │
│         │                                              │
│         ▼                                              │
│    ┌──────────┐                                        │
│    │ Hecho!   │                                        │
│    └──────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Técnicas de prompting que funcionaron

### 1. Prompting iterativo

```
MALO:  "Crea toda la app"
BUENO: "Crea el componente Card primero"
        → Funciona → "Ahora crea una lista de Cards"
        → Funciona → "Añade filtros a la lista"
```

### 2. Proporcionar contexto

```
SIN CONTEXTO:
"Crea un botón"

CON CONTEXTO:
"Crea un botón primary que siga el sistema de diseño del proyecto:
- Color: var(--color-primary)
- Padding: 12px 24px
- Radio: var(--radius-md)
- Usa CSS Modules"
```

### 3. Especificar restricciones

```
"Crear una función que:
- Use async/await (NO then/catch)
- Lance excepciones (NO devuelva errores)
- Tenga TypeScript si es posible"
```

### 4. Dar ejemplos

```
"Ahora necesito una función que valide email.
Ejemplo de comportamiento válido: 'user@example.com' → true
Ejemplo de comportamiento inválido: 'not-an-email' → false"
```

---

## Errores metodológicos que cometí

### Error 1: Prompt too broad

Al principio pedía cosas como "crea una app de tareas" y el resultado era inutilizable.

**Corrección:** Dividir en piezas pequeñas.

### Error 2: No revisar el código

A veces copiaba el código sin entenderlo y luego no sabía debugearlo.

**Corrección:** Siempre entender antes de integrar.

### Error 3: Depender de una herramienta

Me centré en Claude Web y no descubrí Windsurf hasta más tarde.

**Corrección:** Probar herramientas regularmente.

### Error 4: No documentar decisiones

Al cabo de semanas no recordaba por qué había elegido cierto enfoque.

**Corrección:** Escribir en EVOLUCION.md después de cada sesión.

---

## Métricas del proceso

| Métrica | Valor |
|---------|-------|
| Prompts enviados (aprox) | 500+ |
| Horas con IA | 100+ |
| Código generado por IA | ~80% |
| Código que se usó | ~60% |
| Iteraciones promedio por feature | 2-3 |

---

## Conclusión

La metodología no es rígida. Es un **framework mental**:

1. **Entender antes de pedir**
2. **Pedir específico, no vago**
3. **Revisar siempre**
4. **Iterar rápido**
5. **Documentar después**

Con práctica, este proceso se vuelve natural. Al final del proyecto, ya no pensaba en "cómo pedir", simplemente sabía qué necesitaba y cómo expresarlo.

---

*Metodología documentada: Mayo 2026*
*Ver también: EVOLUCION.md para cronología real*
