# Guía: Sincronizar carpeta "proyecto-fin-ciclo" con GitHub

## Situación actual

La carpeta `proyecto-fin-ciclo/` está creada localmente en:
```
/mnt/c/Users/iagui/AI Projects/Repos de GitHub/proyectos-sonepar/proyecto-fin-ciclo/
```

El repositorio remoto está en:
```
https://github.com/iagorobo24-hub/proyectos-sonepar
```

## Pasos para subir la documentación a GitHub

### Opción 1: Si el repo ya está clonado

```bash
cd /mnt/c/Users/iagui/AI\ Projects/Repos\ de\ GitHub/proyectos-sonepar

# Verificar estado
git status

# Añadir la carpeta al staging
git add proyecto-fin-ciclo/

# Commit
git commit -m "docs: crear estructura de documentación para proyecto fin de ciclo

- Carpeta proyecto-fin-ciclo/ con 10 capítulos
- 14 fichas técnicas de herramientas IA
- Manual para profesores
- Índice general"

# Push a GitHub
git push origin main
```

### Opción 2: Si necesitas clonar el repo primero

```bash
cd /mnt/c/Users/iagui/AI\ Projects/Repos\ de\ GitHub/

git clone https://github.com/iagorobo24-hub/proyectos-sonepar.git

# Entrar en el repo
cd proyectos-sonepar

# La carpeta proyecto-fin-ciclo ya debería estar si la creaste localmente
# Si no está, créala de nuevo con los archivos

# Seguir desde Opción 1
```

## Estructura que se subirá a GitHub

```
proyectos-sonepar/
├── proyecto-fin-ciclo/
│   ├── 00-README.md
│   ├── INDICE.md
│   ├── 01-resumen-ejecutivo/
│   ├── 02-estado-del-arte/
│   ├── 03-analisis-requisitos/
│   ├── 04-diseno-tecnico/
│   ├── 05-proceso-desarrollo/
│   ├── 06-herramientas-ia/
│   │   ├── AI-001-claude-web.md
│   │   ├── AI-002-github-copilot.md
│   │   ├── AI-003-vercel.md
│   │   ├── AI-004-windsurf.md
│   │   ├── AI-005-qwen-cli.md
│   │   ├── AI-006-gemini-cli.md
│   │   ├── AI-007-opencode-cli.md
│   │   ├── AI-014-devin.md
│   │   ├── AI-015-hermes.md
│   │   ├── API-001-openrouter.md
│   │   ├── DB-001-firebase.md
│   │   ├── DB-002-supabase.md
│   │   └── SCRAPE-001-playwright.md
│   ├── 07-manuales-uso/
│   ├── 08-resultados/
│   ├── 09-conclusiones/
│   ├── 10-manual-profesores/
│   │   └── MANUAL-PROFESORES.md
│   └── assets/
│       ├── branding/
│       ├── capturas/
│       └── diagramas/
```

## Comandos útiles

### Ver qué archivos changed

```bash
git status
git diff --stat
```

### Ver archivos sin commits pendientes

```bash
git add -A
git status
```

### Hacer commit específico de documentación

```bash
git add proyecto-fin-ciclo/
git commit -m "docs: añadir documentación proyecto fin de ciclo"
git push
```

### Ver historial de commits de documentación

```bash
git log --oneline --follow -- proyecto-fin-ciclo/
```

## Para mantener sincronizado

Cada vez que añadas contenido a `proyecto-fin-ciclo/`:

```bash
cd /mnt/c/Users/iagui/AI\ Projects/Repos\ de\ GitHub/proyectos-sonepar

git add proyecto-fin-ciclo/
git commit -m "docs: [descripción del cambio]"
git push
```

## Nota sobre .gitignore

Si no quieres subir archivos temporales o muy pesados:

```bash
# Verifica que .gitignore no excluya la carpeta
grep -i "proyecto" .gitignore

# Si la excluye, elimínala del .gitignore o añade excepciones
```

---

*Comando rápido para hacer commit y push:*
```bash
cd /mnt/c/Users/iagui/AI\ Projects/Repos\ de\ GitHub/proyectos-sonepar && git add proyecto-fin-ciclo/ && git commit -m "docs: añadir estructura documentación PFC" && git push
```

¿Quiieres que ejecute ese comando para subir la documentación a GitHub ahora?