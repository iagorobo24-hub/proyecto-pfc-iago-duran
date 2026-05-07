---
tool_id: AI-002
nombre: GitHub Copilot
version_observada: 2025-2026 (incluido en VSCode gratuito)
rol_principal: Autocompletado de código contextual durante el desarrollo
url: https://github.com/features/copilot
---

# Ficha Técnica: GitHub Copilot

## ¿Qué es?

GitHub Copilot es un asistente de IA para programación que se integra directamente en el editor de código (VSCode, JetBrains, Neovim, etc.). Funciona como un **autocompletado inteligente** que sugiere código completo mientras escribes.

## ¿Para qué lo usé?

### Fase 1: Desarrollo local con VSCode

Durante toda la fase de desarrollo de la SPA, Copilot me ayudó con:

- **Autocompletado de componentes React:** Sugiere props, estados y métodos.
- **Generación de funciones auxiliares:** Traducía pseudocódigo a funciones reales.
- **Conversiones de formato:** Transformar arrays, объекты JSON, parsear strings.
- **Escritura de CSS:** Sugiere nombres de clases y valores de propiedades.
- **Debugging rápido:** Explicaba errores y sugería fixes.

### Fase 2: Documentación incremental

Copilot también ayudó a documentar cambios:
- Generación de commits semánticos
- Escritura de CHANGELOG
- Completado de JSDoc en funciones

## ¿Cómo lo usé? (Flujo de trabajo)

1. Escribía en VSCode (con Copilot instalado)
2. Copilot mostraba sugerencias en gris mientras escribía
3. Presionaba **Tab** para aceptar la sugerencia
4. Si la sugerencia no era correcta, seguía escribiendo normalmente
5. Copilot adaptaba las siguientes sugerencias al contexto

## Ejemplo de uso típico

Escribía:
```javascript
const handleLogin = async () => {
  const result = await 
```

Copilot sugería automáticamente:
```javascript
const handleLogin = async () => {
  const result = await loginWithGoogle();
  if (result) {
    navigate('/app');
  }
};
```

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Velocidad de autocompletado | ⭐⭐⭐⭐⭐ |
| Integración nativa con VSCode | ⭐⭐⭐⭐⭐ |
| Calidad en código repetitivo | ⭐⭐⭐⭐⭐ |
| Comprensión de contexto (bucles, funciones) | ⭐⭐⭐⭐ |
| Calidad en lógica compleja | ⭐⭐ |
| Coste (incluido en VSCode) | ⭐⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Lógica compleja requiere ajustes:** En hooks con estados interdependientes, las sugerencias podían ser inexactas.
2. **No entiende el negocio:** No sabía que "Sonepar" era una empresa de material eléctrico, generaba nombres genéricos.
3. **Saturación de sugerencias:** En archivos grandes, las sugerencias dejaban de ser útiles.
4. **Coste acumulado:** Aunque VSCode es gratuito, requiere una cuenta de GitHub (que en su momento tenía Copilot incluido gratis).

## ¿Cuándo lo usaba?

✅ **Sí lo usaba:**
- Escribir boilerplate de componentes React
- Generar funciones de utilidad (parseDate, formatCurrency, etc.)
- Completar arrays de constantes (marcas, categorías)
- Escribir tests unitarios básicos
- Documentar funciones con JSDoc

❌ **No lo usaba:**
- Diseñar arquitectura de la aplicación (usaba Claude para esto)
- Depurar errores complejos de estado de React
- Generar código que requería conocimiento del dominio

## ¿Por qué lo dejo de usar?

Agoté los 2 meses de prueba gratuita incluidos en VSCode en mayo 2026. Después de eso:
- Pasé a **Windsurf** (alternativa gratuita con modelos ilimitados)
- Pasé a **OpenCode** (CLI con modelos NVIDIA)

## Lecciones aprendidas con esta herramienta

1. **Copilot es un amplificador, no un sustituto:** Cuanto mejor sabías lo que querías, mejores eran las sugerencias.
2. **No para aprender, para ejecutar:** Para aprender a programar, mejor evitar Copilot (genera código sin explicar). Para ejecutar lo que ya sabes, es perfecto.
3. **La tecla Tab es tu amiga:** A veces aceptar la primera sugerencia y luego modificarla era más rápido que escribir todo desde cero.

## Comparativa con otras herramientas del proyecto

| Característica | GitHub Copilot | Windsurf | OpenCode CLI |
|---|---|---|---|
| Tipo de interacción | Autocompletado en editor | Chat en sidebar | Chat en terminal |
| Coste | Gratuito (periodo prueba) → $$ | Freemium | Gratis (modelos NVIDIA) |
| Acceso al codebase completo | ✅ Sí | ✅ Sí | ✅ Sí (con `opencode --repo`) |
| Ejecución de comandos | ❌ No | ❌ No | ✅ Sí |
| Mejor para | Coding tiempo real | Diseño + código | Refactorización masiva |

## Referencias

- [GitHub Copilot](https://github.com/features/copilot)
- [Documentación](https://docs.github.com/en/copilot)

---

**Fecha de elaboración de esta ficha:** Abril 2026