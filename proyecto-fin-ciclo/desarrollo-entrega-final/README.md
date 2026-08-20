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
- `Memoria_TFC_Proyecto_Iago_Durán_Romera.docx`: **memoria DOCX final sincronizada**. Generada a partir de las fuentes canónicas `01-10` y reconciliada con el estado post-merge de la PR #8. El binario ha sido validado estructuralmente y mediante render completo de 24 páginas (SHA-256: `bf447ba3668f5b0106f1a8bdb0622c070adbc76af1e9e49629f273ee46cbeb1a`). Los capítulos `01-10` en Markdown continúan siendo la fuente canónica para futuras regeneraciones.

*Contrato de entrega actualizado — agosto de 2026.*
