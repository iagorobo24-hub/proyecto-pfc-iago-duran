# Planning: Limpieza de BD y Corrección de Navegación Fichas Técnicas

> **Fecha**: 2026-06-01
> **Estado**: Plan (READ-ONLY)
> **Objetivo**: Garantizar coherencia en la clasificación de productos y que la navegación en fichas técnicas funcione correctamente con todas las familias.

---

## FASE 0: Preparación y Backup

### 0.1 Backup de la base de datos
- [ ] Exportar toda la tabla `products` a JSON como backup
- [ ] Exportar toda la tabla `brands` a JSON como backup
- [ ] Guardar ambos archivos en `app/scripts/backups/`

### 0.2 Script de verificación post-cambios
- [ ] Crear script `app/scripts/verify-taxonomy.mjs` que verifique:
  - No haya productos con nombre "Todos los Productos"
  - No haya subfamilias duplicadas por diferente capitalización
  - Todas las subfamilias de DP estén en `categoriaMapping.js`
  - Todos los tipos de DP estén normalizados
  - No haya productos con familia inexistente

---

## FASE 1: Limpieza de Datos Críticos

### 1.1 Eliminar productos placeholder
**Problema**: ~720+ productos tienen `name = 'Todos los Productos'` — son placeholders sin datos reales. Afectan a:
- DP: ~100+ productos (Schneider)
- AUTOMATIZACION: ~200+ productos (Schneider)
- FOTOVOLTAICA: 19 productos (Schneider, subfamilia "Fotovoltaica")
- VEHICULOS_ELECTRICOS: 7 productos (Schneider, subfamilia "VEHICULOS_ELECTRICOS")

**Acción**:
- [ ] Crear script `app/scripts/clean-placeholders.mjs`
- [ ] Eliminar todos los productos donde `name = 'Todos los Productos'`
- [ ] Verificar que no se eliminan productos válidos (duplicar lógica de verificación)

**Justificación**: Estos productos no tienen datos útiles (nombre genérico, probablemente sin imagen/PDF). Inflan artificialmente las estadísticas y aparecen en búsquedas sin valor.

**Impacto en navegación**: Tras eliminarlos, algunas subfamilias pueden quedar vacías (ej: "Fotovoltaica" queda con 0 productos). Verificar y limpiar subfamilias vacías.

### 1.2 Corregir subfamilia "Contactores" → "Contactor"
**Problema**: 2 productos en DP tienen `subfamilia = 'Contactores'` (con 's'), pero `categoriaMapping.js` espera `'Contactor'` (sin 's').

**Acción**:
- [ ] Script: `UPDATE products SET subfamilia = 'Contactor' WHERE subfamilia = 'Contactores'`
- [ ] Verificar que los 2 productos ahora aparecen en la categoría "Control Motor"

### 1.3 Corregir familia de productos Siemens fuera de DP
**Problema**: 2 productos Siemens están en familias inexistentes:
- `7KG96611EB11` → familia `MEDICION` (no existe)
- `6ES72121HE430XB8` → familia `AUTOMACION INDUSTRIAL` (no existe)

**Acción**:
- [ ] Revisar qué familia es correcta para cada producto
- [ ] Opción A: Moverlos a `AUTOMATIZACION` si corresponden
- [ ] Opción B: Eliminarlos si son datos erróneos
- [ ] Decisión: `7KG96611EB11` (Energy Meter) → `INSTALACION` (subfamilia: `Contador eléctrico`)
- [ ] Decisión: `6ES72121HE430XB8` (PLC S7-1200) → `AUTOMATIZACION` (subfamilia: `Autómata Programable`)

---

## FASE 2: Normalización de Subfamilias

### 2.1 Subfamilias de DISTRIBUCION DE POTENCIA

**Estado actual** (21 subfamilias):
```
Interruptor Magnetotérmico: 791
Accesorio: 62
Interruptor Diferencial: 40
Caja Distribucion: 24
Proteccion Sobretension: 23
Interruptor Seccionador: 17
Cortacircuito Fusible: 16
Toma Corriente Industrial: 7
Caja Conexion: 3
Conmutador: 3
Control Aislamiento: 2
Central Reporte: 2
Contactores: 2          ← CORREGIR a "Contactor"
Relés de Seguridad: 1   ← NO ESTÁNDAR
Rearmador: 1
Bornas: 1               ← NO ESTÁNDAR
Arrancadores Suaves: 1  ← NO ESTÁNDAR
Timbre: 1
Zumbador: 1
Contador eléctrico: 1
Fuente Alimentacion: 1
```

