# Manual de Usuario: Simulador de Almacén

## Introducción

El Simulador de Almacén te permite practicar y entender el flujo completo de un pedido en un almacén de material eléctrico: desde la recepción hasta la expedición.

**Nota:** Este es un simulador educativo, no gestiona pedidos reales.

---

## Cómo acceder

1. Inicia sesión en la aplicación
2. En el menú lateral, haz clic en **Almacén** (icono de paquete)

---

## Flujo de trabajo

El simulador tiene 4 etapas:

```
RECEPCIÓN  →  ALMACENAMIENTO  →  PREPARACIÓN  →  EXPEDICIÓN
```

---

## Etapa 1: Recepción

### Qué hacer

1. Introduce los datos del pedido recibido
2. Haz clic en **"Confirmar recepción"**

### Campos

| Campo | Descripción |
|-------|-------------|
| Número de pedido | Identificador del pedido |
| Proveedor | Empresa proveedora |
| Fecha de recepción | Fecha actual (automático) |
| Productos | Lista de productos recibidos |

### Ejemplo

```
Número de pedido: PED-2026-001
Proveedor: Schneider Electric
Productos:
  • Interruptor automático iC60N 10A x 20 uds
  • Interruptor automático iC60N 16A x 15 uds
  • Diferencial 40A 30mA x 5 uds

[Confirmar recepción]
```

---

## Etapa 2: Almacenamiento

### Qué hacer

1. Asigna ubicación a cada producto
2. Verifica la capacidad del almacén

### Ubicaciones disponibles

| Código | Descripción |
|--------|-------------|
| A-01 a A-20 | Estantería A (protecciones) |
| B-01 a B-20 | Estantería B (iluminación) |
| C-01 a C-20 | Estantería C (cableado) |
| D-01 a D-20 | Estantería D (automatización) |

### Reglas

- Cada ubicación tiene capacidad máxima
- Los productos similares deben estar juntos
- Los productos peligrosos tienen ubicaciones específicas

---

## Etapa 3: Preparación

### Qué hacer

1. Introduce el pedido del cliente
2. El sistema verificará la disponibilidad
3. Confirma la preparación

### Verificación automática

El sistema comprobará:
- ✅ Producto en stock
- ✅ Cantidad disponible
- ✅ Ubicación correcta
- ✅ Estado del producto

### Estado de disponibilidad

| Estado | Significado |
|--------|-------------|
| ✅ Disponible | Producto en stock suficiente |
| ⚠️ Stock bajo | Queda poco, considerar reposición |
| ❌ No disponible | Sin stock, pedir al proveedor |

---

## Etapa 4: Expedición

### Qué hacer

1. Confirma los productos preparados
2. Genera el albarán
3. Registra la salida

### Albarán generado

```
========================================
           ALBARÁN DE EXPEDICIÓN
========================================
Nº: ALB-2026-001
Fecha: 15/05/2026
Pedido: PED-2026-001
Cliente: INSTALACIONES ELÉCTRICAS LÓPEZ

========================================
PRODUCTOS EXPEDIDOS:
========================================
• iC60N 10A x 20 uds
• iC60N 16A x 15 uds
• ID 40A 30mA x 5 uds
========================================

Total bultos: 3
Peso total: 15 kg

[Firmado: ___________]
========================================
```

---

## Panel de control

Durante el proceso, ves un panel con el estado:

```
┌─────────────────────────────────────────┐
│  ESTADO DEL ALMACÉN                     │
├─────────────────────────────────────────┤
│  📦 Recepciones pendientes: 2          │
│  📍 Ubicaciones usadas: 45/80          │
│  🚚 Expediciones hoy: 5                │
│  ⚠️ Stock bajo: 8 productos            │
└─────────────────────────────────────────┘
```

---

## Simulación guiada

Si eres nuevo, usa el modo guiada:

1. Haz clic en **"Iniciar simulación guiada"**
2. Sigue las instrucciones paso a paso
3. Al final, verás un resumen

---

## atajo de teclado

| Tecla | Acción |
|-------|--------|
| **1-4** | Ir a etapa 1-4 |
| **Esc** | Cancelar/retroceder |
| **Enter** | Confirmar acción |

---

## Casos de prueba sugeridos

### Caso 1: Pedido completo
Recibe un pedido, almacénalo, prepáralo y expídelo.

### Caso 2: Stock insuficiente
Intenta preparar un pedido mayor que el stock disponible.

### Caso 3: Reposición
Recepcionalote de productos para reponer stock bajo.

---

*Manual actualizado: Mayo 2026*
