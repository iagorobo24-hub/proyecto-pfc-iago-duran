# Metodología de desarrollo asistido por IA

## Principio

La metodología del PFC no es “pedir código y aceptarlo”. Se usa un ciclo de trabajo verificable:

1. **Objetivo:** definir qué resultado observable se necesita.
2. **Contexto:** leer código, contratos y restricciones existentes.
3. **Propuesta:** pedir a la IA análisis, alternativas o implementación acotada.
4. **Inspección:** revisar el cambio real, no solo el informe del agente.
5. **Validación:** ejecutar pruebas/compilación o comprobar la evidencia disponible.
6. **Corrección:** arreglar la capa responsable del fallo.
7. **Documentación:** registrar decisiones, limitaciones y estado Git.

## Roles de las herramientas

- Chat web: ideación, explicación y revisión conceptual.
- IDE con IA: cambios pequeños y autocompletado contextual.
- Agente CLI/GitHub: trabajo sobre repositorio, comandos, tests y commits.
- Modelo dentro de la aplicación: funcionalidad de usuario, siempre detrás del gateway y con fallbacks/validaciones.

## Control de alcance

Cada tarea debe separar:

- cambio necesario;
- mejora opcional;
- deuda técnica;
- idea futura.

La IA no amplía el alcance por iniciativa propia. Un refactor amplio solo se justifica si resuelve el objetivo o reduce un riesgo demostrado.

## Evidencia

Se distinguen cinco estados:

- **verificado:** observado en código/configuración o ejecución;
- **reportado:** aparece en una fuente, pero no se ha comprobado;
- **inferido:** conclusión razonable a partir de evidencia;
- **supuesto:** decisión temporal para poder avanzar;
- **recomendado:** propuesta de mejora.

## Testing

Un test verde es evidencia útil, no sustituto de la revisión. También se comprueba que la prueba mida el contrato correcto y que no se haya debilitado para hacerla pasar.

## Git

Antes de publicar cambios se revisan rama, estado y diff. Se evita sobrescribir trabajo existente o reescribir historia sin necesidad. La evidencia de un commit concreto no se reutiliza como si correspondiera a otro estado del repositorio.

## IA y seguridad técnica

Las salidas sobre electricidad, normativa, mantenimiento o producto pueden ser erróneas aunque estén bien redactadas. Deben verificarse con normativa vigente, documentación oficial del fabricante o personal cualificado antes de convertirse en instrucción real.

## Resultado

La metodología busca que la IA reduzca trabajo mecánico sin reducir la responsabilidad del autor. La capacidad de justificar por qué un cambio es correcto forma parte del resultado académico.
