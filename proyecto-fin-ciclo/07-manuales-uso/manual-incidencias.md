# Manual de Usuario: Dashboard de Incidencias

## Introducción

El **Dashboard de Incidencias** es una herramienta diseñada para el registro, diagnóstico y resolución de fallos industriales y logísticos en tiempo real. Utiliza inteligencia artificial para proporcionar recomendaciones de diagnóstico y posibles causas de averías, reduciendo el tiempo de inactividad de las instalaciones.

---

## Cómo acceder

1. Inicia sesión en la aplicación.
2. En el menú lateral (Sidebar), haz clic en **Incidencias** (icono de escudo 🛡️).
3. Se cargará el panel de control principal de incidencias.

---

## Interfaz de usuario

```
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ Dashboard Incidencias                               [🌓] │
│ Registra, diagnostica y resuelve incidencias de equipos     │
├─────────────────────────────────────────────────────────────┤
│  [ Lista ]  [ Nueva ]                              [📄 PDF] │
├─────────────────────────────────────────────────────────────┤
│ ⚠ 1 incidencia crítica sin atender +2h (Compresor)          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │     1     │  │     3     │  │     0     │  │    12     │ │
│  │ Críticas  │  │ Abiertas  │  │Diagnóstico│  │ Resueltas │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FILTRAR POR: Estado [Todas ▾]   Severidad [Todas ▾]         │
├─────────────────────────────────────────────────────────────┤
│ • Puente Grúa — Zona B (Alta)                     [Hace 5m] │
│ • Compresor Aire — Zona A (Crítica)               [Hace 3h] │
│ • Carretilla Elevadora — Zona C (Media)           [Hace 1d] │
└─────────────────────────────────────────────────────────────┘
```

---

## Cómo usar

### 1. Registrar una nueva incidencia

1. Cambia a la pestaña **Nueva** en la parte superior.
2. Rellena los datos en el formulario:
   - **Equipo**: Nombre y referencia del equipo (ej: *Puente Grúa GH 5t*).
   - **Zona**: Selección de la ubicación física (ej: *Zona A — Recepción*, *Zona B — Almacenamiento*, etc.).
   - **Operario**: Nombre del operario que reporta la incidencia.
   - **Severidad**: Grado de impacto del fallo (*Baja*, *Media*, *Alta*, *Crítica*).
   - **Síntoma**: Descripción detallada de lo que le ocurre al equipo (ej: *El motor eléctrico sobrecalienta y se detiene automáticamente*).
3. Haz clic en **Crear Incidencia**. La incidencia se guardará y volverás a la lista.

### 2. Diagnóstico asistido por IA

1. En la pestaña **Lista**, haz clic sobre cualquier incidencia abierta para ver su detalle.
2. Pulsa en el botón **Diagnosticar con IA**.
3. El asistente técnico (Claude 3.5 Haiku) analizará el síntoma, la zona y el equipo, devolviendo en unos segundos:
   - **Causa probable** del fallo.
   - **Pasos de verificación** recomendados en orden secuencial.
   - **Solución propuesta** directa.
   - **Medidas preventivas** para evitar que vuelva a ocurrir.
4. El estado de la incidencia cambiará automáticamente a **En diagnóstico**.

### 3. Actualizar el estado y observaciones

1. En la vista detallada de la incidencia, puedes cambiar su estado en tiempo real:
   - **Abierta**: Incidencia recién registrada.
   - **En diagnóstico / En proceso**: Diagnóstico por IA realizado o técnico trabajando en ella.
   - **Resuelta**: Fallo subsanado (se registrará la fecha y hora de resolución).
2. Utiliza el campo de **Observaciones** para registrar notas manuales de las acciones tomadas y haz clic en **Guardar observaciones**.

---

## Alertas críticas

El sistema incluye un banner de seguridad prioritario que se activa si detecta **incidencias críticas** que lleven más de **2 horas sin resolverse**. Esta advertencia resalta en color de alerta en la parte superior del panel para recordar al equipo la necesidad de atender el fallo prioritario de inmediato.

---

## Exportar informe en PDF

Puedes descargar un informe unificado con el histórico de incidencias registradas:
1. Asegúrate de tener al menos una incidencia guardada.
2. En la barra de pestañas superior, haz clic en **📄 PDF**.
3. Se generará un documento en formato PDF estructurado que se descargará de manera automática en tu dispositivo.

---

*Manual de usuario actualizado: Junio 2026*
