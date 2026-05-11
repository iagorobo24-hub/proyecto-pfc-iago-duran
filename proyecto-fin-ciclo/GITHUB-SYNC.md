# GitHub Sync - Comandos para sincronizar documentación

Este archivo contiene los comandos necesarios para hacer commit y push de los cambios al repositorio.

## Estado actual del repositorio

```
git status
```

## Agregar archivos

```bash
# Agregar todos los archivos nuevos y modificados
git add .

# O agregar solo archivos específicos
git add 00-README.md INDICE.md
git add 01-resumen-ejecutivo/
git add 02-estado-del-arte/
git add 03-analisis-requisitos/
git add 04-diseno-tecnico/
git add 05-proceso-desarrollo/
git add 07-manuales-uso/
git add 08-resultados/
git add 09-conclusiones/
```

## Commit

```bash
# Commit con mensaje descriptivo
git commit -m "docs: Documentación completa del proyecto-fin-ciclo

- Capítulo 1-5: Resumen, estado del arte, análisis, diseño, desarrollo
- Capítulo 6: Catálogo de 14 herramientas IA (fichas técnicas)
- Capítulo 7-10: Manuales, resultados, conclusiones, manual profesores

Total: 50 archivos de documentación"

# Commit de cambios específicos del proyecto principal
git commit -m "refactor: Migración de Firebase a Supabase

- Eliminados archivos Firebase obsoletos
- Nuevo servicio catalogService.js con integración Supabase
- Actualizado AuthContext para ambos proveedores"
```

## Push

```bash
# Push al repositorio remoto
git push origin main
```

## Pull (si hay cambios remotos)

```bash
# Traer cambios del remoto
git pull origin main

# Si hay conflictos, resolverlos y luego:
git add .
git commit -m "fix: Resueltos conflictos de merge"
git push origin main
```

## Comandos útiles

```bash
# Ver diferencias antes de commit
git diff --staged

# Ver historial de commits
git log --oneline -10

# Deshacer último commit (sin push)
git reset --soft HEAD~1

# Ver archivos modificados
git status --short
```

## Notas

- Hacer `git pull` antes de hacer push para evitar conflictos
- Revisar `git diff` antes de commit para confirmar cambios
- Usar mensajes de commit descriptivos siguiendo conventional commits
