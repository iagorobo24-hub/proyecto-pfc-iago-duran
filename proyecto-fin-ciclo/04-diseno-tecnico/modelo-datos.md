# Modelo de Datos — Cómo se guarda todo

## La historia de los datos

El modelo de datos fue cambiando según evolucionaba el proyecto:

1. **Al principio:** Los datos estaban en archivos JavaScript dentro de la propia web. Había unos 120 productos de prueba. Funcionaba para hacer pruebas pero no valía para producción.
2. **Después:** Migré todo a Firestore (una base de datos en la nube de Google). Ahí están los 400.000+ productos del catálogo real.
3. **Ahora:** Estoy migrando a Supabase (PostgreSQL) porque Firestore tiene limitaciones para según qué cosas.

Este documento explica cómo está organizado todo ahora mismo en Firestore.

---

## Las colecciones (las "tablas" de la base de datos)

En Firestore los datos se guardan en **colecciones** (como las tablas de una base de datos normal, pero más flexibles).

### La colección grande: `productos`

Aquí están todos los productos del catálogo. Cada producto tiene esta pinta:

```
ref_fabricante: "ABC123456"         ← Referencia del fabricante
name: "Interruptor automático 10A"  ← Nombre del producto
familia: "Protecciones"             ← Familia (ej: Iluminación, Cableado...)
subfamilia: "Interruptores"         ← Subfamilia o gama
tipo: "magnetotérmico"              ← Tipo específico
marca: "Schneider"                  ← Marca
desc: "Descripción técnica..."      ← Descripción
precio: null                        ← Precio (casi siempre vacío, hay que pedirlo)
image: "https://..."                ← Foto del producto
url: "https://..."                  ← Enlace a la web del distribuidor
keywords: ["interruptor", "10a"]   ← Palabras clave para buscar
```

**Para buscar rápido:** La base de datos tiene índices para buscar por familia, por marca, o por palabras clave.

### La colección `usuarios`

Cuando alguien inicia sesión con Google, se crea automáticamente un perfil:

```
uid: "google_123456789"           ← ID único
email: "usuario@gmail.com"        ← Su correo
displayName: "Juan Pérez"         ← Su nombre
photoURL: "https://..."           ← Su foto de perfil
role: "user"                      ← user / admin (de momento todos users)
preferencias: {
    tema: "dark",                 ← dark / light
    idioma: "es"
}
```

### La colección `presupuestos`

Los presupuestos que va creando cada usuario:

```
usuario_id: "google_123456789"
items: [
    { ref: "ABC123", name: "Interruptor...", cantidad: 5, precio: 25.50 },
    { ref: "DEF456", name: "Cable...", cantidad: 20, precio: 3.20 }
]
subtotal: 127.50
iva: 21
total: 154.28
estado: "borrador"              ← borrador / enviado / aceptado
```

Cada usuario solo ve sus propios presupuestos (esto lo controlan las reglas de seguridad).

### La colección `incidencias`

Cada incidencia que se registra:

```
titulo: "Producto defectuoso"
descripcion: "El producto llegó dañado..."
categoria: "calidad"             ← calidad / logistica / producto
severidad: "alto"                ← bajo / medio / alto / critico
estado: "abierta"                ← abierta / en_proceso / resuelta
```

### La colección `formacion`

Aquí se guarda qué formación tiene cada empleado y qué cursos ha hecho:

```
empleado: "Juan Pérez"
curso: "Normativa eléctrica 2026"
estado: "completado"             ← no_iniciado / en_curso / completado
nota: 85
```

---

## Datos que NO están en la nube

No todo está en Firestore. Algunos datos clave están en archivos locales dentro de la aplicación:

### La jerarquía de navegación

Para navegar por el catálogo (familia → marca → gama), uso un archivo JSON local con la estructura. Es mucho más rápido tenerlo en el navegador que pedírselo a la base de datos cada vez.

```
familias: [
    {
        nombre: "Iluminación",
        marcas: [
            {
                nombre: "Philips",
                gamas: ["LED", "Convencional", "Decorativa"]
            }
        ]
    }
]
```

### Los datos de prueba

Al principio del proyecto, cuando aún no había base de datos, los productos estaban en un archivo JavaScript con 120 productos de ejemplo. Ese archivo ya no se usa en producción, pero lo mantengo por si alguien quiere probar la app sin conexión.

---

## El futuro: migración a Supabase

Firestore ha funcionado, pero tiene limitaciones:
- Solo 50.000 escrituras al día en el plan gratis
- Las búsquedas por texto son limitadas
- No se pueden hacer "uniones" entre colecciones

Por eso estoy migrando a **Supabase**, que usa PostgreSQL. La estructura será muy parecida, pero con tablas normales y corrientes:

```
Tabla: products
    id (autonumérico)
    ref_fabricante (único)
    nombre
    familia
    marca
    keywords (para búsqueda)

Tabla: brands (marcas)
    id (autonumérico)
    nombre
    logo_url

Tabla: profiles (usuarios)
    id (referencia a auth.users)
    email
    nombre
    rol
```

La ventaja de PostgreSQL es que las búsquedas por texto son mucho mejores y no tengo límite de escrituras diarias.

---

## Comparativa rápida: Firestore vs Supabase

| Aspecto | Firestore (actual) | Supabase (futuro) |
|---------|-------------------|-------------------|
| **Tipo** | NoSQL (como un JSON gigante) | SQL (tablas normales) |
| **Flexibilidad** | Mucha | Menos, pero más ordenada |
| **Búsqueda** | Limitada | Búsqueda por texto completa |
| **Límite gratis** | 50K escrituras/día | 500 MB de almacenamiento |
| **Precio** | 0€ | 0€ |

**Conclusión:** Firestore está bien para empezar. Supabase es mejor para cuando el proyecto crece.

---

*Si quieres ver los scripts que mueven los datos, están en `app/scripts/`*