**Acciones**:
- [ ] `Contactores` → `Contactor` (ya cubierto en 1.2)
- [ ] `Relés de Seguridad` → decidir: ¿a `Elemento de Control`? ¿nueva subfamilia?
  - **Decisión**: Mantener como subfamilia propia `Relé de Seguridad` (1 producto, no justifica agrupar)
  - [ ] Añadir a `categoriaMapping.js` → categoría `Accesorios`, subcategoría `Relés y seguridad`
- [ ] `Bornas` → decidir: ¿a `Accesorio`?
  - **Decisión**: Mantener como `Bornas` (1 producto)
  - [ ] Añadir a `categoriaMapping.js` → categoría `Accesorios`, subcategoría `Bornas y terminales`
- [ ] `Arrancadores Suaves` → decidir: ¿a `Elemento de Control`? ¿nueva subfamilia?
  - **Decisión**: Mantener como `Arrancador Suave` (singular, 1 producto)
  - [ ] Añadir a `categoriaMapping.js` → categoría `Control Motor`, subcategoría `Arrancadores suaves`
- [ ] Renombrar `Caja Distribucion` → `Caja de Distribución` (consistencia con `Caja de Conexión`)
- [ ] Renombrar `Caja Conexion` → `Caja de Conexión`
- [ ] Renombrar `Toma Corriente Industrial` → `Toma de Corriente Industrial`
- [ ] Renombrar `Fuente Alimentacion` → `Fuente de Alimentación`
- [ ] Renombrar `Central Reporte` → `Central de Reporte`
- [ ] Renombrar `Control Aislamiento` → `Control de Aislamiento`

### 2.2 Subfamilias de AUTOMATIZACION

**Estado actual** (7 subfamilias):
```
Automatización: 314        ← GENÉRICA - necesita desglose
Interruptor Diferencial: 54
Contactor: 50
Elemento de Control: 42
Bloque Mando Osmoz: 21
Fuente Alimentacion: 4
Pulsador Osmoz: 3
```

**Tipos encontrados en productos "Automatización"** (ya están bien clasificados por tipo):
```
CARRIL DIN: 174
Relé Térmico: 117
Contactor Industrial: 71
Interruptor Motor: 52
Variador Frecuencia: 43
Autómata Programable: 20
Sistema Control: 5
Soft Starter: 4
Actuador Válvula: 2
```

**Problema**: `Automatización` (314 productos) es una subfamilia genérica. Los TIPOS ya son específicos, pero la SUBFAMILIA no.

**Acción**: Usar el campo `tipo` para clasificar en subfamilias específicas:
- [ ] `Variador de Frecuencia` → tipo = "Variador Frecuencia" (43 prod)
- [ ] `Autómata Programable` → tipo = "Autómata Programable" (20 prod)
- [ ] `Relé Térmico` → tipo = "Relé Térmico" (117 prod)
- [ ] `Contactor Industrial` → tipo = "Contactor Industrial" (71 prod)
- [ ] `Interruptor Motor` → tipo = "Interruptor Motor" (52 prod)
- [ ] `Sistema de Control` → tipo = "Sistema Control" (5 prod)
- [ ] `Arrancador Suave` → tipo = "Soft Starter" (4 prod)
- [ ] `Actuador de Válvula` → tipo = "Actuador Válvula" (2 prod)

**Script de migración**:
```javascript
// Migrar subfamilia "Automatización" usando el tipo
const MIGRATION_MAP = {
  'Variador Frecuencia': 'Variador de Frecuencia',
  'Autómata Programable': 'Autómata Programable',
  'Relé Térmico': 'Relé Térmico',
  'Contactor Industrial': 'Contactor Industrial',
  'Interruptor Motor': 'Interruptor Motor',
  'Sistema Control': 'Sistema de Control',
  'Soft Starter': 'Arrancador Suave',
  'Actuador Válvula': 'Actuador de Válvula',
  'CARRIL DIN': 'Automatización',  // fallback para los 174 de CARRIL DIN
}
```

### 2.3 Subfamilias de INSTALACION

**Estado actual** (6 subfamilias):
```
Instalación: 168           ← GENÉRICA - necesita desglose
Canal Instalacion: 24
Canal Cuadros: 24
Minicanal: 24
Bandeja Portacables: 24
Canalizacion: 24
```

