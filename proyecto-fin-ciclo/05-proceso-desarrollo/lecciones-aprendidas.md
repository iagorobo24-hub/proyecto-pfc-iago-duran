# Lecciones Aprendidas — Errores y Aciertos

## Introducción

Esta sección documenta las lecciones más importantes aprendidas durante el proyecto. Incluye tanto errores que cometí como decisiones que funcionaron bien.

---

## Errores que cometí

### Error 1: No empezar con una estructura clara

**Qué pasó:** Empecé con 7 archivos JSX sueltos, cada uno funcionando independientemente. Cuando quise unirlos, tuve que refactorizar todo.

**Por qué fue un error:** Perdí tiempo reescribiendo código que podría haber hecho bien desde el principio.

**Qué habría hecho diferente:** Planea la estructura del proyecto antes de empezar a generar código.

**Lección:** Un poco de planificación ahorra mucho tiempo de refactorización.

---

### Error 2: Exponer la API key en el frontend

**Qué pasó:** La primera versión tenía la clave de API de Anthropic directamente en el código JavaScript. Cualquier usuario podía verla en "Ver código fuente".

**Cómo se detectó:** Un compañero de prácticas lo mencionó.

**Cómo se solucionó:** Crear una Vercel Function que hace de proxy:
```javascript
// api/anthropic.js (serverless)
// El cliente llama a /api/ai, el servidor añade la key y llama a Anthropic
```

**Lección:** Nunca pongas claves en código cliente. Siempre usa un proxy.

---

### Error 3: No hacer tests desde el principio

**Qué pasó:** Creé Playwright tests en la Fase 6, pero después se perdieron en commits y nuncalos recuperé.

**Por qué fue un error:** Sin tests, no hay forma de verificar que los cambios no rompen funcionalidad existente.

**Qué habría hecho diferente:** Integrar tests desde el principio y asegurarlos en el repo.

**Lección:** Los tests son parte del código, no opcionales.

---

### Error 4: Depender de una sola herramienta IA

**Qué pasó:** Me centré en Claude Web durante las primeras semanas. No descubrí Windsurf hasta después.

**Por qué fue un error:** Claude Web tiene límites y no puede acceder al proyecto. Windsurf habría acelerado el desarrollo.

**Cómo se solucionó:** Probar regularmente nuevas herramientas.

**Lección:** Explora alternativas. El ecosistema cambia rápido.

---

### Error 5: No documentar mientras trabajaba

**Qué pasó:** Solo documenté EVOLUCION.md al final de cada sesión grande. En una sesión olvidédocumentar cambios importantes.

**Por qué fue un error:** Después no recordaba por qué había tomado ciertas decisiones.

**Cómo se solucionó:** Hacer commits frecuentes con mensajes descriptivos.

**Lección:** Documenta mientras trabajas. No confíes en la memoria.

---

### Error 6: Elegir Firebase antes de investigar alternativas

**Qué pasó:** Elegí Firestore porque era lo que conocía. Después descubrí que Supabase tiene mejor tier gratuito y PostgreSQL es más familiar.

**Por qué fue un error:** Ahora tengo que hacer una migración.

**Qué habría hecho diferente:** Investigar alternativas antes de decidir.

**Lección:** Dedica tiempo a investigar antes de comprometerte con una tecnología.

---

### Error 7: No validar con usuarios reales

**Qué pasó:** Desarrollé la aplicación sin probarla con técnicos reales de Sonepar (solo con ellos como fuente de requisitos).

**Por qué fue un error:** Puede que las soluciones no resuelvan los problemas reales.

**Qué habría hecho diferente:** Hacer pruebas de usuario durante el desarrollo.

**Lección:** Los usuarios reales validan las soluciones.

---

## Decisiones que funcionaron bien

### Acierto 1: Empezar con artefactos simples

**Qué hice:** Creé versiones simples de cada herramienta como archivos JSX independientes antes de unirlos.

**Por qué funcionó:** 
- Pude validar que cada concepto funcionaba
- No me abrume con toda la complejidad desde el principio
- Era fácil de iterar

**Lección:** Empieza simple, depois complejidad.

---

### Acierto 2: Usar CSS Modules desde el principio

**Qué hice:** Elegí CSS Modules (en lugar de CSS-in-JS o Tailwind) para los estilos.

**Por qué funcionó:**
- No hay runtime overhead
- Los estilos están scoped automáticamente
- Es fácil de entender para otros

