---
tool_id: AI-001
nombre: Claude Web
rol_en_el_pfc: ideación, arquitectura y prototipos
estado_documental: uso histórico y ocasional
---

# Claude Web

## Uso en el PFC

Claude Web fue una de las primeras herramientas utilizadas para convertir descripciones de necesidades en prototipos JSX y para discutir arquitectura antes de disponer de agentes con acceso directo al repositorio.

En las fases iniciales el flujo era esencialmente:

1. describir una herramienta;
2. recibir una propuesta o componente;
3. copiarlo al proyecto;
4. ejecutar y revisar localmente;
5. iterar.

## Qué aportó

- velocidad para crear prototipos;
- explicaciones de React y arquitectura;
- apoyo para dividir problemas complejos;
- generación de alternativas antes de implementar.

## Limitación principal

El chat web no debe describirse como si conociera automáticamente el estado del repositorio. Cuando no recibe archivos/contexto suficiente puede proponer código coherente en abstracto pero incorrecto para el proyecto real.

## Lección

El valor estuvo en **diseñar y discutir**, no en aceptar código por autoridad del modelo. Las decisiones se validaron después en el entorno real.

> Los límites de uso, planes y capacidades actuales de Claude deben consultarse en la documentación de Anthropic; esta ficha no los congela como datos del PFC.
