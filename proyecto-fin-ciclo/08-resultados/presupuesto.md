# Presupuesto y coste del proyecto

## Qué se mide aquí

Este capítulo separa tres conceptos que antes aparecían mezclados:

1. **Coste histórico observado durante el PFC.**
2. **Coste potencial de operar servicios externos.**
3. **Valor hipotético de desarrollar una solución equivalente.**

## Coste histórico observado

Durante el desarrollo se priorizaron herramientas open source, planes gratuitos y créditos/tarifas de bajo coste. En la documentación histórica se registró un desembolso directo muy bajo o nulo en varias fases.

Eso **no permite afirmar que la aplicación tenga coste cero permanente**. Los planes de proveedores, límites, modelos y precios cambian, y el snapshot actual de SONEX puede solicitar un modelo de OpenRouter que no lleva sufijo `:free`.

## Costes operativos

Para estimar un coste operativo real se debe registrar, en una fecha concreta:

- plan y consumo de Vercel;
- plan y consumo de Supabase;
- créditos y tokens consumidos en OpenRouter/Groq;
- dominio si deja de usarse el subdominio gratuito;
- mantenimiento y tiempo humano.

Sin esos datos no se publica una cifra anual como hecho.

## Estimación de desarrollo externo

La antigua memoria incluía una aproximación basada en horas × tarifa. Puede conservarse como **ejercicio orientativo**, pero no como tasación del software. Si se necesita para la defensa, debe mostrarse junto a sus supuestos: alcance, horas, tarifa, testing, gestión, diseño, infraestructura y soporte.

## Conclusión

La conclusión defendible es que el PFC se diseñó con **control de costes** y pudo aprovechar infraestructura gratuita o económica durante su desarrollo. La sostenibilidad futura debe evaluarse con precios y consumos del momento.

*Reconciliado — agosto de 2026.*