**Tipos encontrados en productos "Instalación"** (ya están bien clasificados por tipo):
```
BORNIERA: 62
CANALES: 48
Piloto luminoso: 46
Contador eléctrico: 31
MINICANALES: 24
BANDEJAS: 24
CANALIZACION: 24
Módulo I/O: 20
CARRIL DIN: 5
Módulo Comunicación: 2
Caja Conexion: 2
```

**Problema**: `Instalación` (168 productos) es genérica. Los TIPOS ya son específicos.

**Acción**: Usar el campo `tipo` para clasificar en subfamilias específicas:
- [ ] `Borniera` → tipo = "BORNIERA" (62 prod) → mantener en INSTALACION
- [ ] `Canal` → tipo = "CANALES" (48 prod) → unir con "Canal Instalacion" existente
- [ ] `Piloto Luminoso` → tipo = "Piloto luminoso" (46 prod) → mover a DP (subfamilia "Accesorio")
- [ ] `Contador Eléctrico` → tipo = "Contador eléctrico" (31 prod) → mantener en INSTALACION
- [ ] `Mini Canal` → tipo = "MINICANALES" (24 prod) → unir con "Minicanal" existente
- [ ] `Bandeja Portacables` → tipo = "BANDEJAS" (24 prod) → unir con "Bandeja Portacables" existente
- [ ] `Canalización` → tipo = "CANALIZACION" (24 prod) → unir con "Canalizacion" existente
- [ ] `Módulo de E/S` → tipo = "Módulo I/O" (20 prod) → mover a AUTOMATIZACION
- [ ] `Carril DIN` → tipo = "CARRIL DIN" (5 prod) → revisar producto por producto
- [ ] `Módulo de Comunicación` → tipo = "Módulo Comunicación" (2 prod) → mover a AUTOMATIZACION
- [ ] `Caja de Conexión` → tipo = "Caja Conexion" (2 prod) → mover a DP

**Nota**: Los 46 "Piloto luminoso" en INSTALACION son probablemente pilotos de señalización que pertenecen a DP/Accesorios. Los 20 "Módulo I/O" y 2 "Módulo Comunicación" son dispositivos de automatización.

### 2.4 Subfamilias de VEHICULOS_ELECTRICOS

**Estado actual** (3 subfamilias):
```
Punto Recarga: 23
VEHICULOS_ELECTRICOS: 7    ← MISMA QUE FAMILIA - error + TODOS son "Todos los Productos"
Accesorio: 1
```

**Hallazgo**: Los 7 productos con subfamilia `VEHICULOS_ELECTRICOS` tienen TODOS el nombre "Todos los Productos" — son placeholders. Tras la limpieza de la Fase 1, esta subfamilia quedará vacía y se puede eliminar.

**Acción**:
- [ ] Eliminar los 7 placeholders en Fase 1
- [ ] Eliminar la subfamilia `VEHICULOS_ELECTRICOS` (quedará vacía)
- [ ] Verificar que los 23 productos de `Punto Recarga` y el 1 de `Accesorio` están correctos
- [ ] La familia VEHICULOS_ELECTRICOS quedará con 24 productos bien clasificados

### 2.5 Subfamilias de ILUMINACION

**Estado actual** (4 subfamilias):
```
Luminaria Emergencia: 41
Accesorio: 17
Bateria: 5
Linterna: 1
```

**Estado**: ✅ Correctamente clasificadas. No requiere cambios.

### 2.6 Subfamilias de AUTOMATIZACION DE EDIFICIOS

**Estado actual** (17 subfamilias):
```
Mando Smart: 12
Controlador KNX: 9
Base Conectada: 5
Micromodulo Smart: 4
Pasarela KNX: 3
Sensor KNX: 3
Interface KNX: 2
Acoplador KNX: 2
Telemando: 1
Compensador: 1
Actuador HVAC: 1
Actuador HVAC KNX: 1
Router KNX: 1
Interruptor Rotulo: 1
Detector Movimiento: 1
Actuador KNX: 1
Pulsador Telemando: 1
```

**Estado**: ✅ Correctamente clasificadas (17 subfamilias KNX/Smart). No requiere cambios.

### 2.7 Subfamilias de FOTOVOLTAICA

