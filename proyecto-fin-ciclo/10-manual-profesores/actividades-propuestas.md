# Actividades Propuestas — Ejercicios para Alumnos

## Introducción

Estas actividades están diseñadas para que los alumnos pratiquen el desarrollo con IA generativa.循序渐进, desde lo básico hasta un proyecto completo.

---

## Sesión 1: Introducción a la IA Generativa (2h)

### Objetivos
- Entender qué es un LLM
- Conocer las herramientas disponibles
- Hacer el primer prompt

### Actividad 1.1: Primer contacto con Claude (30 min)

**Tarea:**
1. Crea cuenta en claude.ai
2. Pide que genere una calculadora de secciones de cable
3. Revisa el código generado

**Entregable:**
- Código generado
- Captura de pantalla de la conversación

**Criterios:**
- El código compila
- Funciona correctamente

---

### Actividad 1.2: Mejora el prompt (30 min)

**Tarea:**
1. Toma la calculadora anterior
2. Mejora el prompt añadiendo:
   - Tipos de cable ( cobre, aluminio)
   - Método de instalación (empotrado, superficie)
   - Factor de corrección
3. Compara los resultados

**Entregable:**
- Código mejorado
- Comparación

---

### Actividad 1.3: Chat vs. IDE (45 min)

**Tarea:**
1. Abre Windsurf (o Cursor)
2. Crea un nuevo proyecto
3. Pide al IDE que genere un componente simple
4. Compara con la experiencia de Claude Web

**Entregable:**
- Código generado en el IDE
- Reflexión: ¿Cuál prefieres y por qué?

---

## Sesión 2: IDE con IA + Control de Versiones (2h)

### Objetivos
- Instalar y configurar Windsurf
- Usar Git para control de versiones
- Hacer un commit significativo

### Actividad 2.1: Instalar Windsurf (20 min)

**Tarea:**
1. Descarga Windsurf de codeium.com/windsurf
2. Instala la extensión
3. Conecta tu cuenta de GitHub

**Entregable:**
- Captura de Windsurf funcionando

---

### Actividad 2.2: Mi primer commit (45 min)

**Tarea:**
1. Crea un repositorio nuevo en GitHub
2. Clónalo en tu ordenador
3. Crea un archivo README.md
4. Haz el primer commit con mensaje descriptivo
5. Haz push

**Entregable:**
- Repo público con commit

---

### Actividad 2.3: Workflow con Windsurf (45 min)

**Tarea:**
1. Abre el repo en Windsurf
2. Pide al IDE que cree una página HTML simple
3. Modifica el código manually
4. Compara los cambios
5. Commit y push

**Entregable:**
- Repo con 2 commits

---

## Sesión 3: Deployment en Vercel (2h)

### Objetivos
- Desplegar una aplicación web
- Entender serverless functions
- Ver la app en producción

### Actividad 3.1: Deploy de proyecto existente (60 min)

**Tarea:**
1. Conecta tu repo a Vercel
2. Despliega el proyecto de la Sesión 2
3. Comparte la URL

**Entregable:**
- URL pública de la app

---

### Actividad 3.2: Crear una Serverless Function (60 min)

**Tarea:**
1. En el proyecto, crea una carpeta `api/`
2. Crea un archivo `api/hello.js`:
   ```javascript
   export default function handler(req, res) {
     res.json({ message: "¡Hola desde Vercel!" });
   }
   ```
3. Despliega y visita `/api/hello`

**Entregable:**
- URL que devuelve JSON

---

## Sesión 4: Proyecto en Grupo (2h)

### Objetivos
- Aplicar todo lo aprendido
- Crear un proyecto completo
- Presentar resultados

### Actividad 4.1: Definir el proyecto (30 min)

**En grupos de 2-3:**

1. Elegid un problema real que podáis resolver con una web
2. Ejemplos:
   - Calculadora de instalaciones eléctricas
   - Selector de materiales
   - Inventario simple
3. Definid:
   - Qué hace la app
   - Qué tecnologías usaréis

**Entregable:**
- Descripción de 1 párrafo

---

### Actividad 4.2: Desarrollo (60 min)

**Tarea:**
1. Usando Windsurf, generad el código
2. Iterad hasta tener algo funcional
3. Haced al menos 3 commits

---

### Actividad 4.3: Presentación (30 min)

**Cada grupo presenta:**
- Qué habéis creado
- Qué herramientas usasteis
- Problemas encontrados
- URL desplegada

---

## Ejercicios adicionales

### Ejercicio avanzado: Scraping

Usando Playwright (ver ficha SCRAPE-001):

1. Haz scraping de una página web simple
2. Guarda los datos en JSON
3. Despliega una web que muestre esos datos

### Ejercicio avanzado: API de IA

Usando OpenRouter (ver ficha API-001):

1. Crea una API en Vercel que use OpenRouter
2. Llámala desde tu frontend
3. Crea un chatbot simple

---

## Soluciones a problemas comunes

| Problema | Solución |
|----------|----------|
| Windsurf no se inicia | Reinstalar, revisar VSCode |
| Vercel no hace deploy | Revisar errores en el dashboard |
| La API no funciona | Revisar logs en Vercel |
| Claude da errores | Reformular el prompt |

---

*Actividades documentadas: Mayo 2026*
