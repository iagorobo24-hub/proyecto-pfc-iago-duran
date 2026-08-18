# Manual de usuario — Simulador de Almacén

## Objetivo

El Simulador de Almacén reproduce un flujo formativo de preparación de pedidos. Es una **simulación académica**: no modifica un WMS, ERP ni stock real.

## Acceso

Ruta: `/app/almacen`.

Al entrar se configura un perfil básico del operario y se accede al selector de modo de juego. El módulo conserva perfil e historial mediante la capa de persistencia de la aplicación.

## Flujo actual

La simulación tiene **cinco etapas**:

1. **Recepción** — verificación inicial del pedido y albarán.
2. **Ubicación** — traslado y asignación de ubicación.
3. **Picking** — extracción del producto de su ubicación.
4. **Verificación** — comprobación de referencia y cantidad.
5. **Expedición** — etiquetado y preparación para envío.

Cada etapa registra tiempo y lo compara con un estándar de referencia. El resultado se utiliza para calcular una puntuación formativa.

## Modos

- **Entrenamiento:** recorrido pensado para practicar el proceso.
- **Evaluación:** recorrido orientado a medir ejecución y decisiones.
- **Solo:** una persona completa la simulación.
- **Multijugador:** el módulo dispone de sala, participantes, progreso y ranking cuando la infraestructura de tiempo real está disponible.

## Incidencias

Durante la partida pueden aparecer situaciones como discrepancias de albarán, embalaje dañado, ubicación ocupada, referencia ausente, error de cantidad o dirección incompleta. El usuario elige una respuesta y recibe feedback.

Las incidencias son **casos didácticos**. No sustituyen procedimientos de seguridad, calidad o logística de una empresa real.

## Resultado

Al terminar se muestran:

- tiempos por etapa;
- comparación con referencias temporales;
- incidencias presentadas y respuestas;
- puntuación;
- feedback generado por IA si el servicio está disponible;
- historial de sesiones.

## Qué no hace

El módulo no recibe mercancía real, no crea albaranes oficiales, no reserva stock y no escribe en un ERP/WMS corporativo.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