**Estado actual** (6 subfamilias):
```
Fotovoltaica: 19           ← GENÉRICA + TODOS son "Todos los Productos"
Seccionador CC: 12
Caja Combinadora: 6
Proteccion Sobretension: 2
Accesorio: 2
Interruptor CC: 2
```

**Tipos encontrados en productos "Fotovoltaica"**:
```
Controlador Solar: 18
FOTOVOLTAICA: 6
CARRIL DIN: 18
Monitor CC: 1
```

**Hallazgo**: Los 19 productos con subfamilia `Fotovoltaica` tienen TODOS el nombre "Todos los Productos" — son placeholders. Tras la limpieza de la Fase 1, esta subfamilia quedará vacía y se puede eliminar.

**Acción**:
- [ ] Eliminar los 19 placeholders en Fase 1
- [ ] Eliminar la subfamilia `Fotovoltaica` (quedará vacía)
- [ ] Verificar que los 12 `Seccionador CC`, 6 `Caja Combinadora`, 2 `Proteccion Sobretension`, 2 `Accesorio`, 2 `Interruptor CC` están correctos
- [ ] La familia FOTOVOLTAICA quedará con 24 productos bien clasificados

---

## FASE 3: Normalización de Tipos

### 3.1 Tipos estándar de DP (definidos en DB_TAXONOMY.md)
```
CARRIL DIN
CAJA MOLDEADA
Piloto luminoso
Contador eléctrico
```

### 3.2 Tipos no estándar encontrados
```
ENVOLVENTE: 29           ← Legrand (cajas de empotrar)
Cuadros Distribución: 7  ← Schneider (accesorios Prisma/Linergy)
SUPERFICIE: 7            ← Legrand (tomas industriales)
EMPOTRAR: 3              ← Legrand
MONTAJE PAREDES: 1       ← Siemens (arrancador suave)
```

**Acción**:
- [ ] `ENVOLVENTE` → Mantener como tipo válido para cajas de distribución
- [ ] `Cuadros Distribución` → Renombrar a `CUADRO DISTRIBUCION` (MAYÚSCULAS)
- [ ] `SUPERFICIE` → Mantener como tipo válido para tomas industriales
- [ ] `EMPOTRAR` → Renombrar a `EMPOTRAMIENTO` o mantener
- [ ] `MONTAJE PAREDES` → Renombrar a `MONTAJE EN PARED`
- [ ] Actualizar `DB_TAXONOMY.md` con los tipos extendidos

---

## FASE 4: Actualización de Archivos de Mapeo

### 4.1 Actualizar `categoriaMapping.js`
- [ ] Añadir mapeos para subfamilias nuevas de DP:
  - `Relé de Seguridad` → `Accesorios` / `Relés y seguridad`
  - `Bornas` → `Accesorios` / `Bornas y terminales`
  - `Arrancador Suave` → `Control Motor` / `Arrancadores suaves`
- [ ] Los 3 productos afectados empezarán a aparecer en la navegación agrupada de DP

### 4.2 Actualizar `etiquetasSubcategoria.js`
- [ ] Añadir etiquetas UI para las nuevas subcategorías:
  - `Relés y seguridad` → "Relés y seguridad"
  - `Bornas y terminales` → "Bornas y terminales"
  - `Arrancadores suaves` → "Arrancadores suaves"

### 4.3 Actualizar `categoryMapping.js`
- [ ] Añadir `FULL_CATEGORY_INFO` para familias que no lo tienen:
  - `INSTALACION`: icono 📏, descripción, tips
  - `VEHICULOS_ELECTRICOS`: icono 🚗, descripción, tips
  - `FOTOVOLTAICA`: icono ☀️, descripción, tips
- [ ] Verificar que todos los iconos coinciden con `DB_TAXONOMY.md`

### 4.4 Actualizar `familiaMapping.js`
- [ ] Revisar si `FAMILIA_A_CATEGORIA` se usa en algún sitio
- [ ] Si no se usa → eliminar o marcar como deprecated
- [ ] Si se usa → sincronizar con `catalogService.ts`

### 4.5 Actualizar `DB_TAXONOMY.md`
- [ ] Reflejar todos los cambios de subfamilias y tipos
- [ ] Actualizar contadores de productos
- [ ] Documentar las nuevas subfamilias de AUTOMATIZACION e INSTALACION

---

## FASE 5: Corrección de Navegación

### 5.1 Problema: buscarReferenciaDirecta no carga estado intermedio

