---
tool_id: DB-002
nombre: Supabase
rol_en_el_pfc: PostgreSQL, autenticación y persistencia
estado_documental: arquitectura actual
---

# Supabase

## Uso actual

Supabase es la plataforma de datos principal del snapshot auditado:

- catálogo en `products` y `brands`;
- familias mediante `vw_unique_families`;
- autenticación;
- datos de usuario a través de `user_data` y `useUserData`.

## Integración en código

El servicio actual es `app/src/services/catalogService.ts` (TypeScript), no `catalogService.js`. Entre sus responsabilidades están categorías, marcas, subfamilias/tipos, filtros comerciales, producto por referencia, búsqueda y estadísticas.

## Migración

La migración desde Firebase ya está materializada en el código y no debe aparecer en `lineas-futuro.md` como trabajo pendiente.

## Recuento de catálogo

La antigua cifra `~4.689` no se considera una constante. `getCatalogStats()` permite obtener recuentos en el entorno disponible. En una defensa, la cifra debe medirse y fecharse.

## Persistencia de usuario

`useUserData` usa almacenamiento local como respaldo y Supabase para usuarios autenticados cuando el proceso de migración está listo. La corrección de RLS debe verificarse en el proyecto de base de datos; no se deduce solo del cliente.

> Límites y precios del plan de Supabase son datos externos y no forman parte estable de esta ficha.
