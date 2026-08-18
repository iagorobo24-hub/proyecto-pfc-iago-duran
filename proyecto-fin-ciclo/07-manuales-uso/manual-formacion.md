# Manual de usuario — Formación Interna

## Objetivo

El módulo registra empleados, módulos formativos y progreso. Incluye un plan de desarrollo generado por IA como apoyo orientativo.

## Acceso

Ruta: `/app/formacion`.

## Vista Equipo

La pantalla principal muestra:

- progreso global;
- número de empleados;
- número de módulos;
- empleados con alerta;
- tarjetas individuales con progreso.

Una alerta aparece cuando un empleado lleva más de 30 días de alta y mantiene módulos obligatorios pendientes, según los datos guardados en la aplicación.

## Detalle de empleado

Los módulos se agrupan por áreas como Almacén, Comercial, Técnico, Seguridad y Sistemas. Cada módulo puede estar:

- **Pendiente**;
- **En curso**;
- **Completado**.

Al marcar un módulo como completado se registra la fecha.

## Ajustes

La pestaña **Ajustes** permite:

- añadir módulos con área, horas y condición de obligatorio;
- añadir empleados con nombre, departamento y rol.

## Plan de desarrollo IA

Desde el detalle de un empleado puede generarse un plan a partir de los módulos completados y pendientes. El texto es una recomendación automática: no equivale a un plan oficial de RR. HH., prevención o habilitación profesional.

## Persistencia

El módulo usa la capa `useUserData`, que mantiene una copia local y sincroniza con Supabase cuando el usuario y el backend están disponibles.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
