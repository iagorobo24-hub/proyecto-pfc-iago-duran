# Manual de usuario — Dashboard de Incidencias

## Objetivo

Registrar y seguir incidencias de equipos dentro de un entorno académico, con diagnóstico asistido por IA y exportación de un resumen PDF.

## Acceso

Ruta: `/app/incidencias`.

## Crear una incidencia

En la pestaña **Nueva** se introducen:

- equipo;
- zona;
- operario;
- síntoma;
- severidad.

La incidencia se crea con estado **Abierta** y fecha automática.

## Lista y filtros

La pestaña **Lista** permite filtrar por estado y severidad. El panel superior resume incidencias críticas, abiertas, en diagnóstico y resueltas.

Las incidencias críticas no resueltas durante más de dos horas activan un aviso visual.

## Detalle y diagnóstico

Desde el detalle se puede:

- cambiar el estado;
- guardar observaciones;
- solicitar un diagnóstico a la IA.

El diagnóstico intenta devolver causa probable, pasos de verificación, solución y medidas preventivas. Si se genera correctamente, una incidencia abierta pasa a **En diagnóstico**.

> El diagnóstico de IA es orientativo. Ante una avería real deben prevalecer los procedimientos de seguridad, consignación, documentación técnica y personal cualificado.

## Exportación

Cuando existe al menos una incidencia, el botón **PDF** genera un resumen mediante la utilidad de PDF de la aplicación.

## Persistencia

Las incidencias se almacenan mediante la capa híbrida Supabase/localStorage de `useUserData`.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
