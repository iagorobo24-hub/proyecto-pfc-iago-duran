# Análisis previo — propuesta inicial

> Documento histórico: recoge la intención de marzo de 2026 antes de que la arquitectura final estuviese cerrada. Para el estado vigente prevalecen los capítulos de diseño y los manuales de uso.

## Idea inicial

Durante las prácticas se identificó la oportunidad de experimentar con una aplicación web que reuniese herramientas para consulta de productos, logística, incidencias, KPIs, presupuestos, formación y asistencia técnica.

La propuesta planteó **siete herramientas** y posteriormente se incorporó un Dashboard Global como punto de entrada común.

## Plan previsto

1. prototipar herramientas por separado;
2. unificarlas en una SPA;
3. añadir autenticación y persistencia;
4. integrar IA donde aportase valor;
5. desplegar y documentar;
6. probar y corregir.

## Tecnologías inicialmente consideradas

React, Firebase/Firestore, Vercel y servicios de IA. Durante el desarrollo el backend principal evolucionó hacia Supabase y el gateway de IA pasó a soportar varios modelos/proveedores.

## Hipótesis académica

La hipótesis no era que una persona sin experiencia pudiese obtener automáticamente software profesional, sino estudiar hasta qué punto la IA podía **acelerar el aprendizaje y la construcción de un prototipo integrado** manteniendo revisión y responsabilidad humana.

## Diferencia entre propuesta y resultado

El producto final cambió de forma importante: crecieron la navegación, la persistencia, las pruebas, la seguridad, los flujos de cada módulo y la arquitectura de datos. Este documento se conserva para mostrar esa evolución, no para describir el funcionamiento actual.

*Propuesta inicial de marzo de 2026, anotada y reconciliada en agosto de 2026.*
