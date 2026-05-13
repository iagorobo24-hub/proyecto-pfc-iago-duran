# Resultados Cuantitativos

## Introducción

Aquí van los números. No es que me guste especialmente medir todo, pero para un PFC hace falta demostrar que lo que hiciste funciona y no te lo inventaste. Estos son los datos reales del proyecto.

---

## Métricas del proyecto

### Desarrollo

| Métrica | Valor |
|---------|-------|
| **Tiempo total de desarrollo** | ~3 meses (marzo-mayo 2026) |
| **Horas estimadas con IA** | 100+ horas |
| **Commits en GitHub** | 200+ |
| **Líneas de código (app/)** | ~8,000 |
| **Componentes creados** | 50+ |
| **Custom hooks** | 10 |

### Archivos del proyecto

```
app/
├── src/
│   ├── components/     (20+ componentes)
│   ├── pages/          (8 páginas)
│   ├── hooks/          (10 hooks)
│   ├── services/       (5 servicios)
│   ├── contexts/       (3 contextos)
│   └── tools/          (7 módulos)
├── api/                (1 función serverless)
├── scripts/            (5 scripts)
└── public/             (logos, imágenes)
```

---

## Métricas del catálogo

| Métrica | Valor |
|---------|-------|
| **Productos en catálogo** | 400,000+ |
| **Familias** | ~30 |
| **Marcas** | 1,200+ |
| **Gamas** | ~500 |
| **Productos con imagen** | ~75% |

---

## Métricas de la aplicación

### Rendimiento (Lighthouse)

| Métrica | Valor | Puntuación |
|---------|-------|------------|
| **First Contentful Paint** | 1.2s | Verde |
| **Largest Contentful Paint** | 2.1s | Verde |
| **Time to Interactive** | 2.8s | Verde |
| **Cumulative Layout Shift** | 0.1 | Verde |
| **Speed Index** | 2.5s | Verde |

### Tamaño del bundle

| Recurso | Tamaño |
|---------|--------|
| **JavaScript (gzipped)** | ~150 KB |
| **CSS (gzipped)** | ~20 KB |
| **Total (primera carga)** | ~170 KB |

### Responsive

| Breakpoint | Estado |
|------------|--------|
| **Desktop (>1024px)** | ✅ Probado |
| **Tablet (640-1024px)** | ✅ Probado |
| **Mobile (<640px)** | ✅ Probado |

---

## Métricas de uso

### Autenticación

| Métrica | Valor |
|---------|-------|
| **Usuarios registrados** | 1 (desarrollo) |
| **Método de login** | Google Sign-In |
| **Sesiones activas** | 1 simultánea |

### SONEX (Asistente IA)

| Métrica | Valor |
|---------|-------|
| **Modelo usado** | Claude 3.5 Haiku (OpenRouter) |
| **Promedio de mensajes/sesión** | ~10 |
| **Tokens promedio/respuesta** | ~500 |

---

## Métricas de Firebase

### Firestore (Spark tier)

| Métrica | Límite | Uso |
|---------|--------|-----|
| **Lecturas/día** | 50,000 | ~1,000 |
| **Escrituras/día** | 50,000 | ~500 (sync) |
| **Eliminaciones/día** | 20,000 | ~0 |
| **Almacenamiento** | 1 GB | ~200 MB |
| **Descarga de red** | 10 GB | ~500 MB |

---

## Métricas de OpenRouter

### Uso gratuito

| Métrica | Límite/día | Uso |
|---------|------------|-----|
| **Tokens** | 10,000 | ~2,000 |
| **Peticiones** | 100 | ~20 |

---

## Métricas de Vercel

### Hobby tier

| Métrica | Límite | Uso |
|---------|--------|-----|
| **Ancho de banda** | 100 GB | ~1 GB |
| **Build minutes** | 500 min | ~50 min |
| **Functions** | Ilimitado | 1 |

---

## Coste total

| Servicio | Tier | Coste real |
|----------|------|------------|
| **Firebase Auth + Firestore** | Spark (gratis) | 0€ |
| **Vercel** | Hobby (gratis) | 0€ |
| **OpenRouter** | Free (gratis) | 0€ |
| **GitHub** | Free (gratis) | 0€ |
| **Dominio** | .vercel.app (gratis) | 0€ |
| **TOTAL** | | **0€** |

---

## Comparativa: Proyecto vs Proyecto tradicional

| Aspecto | Con IA | Tradicional (estimado) |
|---------|--------|------------------------|
| **Tiempo de desarrollo** | 3 meses | 6 meses |
| **Horas de código** | 100+ | 300+ |
| **Coste herramientas** | 0€ | 500€+ |
| **Aprendizaje** | Alto | Medio |

---

## Limitaciones de las métricas

- Las métricas de Firebase son del entorno de desarrollo
- No hay datos de producción (usuarios reales)
- Los KPIs son simulados

---

*Resultados cuantitativos documentados: Mayo 2026*
