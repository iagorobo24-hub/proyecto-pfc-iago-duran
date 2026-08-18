# Diagramas canónicos del PFC

Esta carpeta contiene los diagramas visuales vigentes de la documentación. Cada concepto mantiene un único SVG canónico y editable. Los PNG se generan solo cuando un documento o presentación los necesita, para evitar copias derivadas desincronizadas.

## Orden recomendado de lectura

| Diagrama | Pregunta que responde | Uso recomendado |
|---|---|---|
| `mapa-funcional.svg` | **¿Qué es el proyecto?** | Introducción, defensa y visión general |
| `arquitectura-sistema.svg` | **¿Cómo está construido?** | Arquitectura y dependencias principales |
| `componentes.svg` | **¿Cómo se organiza el código?** | Diseño técnico y responsabilidades |
| `flujo-navegacion-fichas.svg` | **¿Cómo funciona un caso real?** | Explicar Fichas Técnicas de extremo a extremo |
| `flujo-ia.svg` | **¿Cómo se integra y controla la IA?** | Gateway, proveedores, validaciones y límites |

## Lenguaje visual

- **Azul:** interfaz, routing y componentes de aplicación.
- **Verde:** catálogo, Supabase y persistencia.
- **Violeta:** inteligencia artificial y proveedores/modelos.
- **Naranja:** salidas, documentación o límites que requieren especial atención.
- **Gris:** contexto, dependencias transversales o información no funcional.

Las flechas representan flujo o dependencia. Las líneas discontinuas indican una relación auxiliar/opcional, no el camino principal.

## Contrato factual

Los diagramas describen el estado reconciliado con el código de `main` en agosto de 2026. Evitan congelar datos que cambian con el entorno o el commit:

- número de productos;
- cantidad de tests verdes o cobertura;
- tiempos de rendimiento;
- disponibilidad;
- precios/costes;
- un modelo de IA único.

Cuando una de esas cifras sea necesaria para una entrega, debe medirse y fecharse por separado.

## Límites importantes

- Firebase/Firestore se representa únicamente como legado cuando aporta contexto histórico.
- Una respuesta de IA no se presenta como fuente técnica oficial.
- SONEX valida referencias/cards contra el catálogo en los flujos correspondientes; eso no valida automáticamente afirmaciones normativas o especificaciones generadas.
- El diagrama de IA representa el contrato común. No todos los módulos usan el mismo modelo, parser o estrategia de validación.

## Mantenimiento

1. Corregir primero el código o la documentación fuente si cambia un hecho.
2. Actualizar el SVG canónico.
3. Validar el SVG como XML.
4. Renderizar una previsualización desde ese SVG y revisarla a tamaño completo y reducido.
5. Generar PNG solo para el artefacto que lo necesite; no mantenerlo como segunda fuente documental.
6. Evitar añadir métricas volátiles al gráfico.

*Conjunto visual reconciliado — agosto de 2026.*
