---
tool_id: DB-001
nombre: Firebase / Firestore
rol_en_el_pfc: backend inicial
estado_documental: legado
---

# Firebase — arquitectura histórica

Firebase fue utilizado en las primeras etapas para autenticación y/o persistencia. La experiencia con Firestore influyó en la decisión posterior de migrar a un modelo PostgreSQL con Supabase.

## Qué se conserva como aprendizaje

- rapidez para prototipar autenticación y persistencia;
- importancia de diseñar reglas de acceso;
- diferencias entre un modelo documental y un catálogo con filtros/relaciones;
- impacto de cuotas y patrón de consultas en procesos de sincronización grandes.

## Estado actual

La descripción principal del proyecto usa **Supabase**. No deben leerse los ejemplos de Firestore de esta ficha como esquema vigente ni como dependencia de producción.

## Sobre las claves

La configuración cliente de Firebase no se trata igual que una clave privada de una API de IA: la seguridad real depende de autenticación, reglas y configuración del backend. Este matiz se mantiene como lección histórica.

> Cuotas y precios de Firebase no se fijan aquí; cambian con el servicio.
