# Desarrollo de la entrega final

Esta carpeta contiene **artefactos derivados** de la documentación fuente de `proyecto-fin-ciclo/`.

## Orden de autoridad

1. Código/configuración del commit documentado.
2. Capítulos `01-10` en Markdown.
3. Diagramas, memoria DOCX y presentaciones generados desde esas fuentes.

Los artefactos derivados deben regenerarse cuando cambian los hechos canónicos. No se deben corregir cifras en un artefacto final de manera independiente si la fuente sigue diciendo otra cosa.

## Estado de sincronización

- `diagrams/`: **cinco diagramas canónicos** en SVG, rediseñados para separar visión funcional, arquitectura, organización del código, flujo de Fichas y flujo de IA. Los antiguos PNG duplicados se eliminan para evitar deriva; cualquier PNG de entrega se renderiza desde el SVG correspondiente. Ver `diagrams/README.md` para el orden de lectura y contrato visual.
- `presentaciones/`: variantes visuales reconciliadas con los hechos canónicos.
- `Memoria_TFC_Proyecto_Iago_Durán_Romera.docx`: **pendiente de sustituir en GitHub por el binario regenerado**. La memoria completa se ha regenerado desde las 53 fuentes y validado por render, pero el transporte binario al repositorio no forma parte de este estado. Mientras tanto, para contenido prevalecen los capítulos `01-10`.

Esta marca evita que el DOCX versionado se interprete erróneamente como la memoria vigente.

*Contrato de entrega actualizado — agosto de 2026.*
