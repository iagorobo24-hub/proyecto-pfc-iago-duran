---
tool_id: DB-001
nombre: Firebase
version_observada: 2025-2026
rol_principal: Autenticación (Google Sign-In) y base de datos (Firestore)
url: https://firebase.google.com
---

# Ficha Técnica: Firebase

## ¿Qué es?

Firebase es la plataforma de Google para desarrollo de aplicaciones. Para este proyecto se usaron dos servicios:

1. **Firebase Auth** — Sistema de autenticación con Google
2. **Cloud Firestore** — Base de datos NoSQL en la nube

## ¿Para qué lo usé?

### 1. Autenticación con Google

```javascript
// Firebase Auth - Google Sign-In
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
// result.user contiene: displayName, email, photoURL, uid
```

Flujo:
1. Usuario hace clic en "Iniciar sesión con Google"
2. Firebase abre popup de Google
3. Usuario autoriza
4. App recibe datos del usuario

### 2. Almacenamiento de datos por usuario

Firestore guarda los datos de cada usuario de forma separada:

```
/users/{uid}/
  ├── profile/default        # Datos de perfil
  ├── fichas/history/default # Historial de fichas consultadas
  ├── presupuestos/default   # Presupuestos guardados
  ├── incidencias/default    # Incidencias registradas
  └── kpi/entries/default    # Entradas de KPI
```

### 3. Catálogo de productos

Además de datos de usuario, Firestore contiene el catálogo:

```
/catalog_metadata/hierarchy   # Jerarquía Familias > Marcas > Gamás > Tipos
/catalog_products/{ref}     # Datos de cada producto
```

## Configuración

### firebaseConfig.js

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "...",
  authDomain: "proyectos-sonepar.firebaseapp.com",
  projectId: "proyectos-sonepar",
  // ... otras config
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

**Importante:** La API key de Firebase NO es secreta. Es pública por diseño. La seguridad real viene de las Firebase Security Rules.

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cualquier usuario autenticado puede leer/editar sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // El catálogo es solo lectura para todos
    match /catalog_metadata/{document} {
      allow read: if true;
    }
    match /catalog_products/{document} {
      allow read: if true;
    }
  }
}
```

## Costes

| Plan | Precio | Límites |
|------|--------|---------|
| **Spark (Gratis)** | 0€ | 50K lecturas/día, 50K escrituras/día, 1GB storage |
| Blaze (Pago por uso) | €€€ | Sin límites |

**Coste real del proyecto:** 0€ (plan Spark suficiente para desarrollo)

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Integración con Google Auth | ⭐⭐⭐⭐⭐ |
| SDK para React (reactfire) | ⭐⭐⭐⭐ |
| Seguridad integrada (Rules) | ⭐⭐⭐⭐ |
| Plan gratuito generoso | ⭐⭐⭐⭐ |
| Documentación | ⭐⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Límite de 50K escrituras/día:** Con 75K productos en el catálogo, la sincronización completa supera este límite.
2. **Búsqueda limitada:** Firestore no tiene búsqueda full-text. Tuve que generar `searchKeywords` como array para poder hacer `array-contains`.
3. **Modelo de datos plano:** No hay relaciones tipo SQL. Todo es documentos y sub-colecciones.
4. **Coste en producción:** Si el catálogo crece mucho, el plan Spark se queda corto.

## ¿Por qué migrar a Supabase?

Según los planes documentados en EVOLUCION.md, se quiere migrar a Supabase por:

1. **Búsqueda full-text nativa:** PostgreSQL tiene `tsvector` para búsqueda de texto completo.
2. **Límites más generosos:** Plan gratuito de Supabase tiene 500MB de base de datos.
3. **SQL:** Firestore no permite queries complejas; Supabase sí.
4. **Replicación:** Supabase permite réplicas de lectura geográficamente distribuidas.

## Lecciones aprendidas

1. **Las API keys de Firebase son públicas:** No intentes ocultarlas. La seguridad son las Rules.
2. **Genera keywords de búsqueda:** Firestore solo busca por campos exactos o arrays. Para búsqueda de texto, necesitas preprocesar.
3. **Plan Spark = desarrollo:** Para producción con muchos usuarios, necesitas Blaze o migrar a otro servicio.

## Referencias

- [Firebase](https://firebase.google.com)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Fecha de elaboración de esta ficha:** Abril 2026