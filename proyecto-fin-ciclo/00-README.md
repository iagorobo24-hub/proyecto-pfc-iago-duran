# Proyecto Fin de Ciclo — índice y contrato documental

**Proyecto:** Suite de herramientas web para el sector eléctrico y logístico, desarrollada con apoyo de IA generativa  
**Autor:** Iago Durán Romera  
**Ciclo:** Automatización y Robótica Industrial  
**Centro:** CIFP Universidade Laboral  
**Curso:** 2025-2026

## Estructura

Esta carpeta contiene la documentación académica fuente. La estructura estable es:

| Capítulo | Contenido | Archivos fuente |
|---|---|---:|
| 01 | Introducción, alcance y herramientas | 3 |
| 02 | Contexto de la IA | 3 |
| 03 | Análisis y requisitos | 4 |
| 04 | Diseño técnico | 5 |
| 05 | Proceso de desarrollo | 4 |
| 06 | Herramientas y servicios utilizados | 15 |
| 07 | Manuales de uso | 7 |
| 08 | Resultados y evidencias | 4 |
| 09 | Conclusiones y líneas futuras | 3 |
| 10 | Material docente | 5 |

Además, `desarrollo-entrega-final/` contiene artefactos derivados de la memoria y la presentación.

## Fuente de verdad

Para evitar contradicciones se aplican estas reglas:

1. **Código y configuración** determinan qué funcionalidad existe en el snapshot documentado.
2. **Los capítulos 01-10** explican esa funcionalidad y el proceso académico.
3. **Resultados cuantitativos** solo pueden declararse como actuales si incluyen método o evidencia reproducible.
4. **Fichas de herramientas externas** describen principalmente cómo se usaron durante el PFC. Precios, planes, cuotas y modelos disponibles cambian y no se tratan como datos permanentes.
5. **Presentación, DOCX y HTML** son derivados: si contradicen los capítulos fuente, prevalecen los capítulos fuente hasta regenerar el artefacto.

### Hechos canónicos del proyecto

- La aplicación contiene **7 herramientas funcionales + 1 Dashboard Global**.
- Firebase pertenece a la **historia de la arquitectura**; la implementación actual usa Supabase para autenticación y datos persistentes definidos en el código.
- El gateway de IA soporta varios modelos/proveedores; **no hay un único modelo global**.
- Existen suites de Vitest y Playwright. El número de tests que pasan no se congela en la memoria sin una ejecución asociada al commit.
- La cifra del catálogo es un dato de base de datos, no una constante documental. Debe medirse cuando sea relevante.
- El PFC es académico; no se presenta como integración oficial con sistemas corporativos internos.

## Convención de evidencia

En los capítulos se distingue entre:

- **Implementado:** visible en código/configuración.
- **Verificado por ejecución:** existe log o resultado de una ejecución concreta.
- **Histórico:** ocurrió durante el desarrollo, pero no describe necesariamente el estado actual.
- **Estimado:** cálculo orientativo, no medición.
- **Pendiente:** objetivo futuro o evidencia que falta regenerar.

## Enlaces

- Repositorio: `iagorobo24-hub/proyecto-pfc-iago-duran`
- Aplicación desplegada: `https://proyecto-pfc-iago-duran.vercel.app`

> La aportación principal del PFC no es demostrar que la IA sustituye el conocimiento técnico. Es documentar un proceso de trabajo en el que la IA acelera tareas, mientras el alumno conserva la responsabilidad de definir, revisar, probar, documentar y defender el resultado.