**Lección:** Las decisiones simples y consistentes facilitan el mantenimiento.

---

### Acierto 3: Elegir herramientas gratuitas

**Qué hice:** Todo el stack usa tiers gratuitos (Firebase Spark, Vercel Hobby, OpenRouter Free, Windsurf Free).

**Por qué funcionó:**
- El proyecto no tuvo coste
- Puedo mantenerlo después de terminar el ciclo
- No hay presión por monetizar

**Lección:** Para proyectos académicos, el tier gratuito es suficiente.

---

### Acierto 4: Usar un sistema de diseño consistente

**Qué hice:** Definí CSS Variables para colores, espaciados, radios desde el principio.

**Por qué funcionó:**
- La app se ve coherente
- Es fácil cambiar el tema (dark mode)
- Es fácil añadir nuevos componentes

**Lección:** Invierte en sistema de diseño al principio.

---

### Acierto 5: Documentar en Markdown

**Qué hice:** Mantengo README.md, EVOLUCION.md y la documentación del PFC en Markdown.

**Por qué funcionó:**
- Es fácil de escribir y editar
- Se versiona bien en Git
- Se puede convertir a otros formatos

**Lección:** Markdown es el formato ideal para documentación técnica.

---

### Acierto 6: Usar Vercel para deployment

**Qué hice:** Desplegué en Vercel con integración automática desde GitHub.

**Por qué funcionó:**
- Deploy automático en cada push
- URL pública para compartir
- Vercel Functions para la API de IA

**Lección:** La automatización de deployment ahorra tiempo y reduce errores.

---

### Acierto 7: Hacer scraping del catálogo real

**Qué hice:** En lugar de crear productos mock, scrapeé el catálogo real de sonepar.es.

**Por qué funcionó:**
- Los datos son reales y útiles
- La app tiene valor práctico
- Demuestra capacidad técnica

**Lección:** Los datos reales son mejores que los mocks.

---

## Lecciones genéricas para proyectos con IA

### 1. La IA es una herramienta, no un sustituto

**Regla:** Tú diriges, la IA ejecuta.

- Define el qué, la IA genera el cómo
- Revisa siempre el código
- Entiende lo que se genera

### 2. La especificidad importa

**Regla:** Prompts vagos dan resultados vagos.

- Define entradas y salidas
- Especifica tecnología
- Da ejemplos cuando puedas

### 3. La iteración es clave

**Regla:** Mejor pedir poco y iterar que pedir mucho de golpe.

- Versión 1: funcional pero simple
- Versión 2: añadir funcionalidad
- Versión 3: refinar y optimizar

### 4. Documenta como si lo olvidaras todo

**Regla:** Si no está documentado, no existe.

- Commit messages descriptivos
- README actualizado
- Notas en EVOLUCION.md

### 5. El tier gratuito es suficiente

**Regla:** No pagues hasta que tengas que escalar.

- Firebase, Vercel, OpenRouter tienen tiers gratuitos generosos
- Para proyectos académicos, es suficiente
- Puedes escalar después si hace falta

---

## Consejos para futuros alumnos

### Si vas a hacer un proyecto similar:

1. **Dedica tiempo a investigar herramientas** antes de comprometerte
2. **Empieza simple** — primero funciona, depois mejora
3. **Usa herramientas gratuitas** — no necesitas presupuesto
4. **Documenta mientras avanzas** — no lo dejes para el final
5. **Prueba con usuarios reales** — valida lo que haces
6. **No confíes ciegamente en la IA** — revisa siempre
7. **Guarda todo en Git** — el código se puede perder

### Cosas que haré diferente en el futuro:

1. Tests desde el día 1
2. Investigación de alternativas antes de decidir
3. Validación con usuarios durante el desarrollo
4. Más commits frecuentes
5. Mejor planificación inicial

---

## Conclusión

Este proyecto me enseñó tanto sobre desarrollo web como sobre trabajar con IA. Los errores fueron tan valiosos como los aciertos — cada problema me llevó a una solución mejor.

Lo más importante que aprendí: **la IA es un amplificador de tus capacidades, no un sustituto**. Tu juicio, tu documentación y tu revisión son los que hacen que el resultado sea bueno.

---

*Lecciones aprendidas documentadas: Mayo 2026*
*Estas lecciones informarán futuras mejoras del proyecto*