**Problema**: Cuando se busca un producto por referencia, el hook salta directamente a `paso='ficha'` sin cargar:
- `grupos` (modo DP agrupado)
- `gamasDisponibles` (modo legacy)
- `tiposDisponibles` (modo legacy)
- `gamasComercialesDisponibles`
- `subgamasDisponibles`

**Consecuencia**: Al hacer clic en "Volver" o en el breadcrumb, las pantallas intermedias están vacías.

**Acción** en `useNavegacionFichas.js`:
- [ ] En `buscarReferenciaDirecta()` (líneas 646-694), después de encontrar el producto:
  1. Llamar a `getSubfamiliasConTipos(marca, familia)` para construir `grupos`
  2. Si hay grupos → construir y guardar en `grupos` state
  3. Si no hay grupos → llamar a `getGamasPorMarcaYCategoria()` y guardar en `gamasDisponibles`
  4. Llamar a `getGamasPorSubcategoria()` o `getGamasPorFiltro()` para `gamasComercialesDisponibles`
  5. Llamar a `getSubgamasPorSubcategoria()` o `getSubgamasPorFiltro()` para `subgamasDisponibles`

**Código sugerido**:
```javascript
// Después de encontrar el producto en buscarReferenciaDirecta
const pares = await catalogService.getSubfamiliasConTipos(producto.marca, producto.familia)
const g = construirGrupos(pares)

if (Object.keys(g).length > 0) {
  setGrupos(g)
  // Cargar gamas comerciales y subgamas para la subcategoría actual
  // ...
} else {
  const gamas = await catalogService.getGamasPorMarcaYCategoria(producto.marca, producto.familia)
  setGamasDisponibles(gamas.map(g => g.nombre))
}
```

### 5.2 Problema: Subfamilias genéricas en modo legacy

**Problema**: Familias como AUTOMATIZACION muestran `Automatización` como "gama", que es en realidad la subfamilia. El usuario ve:
```
Schneider Electric > Automatización > [tipo] > Referencias
```

**Solución**: Una vez completada la FASE 2 (desglose de subfamilias genéricas), este problema se resuelve parcialmente. Pero además:

**Acción** en `useNavegacionFichas.js`:
- [ ] En el modo legacy, cuando solo hay 1 gama disponible (subfamilia genérica), saltar automáticamente al siguiente paso
- [ ] O mejor: mostrar la subfamilia como "categoría" en lugar de "gama" para familias no-DP

### 5.3 Problema: Lógica de búsqueda duplicada

**Problema**: `useFichasTecnicas.buscar()` y `useNavegacionFichas.buscarReferenciaDirecta()` tienen lógica de búsqueda superpuesta.

**Acción**:
- [ ] Unificar la lógica de búsqueda en `buscarReferenciaDirecta()`
- [ ] `useFichasTecnicas.buscar()` solo debe usarse para búsqueda por IA (no búsqueda en catálogo)
- [ ] Eliminar la consulta de catálogo duplicada en `useFichasTecnicas.buscar()` (líneas 44-83)

### 5.4 Problema: `getSubfamiliasConTipos` filtra `tipo` null

**Problema**: `catalogService.getSubfamiliasConTipos()` (línea 352-353) requiere que `tipo` no sea null:
```typescript
if (p.subfamilia && p.tipo) {  // requiere AMBOS truthy
```

**Consecuencia**: Productos sin `tipo` no aparecen en la navegación agrupada de DP.

**Acción**:
- [ ] Decidir: ¿asignar un tipo por defecto a estos productos? ¿o modificar la query?
- [ ] Si se modifica la query: permitir `tipo` null y asignar un tipo por defecto en `construirGrupos()`
- [ ] Revisar cuántos productos en DP tienen `tipo = null`

### 5.5 Problema: `getGamasPorMarcaYCategoria` no filtra por familia correctamente

**Problema**: La función `getGamasPorMarcaYCategoria` (línea 159) consulta:
```typescript
.eq('familia', familia)
.eq('brand_id', brandId)
```

Pero `familia` es el parámetro que llega como `categoria` desde el hook. En el hook, `categoria` se establece con el valor raw de la DB (ej: `AUTOMATIZACION`). Si hay productos con familia mal escrita (ej: `Automatizacion` sin mayúsculas), no aparecerían.

**Acción**:
- [ ] Verificar que todos los valores de `familia` en la DB son consistentes (MAYÚSCULAS con guiones bajos)
- [ ] Añadir normalización en `getGamasPorMarcaYCategoria` para manejar variaciones de capitalización

