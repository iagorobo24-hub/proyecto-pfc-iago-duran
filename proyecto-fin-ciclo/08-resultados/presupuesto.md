# Presupuesto del Proyecto

> Una de las gracias de este proyecto es que **salió completamente gratis**. Bueno, gratis del todo no — hubo que invertir tiempo, un portátil y conexión a internet. Pero en coste de software y servicios, cero euros.

---

## 1. Resumen

| Concepto | Coste real | Coste estimado si fuera de pago |
|----------|-----------|--------------------------------|
| Herramientas de desarrollo | 0 € | 240 €/año |
| Hosting y servidores | 0 € | 180 €/año |
| Base de datos | 0 € | 300 €/año |
| API de IA | 0 € | 120 €/año |
| Dominio | 0 € | 15 €/año |
| **TOTAL** | **0 €** | **~855 €/año** |

---

## 2. Desglose detallado

### 2.1 Herramientas de desarrollo

| Herramienta | Versión usada | Coste real | Por qué es gratis |
|-------------|--------------|------------|-------------------|
| Windsurf IDE | 2025-2026 | 0 € | Tiene un tier gratuito con uso ilimitado de IA |
| VSCode | Última | 0 € | Open source, siempre gratis |
| GitHub | Gratuito | 0 € | Repos públicos ilimitados gratis |
| Git | System | 0 € | Open source |
| Node.js | 22 LTS | 0 € | Open source |
| Playwright | Última | 0 € | Open source |
| **Total herramientas** | | **0 €** | |

> **Si hubiera usado herramientas de pago:** GitHub Copilot cuesta 10 €/mes (100 €/año con descuento estudiante), y otras herramientas similares rondan los 10-20 €/mes.

### 2.2 Infraestructura (hosting y servidores)

| Servicio | Plan | Coste real | Límites del plan gratis |
|----------|------|-----------|------------------------|
| Vercel | Hobby | 0 € | 100 GB ancho de banda, 600 horas de build/mes |
| Vercel Functions | Incluidas | 0 € | 100 GB/hora de ejecución al mes |
| **Total infraestructura** | | **0 €** | |

> **Si fuera de pago:** Un VPS básico para alojar esto cuesta unos 5-10 €/mes. Vercel Pro cuesta 20 €/mes. Con plan de pago se eliminarían los límites, pero para un proyecto de este tamaño el gratuito sobra.

### 2.3 Base de datos

| Servicio | Plan | Coste real | Límites |
|----------|------|-----------|---------|
| Firebase (Firestore) | Spark | 0 € | 50K escrituras/día, 20K lecturas/día |
| Firebase Auth | Spark | 0 € | 10K registros/mes |
| Supabase (migración) | Free | 0 € | 500 MB base de datos, 2 GB ancho de banda |
| **Total base de datos** | | **0 €** | |

> **Si fuera de pago:** Firebase Blaze (pago por uso) saldría por unos 15-25 €/mes con el volumen de datos del catálogo. Supabase Pro cuesta 25 €/mes.

### 2.4 API de IA

| Servicio | Modelos usados | Coste real | Cómo funciona |
|----------|---------------|-----------|---------------|
| OpenRouter | Claude 3.5 Haiku, DeepSeek R1, Qwen | 0 € | Modelos gratuitos con límites diarios |
| **Total IA** | | **0 €** | |

> **Si fuera de pago:** La API directa de Anthropic cuesta unos 0.80 €/millón de tokens de entrada. Con el uso estimado del proyecto (unas 500 consultas/mes), serían unos 8-10 €/mes.

### 2.5 Hardware

| Elemento | Coste | Notas |
|----------|-------|-------|
| Portátil personal | Ya lo tenía | HP con 16 GB RAM, i5 12ª gen |
| Conexión a internet | Ya la tenía | Fibra 300 Mbps |
| **Total hardware** | **0 €** (ya lo tenía) | |

---

## 3. Comparativa: coste real vs. coste estimado

| Concepto | Coste real (12 meses) | Coste estimado (12 meses) | Ahorro |
|----------|---------------------|--------------------------|--------|
| Desarrollo (IDEs, GitHub) | 0 € | 240 € | 100 % |
| Hosting + Functions | 0 € | 240 € | 100 % |
| Base de datos | 0 € | 192 € | 100 % |
| API de IA | 0 € | 120 € | 100 % |
| **TOTAL** | **0 €** | **~792 €/año** | **100 %** |

**Conclusión:** Usando tiers gratuitos y herramientas open source, el proyecto se mantiene con coste cero. Esto es importante porque:
- Un estudiante de FP puede permitírselo
- Se puede dejar funcionando sin preocuparse de pagos mensuales
- Si en el futuro hiciera falta más capacidad, se puede migrar a planes de pago manteniendo el mismo código

---

## 4. Valor estimado del proyecto

Si esto lo hiciera una empresa de desarrollo, ¿cuánto costaría?

| Concepto | Horas estimadas | Coste/hora | Total |
|----------|----------------|------------|-------|
| Análisis y diseño | 40 h | 50 €/h | 2.000 € |
| Desarrollo frontend (7 módulos) | 200 h | 50 €/h | 10.000 € |
| Configuración backend (Firebase, Vercel) | 40 h | 50 €/h | 2.000 € |
| Scraping y sincronización de datos | 30 h | 50 €/h | 1.500 € |
| Testing y despliegue | 30 h | 50 €/h | 1.500 € |
| Documentación | 40 h | 50 €/h | 2.000 € |
| **TOTAL estimado** | **380 h** | | **19.000 €** |

Obviamente, esto es una estimación muy orientativa. Una empresa real probablemente tardaría menos (porque tiene más experiencia) pero cobraría más por hora. El dato sirve para poner en contexto el valor de lo desarrollado.

---

*Presupuesto actualizado: Mayo 2026*
*Todos los precios basados en tiers gratuitos y planes de pago consultados en mayo de 2026*
