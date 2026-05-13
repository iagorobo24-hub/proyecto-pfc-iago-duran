# Análisis previo

> Este documento recoge la idea inicial del proyecto, antes de empezar a programar.
> Sirve para dejar claro qué se quería hacer, por qué y cómo se pensaba abordar.

---

## 1. Identificación del proyecto

**Título:** Desarrollo de una suite de herramientas web para el sector de distribución de material eléctrico, construida con IA generativa

**Autor:** Iago Durán Romera
**Ciclo:** 2º CS Automatización y Robótica Industrial
**Centro:** CIFP Universidade Laboral de A Coruña
**Tutor:** Departamento de Electricidade e Electrónica
**Fecha propuesta:** Marzo 2026

---

## 2. Detección de la necesidad

Durante las prácticas en una empresa de distribución de material eléctrico, me di cuenta de que los técnicos pasaban mucho tiempo haciendo tareas que podrían automatizarse:

- **Buscar productos** — Mirar catálogos en papel o PDFs para encontrar referencias
- **Calcular presupuestos** — Hacer cuentas a mano o en Excel cada vez que un cliente pedía algo
- **Registrar incidencias** — Apuntar fallos en papeles que luego se perdían
- **Consultar normativa** — No tenían una forma rápida de resolver dudas técnicas

Esto me hizo pensar: ¿y si creamos una herramienta que agrupe todo esto en un solo sitio?

---

## 3. Solución propuesta

Crear una aplicación web (que se abre en el navegador, sin instalar nada) con varias herramientas útiles para el día a día de un técnico:

| Herramienta | Para qué sirve |
|-------------|----------------|
| Fichas Técnicas | Buscar productos por categoría, marca o nombre |
| Simulador Almacén | Practicar el flujo de un pedido sin estar en el almacén real |
| Incidencias | Registrar y llevar el seguimiento de fallos |
| KPIs | Ver indicadores del almacén de un vistazo |
| Presupuestos | Generar presupuestos para clientes |
| Formación | Gestionar qué sabe cada empleado y qué necesita aprender |
| SONEX | Preguntar dudas técnicas a una IA |

---

## 4. Cómo se iba a hacer (idea inicial)

La idea original era bastante simple:

1. **Hacer 7 páginas web** independientes, una para cada herramienta
2. **Usar React** porque es lo más usado hoy en día para hacer aplicaciones web
3. **Subirlo a internet** para que se pueda usar desde cualquier sitio
4. **Probar con IA generativa** para escribir el código, ya que yo no sabía programar web

Con el tiempo, el proyecto fue evolucionando. Empecé haciendo páginas sueltas con Claude (una IA de Anthropic) y luego las fui juntando todo en una sola aplicación.

---

## 5. Tecnologías previstas inicialmente

| Tecnología | Para qué |
|------------|----------|
| React | Hacer la interfaz de la web |
| Firebase | Para que los usuarios puedan iniciar sesión con Google |
| Firestore | Guardar los datos (productos, incidencias, etc.) |
| Vercel | Publicar la web en internet |
| Claude / OpenRouter | La IA que respondería preguntas técnicas |

Al final del proyecto, la mayoría de estas tecnologías se mantuvieron, aunque algunas cambiaron sobre la marcha (por ejemplo, se añadió OpenRouter como puerta de entrada a varios modelos de IA).

---

## 6. Planificación inicial (a grandes rasgos)

| Fase | Qué hacer | Tiempo estimado |
|------|-----------|-----------------|
| 1 | Aprender lo básico de React y hacer pruebas | 2 semanas |
| 2 | Crear las 7 herramientas una por una | 4 semanas |
| 3 | Juntarlo todo en una sola web | 2 semanas |
| 4 | Añadir login de usuarios y base de datos | 2 semanas |
| 5 | Hacer diseños bonitos y que funcione en móvil | 2 semanas |
| 6 | Documentar todo y preparar la memoria | 2 semanas |

Esto era la idea inicial. Luego, como pasa siempre, los tiempos se alargaron y aparecieron cosas que no esperaba (como lo difícil que fue conectar la IA, que nos llevó 3 días de prueba y error).

---

## 7. Por qué este proyecto tiene sentido para el ciclo

Aunque en Automatización y Robótica normalmente se hacen proyectos con PLCs y robots, este proyecto demuestra algo importante: **un alumno de FP puede crear herramientas digitales profesionales usando IA**, sin necesidad de saber programar de antes.

Además, muchas de las habilidades que se aprenden son las mismas:
- Analizar un problema antes de resolverlo
- Diseñar una solución pensando en quién la va a usar
- Probar, equivocarse y corregir
- Documentar todo para que otros lo entiendan

---

*Documento generado: Marzo 2026 (revisado Mayo 2026)*
*Fase: Análise e proposta — entregable: propuesta inicial del proyecto*