---

## FASE 6: Verificación y Testing

### 6.1 Script de verificación post-cambios
- [ ] Ejecutar `verify-taxonomy.mjs` y verificar:
  - [ ] 0 productos con nombre "Todos los Productos"
  - [ ] 0 subfamilias inconsistentes (Contactores vs Contactor)
  - [ ] Todas las subfamilias de DP están en `categoriaMapping.js`
  - [ ] Todos los tipos de DP están normalizados
  - [ ] No hay productos con familia inexistente

### 6.2 Testing de navegación
- [ ] Probar navegación DP: DISTRIBUCION DE POTENCIA → Schneider → Protección → Magnetotérmico modular → referencias
- [ ] Probar navegación legacy: AUTOMATIZACION → Schneider → [subfamilia] → referencias
- [ ] Probar navegación: ILUMINACION → Legrand → referencias
- [ ] Probar navegación: INSTALACION → Schneider → referencias
- [ ] Probar navegación: VEHICULOS_ELECTRICOS → Schneider → referencias
- [ ] Probar navegación: FOTOVOLTAICA → Legrand → referencias
- [ ] Probar búsqueda directa por referencia
- [ ] Probar búsqueda por nombre
- [ ] Probar breadcrumb y navegación "Volver"
- [ ] Verificar que el breadcrumb se muestra correctamente tras búsqueda directa

### 6.3 Testing de datos
- [ ] Verificar que los 2 productos corregidos (Siemens) aparecen en la familia correcta
- [ ] Verificar que los 2 productos "Contactores" → "Contactor" aparecen en Control Motor
- [ ] Verificar que los productos de AUTOMATIZACION están en subfamilias específicas
- [ ] Verificar que los productos de VEHICULOS_ELECTRICOS están correctamente clasificados

---

## Resumen de Cambios

| Fase | Descripción | Productos afectados | Riesgo |
|------|-------------|---------------------|--------|
| 0 | Backup y scripts | 0 | Bajo |
| 1 | Limpieza crítica | ~720+ placeholders + 4 correcciones | Medio |
| 2 | Normalización subfamilias | ~500+ (desglose genéricas) | Medio |
| 3 | Normalización tipos | ~47 (DP) + ~100 (INSTALACION) | Bajo |
| 4 | Actualización mapeos | 0 (archivos JS) | Bajo |
| 5 | Corrección navegación | 0 (archivos JS) | Medio |
| 6 | Verificación | 0 | Bajo |

---

## Orden de Ejecución Recomendado

1. **Fase 0** (Backup) — SIN ESTO NO SE EJECUTA NADA
2. **Fase 1** (Limpieza crítica) — Eliminar placeholders y corregir errores graves
3. **Fase 3** (Tipos) — Normalizar tipos antes de subfamilias (menos cambios)
4. **Fase 2** (Subfamilias) — El paso más complejo, hacer por familias
5. **Fase 4** (Mapeos) — Actualizar archivos JS después de cambiar la DB
6. **Fase 5** (Navegación) — Corregir el código una vez la DB está limpia
7. **Fase 6** (Verificación) — Testear todo al final

---

## Preguntas para el Usuario

1. **Productos "Todos los Productos"**: ¿Eliminar los ~720+ o alguno tiene datos útiles? (Todos los que he revisado son placeholders)
2. **Subfamilia "Automatización" (314 prod)**: Los tipos ya están bien (Variador, Autómata, Relé Térmico, etc.). ¿Usar el tipo para crear subfamilias específicas?
3. **Subfamilia "Instalación" (168 prod)**: Los tipos también están bien. ¿Mover los Piloto Luminoso (46) a DP/Accesorios? ¿Los Módulo I/O (20) a AUTOMATIZACION?
4. **VEHICULOS_ELECTRICOS**: Los 7 productos son placeholders → se eliminan. ¿Correcto?
5. **FOTOVOLTAICA**: Los 19 productos "Fotovoltaica" son placeholders → se eliminan. ¿Correcto?
6. **Tipos no estándar en DP**: ¿Mantener ENVOLVENTE (29), SUPERFICIE (7), etc. o normalizar todos?
7. **Precios**: Todos los productos tienen precio = 0. ¿Quieres que se actualicen?
8. **Navegación**: El breadcrumb no funciona bien tras búsqueda directa. ¿Lo corrijo también?
