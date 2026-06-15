# Taxonomía de Base de Datos — Sonepar Tools
*Última actualización: 14 de junio de 2026*
*Total de productos: 31.324*

## Estado actual de familias y subfamilias

A continuación se detalla la distribución actual de productos clasificados por su familia y subfamilia en la base de datos de producción:

| Familia | Subfamilia | Total de Productos |
| :--- | :--- | :---: |
| **Automatización** | Accesorio Automatización | 196 |
| | Arrancador | 15 |
| | Arrancador Suave | 4 |
| | Contactor | 2286 |
| | Detector Inductivo | 15 |
| | Elemento de Control | 208 |
| | Final de Carrera | 12 |
| | Fuente alimentación | 60 |
| | Guardamotor | 331 |
| | HMI | 28 |
| | Interruptor Horario | 96 |
| | Módulo de E/S | 4 |
| | PLC | 59 |
| | Pulsador | 441 |
| | Relé de Control | 1558 |
| | Relé de Seguridad | 29 |
| | Sensor energía | 21 |
| | Variador de Frecuencia | 65 |
| **Automatización de edificios** | Acoplador KNX | 2 |
| | Actuador HVAC | 1 |
| | Actuador HVAC KNX | 1 |
| | Actuador KNX | 3 |
| | Base Conectada | 5 |
| | Compensador | 1 |
| | Controlador KNX | 9 |
| | Detector Movimiento | 5 |
| | Interface KNX | 2 |
| | Interruptor Rotulo | 1 |
| | Mando Smart | 12 |
| | Micromodulo Smart | 4 |
| | Pasarela KNX | 3 |
| | Pulsador Telemando | 1 |
| | Router KNX | 1 |
| | Sensor KNX | 3 |
| | Telemando | 1 |
| **Climatización** | Termostato | 17 |
| **Comunicación** | Accesorio Comunicación | 1444 |
| | Bornas | 79 |
| | Gateway comunicación | 1 |
| | Módulo de Comunicación | 4 |
| **Fotovoltaica** | Accesorio Fotovoltaica | 2 |
| | Caja Combinadora | 6 |
| | Interruptor CC | 2 |
| | Seccionador CC | 12 |
| **Iluminación** | Accesorio Iluminación | 17 |
| | Bateria | 5 |
| | Linterna | 1 |
| | Luminaria Emergencia | 41 |
| **Instalación** | Accesorio Instalación | 1896 |
| | Bandeja Portacables | 24 |
| | Bornas | 6816 |
| | Canal de Instalación | 48 |
| | Canalización | 24 |
| | Canalización prefabricada | 670 |
| | Mini Canal | 24 |
| **Protecciones y Cuadros** | Accesorio Protecciones y Cuadros | 1675 |
| | Analizador redes | 129 |
| | Arrancador Suave | 1 |
| | Bornas | 28 |
| | Caja Conexion | 3 |
| | Caja Distribucion | 1461 |
| | Central Reporte | 2 |
| | Conmutador | 3 |
| | Contactor | 2 |
| | Contador de energía | 120 |
| | Control Aislamiento | 2 |
| | Cortacircuito Fusible | 31 |
| | Fuente alimentación | 245 |
| | Gateway comunicación | 11 |
| | Interruptor Caja Moldeada | 1278 |
| | Interruptor Diferencial | 555 |
| | Interruptor Magnetotérmico | 8615 |
| | Interruptor Seccionador | 225 |
| | Protección arco | 5 |
| | Proteccion Sobretension | 151 |
| | Rearmador | 6 |
| | Relé de Control | 2 |
| | Relé de Seguridad | 1 |
| | Sensor energía | 8 |
| | Timbre | 1 |
| | Toma Corriente Industrial | 7 |
| | Zumbador | 1 |
| **Robótica** | Accesorio de Robot | 4 |
| | Controlador de Robot | 3 |
| | Robot Industrial | 2 |
| **Vehículos eléctricos** | Accesorio Vehículo Eléctrico | 1 |
| | Carga rápida VE | 5 |
| | Carga VE | 60 |
| | Protección para recarga | 26 |
| | Puntos de recarga | 39 |

---

## Cobertura de imágenes por marca

Estado actual del inventario de imágenes asociadas a cada fabricante en la tabla `products`:

| Marca | Total | Sin imagen | Cobertura % |
|---|---|---|---|
| Phoenix Contact | 8858 | 26 | 99.71% |
| ABB | 7097 | 4 | 99.94% |
| Schneider Electric | 4940 | 33 | 99.33% |
| Eaton | 4924 | 35 | 99.29% |
| Circutor | 1764 | 13 | 99.26% |
| Siemens | 1731 | 15 | 99.13% |
| Finder | 1436 | 15 | 98.95% |
| Legrand | 574 | 19 | 96.69% |

---

## Historial de cambios de taxonomía

A continuación se listan cronológicamente las modificaciones estructurales aplicadas en la base de datos:

### Sesión de Trabajo — 14 de junio de 2026
* **Limpieza y re-scraping de imágenes:** 1.708 URLs dudosas marcadas como NULL, 838 recuperadas con scraper de Sonepar, 1.822 recuperadas con scraper de DuckDuckGo, resultado final 160 sin imagen (99.5% cobertura).
* **Verificación de imágenes (Capa 1):** Ejecución del script `01-clasificar-imagenes.mjs` sobre el catálogo completo (31.164 productos con imagen). Se clasificaron y actualizaron en Supabase: 21.731 como `pendiente_ia` (cargan correctamente y son únicas), 8.952 como `posible_generico` (mismo hash repetido o tamaño < 1.5 KB) y 481 como `no_carga` (URLs rotas o sin formato de imagen).

### Sesión de Trabajo — 13 de junio de 2026
* **Fase A (Unificar Protección Sobretensión):** Consolidación de todos los limitadores de sobretensión dispersos en las familias `Instalación` y `Fotovoltaica` bajo una única subfamilia dentro de `Distribución de potencia`. 
  * *Filas afectadas:* **151**
* **Fase C (Unificar Medidores de Energía):** Consolidación de subfamilias de medida. 
  * Mapeo de `Contador de energía` (anteriormente en `Automatización` e `Instalación`) hacia la familia de potencia. *Filas afectadas:* **31**
  * Mapeo de `Analizador redes` (anteriormente en `Automatización`) hacia la familia de potencia. *Filas afectadas:* **9**
* **Fase E (Renombrado de Accesorios Genéricos):** Sustitución de la subfamilia genérica `"Accesorio"` por nombres unívocos basados en su familia para evitar colisiones en los selectores de búsqueda.
  * *Filas afectadas:*
    * `Accesorio Automatización`: **196**
    * `Accesorio Comunicación`: **1444**
    * `Accesorio Iluminación`: **17**
    * `Accesorio Fotovoltaica`: **2**
    * `Accesorio Instalación`: **1896**
    * `Accesorio Vehículo Eléctrico`: **1**
    * `Accesorio Robótica`: **0** *(Nota: la subfamilia en Robótica es históricamente 'Accesorio de Robot')*
    * `Accesorio Protecciones y Cuadros`: **1675** *(Unificación posterior para resolver la inconsistencia de la Regla 4)*
* **Fase D (Renombrar Distribución de potencia):** Actualización semántica completa para pasar de `'Distribución de potencia'` a `'Protecciones y Cuadros'`, afectando tanto al mapeador del código frontend como a los registros de la DB.
  * *Filas afectadas:* **14.568**
* **Decisión sobre Fase B (Fuente alimentación):** En pausa estratégica y posteriormente descartada tras verificar que las fuentes pertenecen al contexto funcional de `Automatización` (PLC, HMI, módulos de control), por lo que se mantienen allí y no sufrieron cambios.

---

## Convenciones para desarrollo futuro

### Cómo añadir producto nuevo a la base de datos

**Regla 1 — Familias permitidas**
Solo existen estas familias en la base de datos. Bajo ninguna circunstancia deben crearse familias nuevas sin antes validar si el producto encaja en alguna de las siguientes:
* `Automatización`
* `Automatización de edificios`
* `Climatización`
* `Comunicación`
* `Fotovoltaica`
* `Iluminación`
* `Instalación`
* `Protecciones y Cuadros`
* `Robótica`
* `Vehículos eléctricos`

**Regla 2 — Criterio de asignación de familia**
Para clasificar adecuadamente un producto, se debe seguir la siguiente correspondencia según la función y el perfil de usuario objetivo:
* **Protecciones y Cuadros** → Aparamenta modular y protecciones montadas habitualmente en carril DIN o caja moldeada para cuadros eléctricos (residenciales, comerciales o industriales). *Usuario: Instalador electricista, cuadrista.*
* **Instalación** → Material físico utilizado para el conexionado, soporte y guiado del cableado (bornas, bandejas portacables, minicanales, canalizaciones). *Usuario: Instalador general, montador.*
* **Automatización** → Dispositivos de control, maniobra y automatización para maquinaria o líneas industriales (contactores, PLC, guardamotores, HMI, relés industriales, variadores de frecuencia). *Usuario: Integrador de sistemas, ingeniero de automatización.*
* **Automatización de edificios** → Videoporteros, sistemas de domótica (KNX), bases y mandos inteligentes para el control residencial/terciario. *Usuario: Instalador domótico, integrador.*
* **Climatización** → Dispositivos para control térmico y climatización (termostatos, cronotermostatos). *Usuario: Instalador de clima / calefacción.*
* **Comunicación** → Equipamiento de red, pasarelas de comunicación, bornas de telecomunicaciones y switches. *Usuario: Instalador de telecomunicaciones (ICT).*
* **Fotovoltaica** → Componentes específicos para corriente continua en instalaciones solares (seccionadores CC, descargadores de sobretensión CC, cajas combinadoras). *Usuario: Instalador solar/fotovoltaico.*
* **Iluminación** → Luminarias en general, linternas portátiles y bloques/baterías de alumbrado de emergencia. *Usuario: Instalador electricista, mantenedor.*
* **Robótica** → Brazos robóticos articulados, controladores lógicos y accesorios dedicados para celdas robotizadas. *Usuario: Integrador de robótica, ingeniero industrial.*
* **Vehículos eléctricos** → Cargadores domésticos (wallbox), cargadores rápidos de intemperie y protecciones eléctricas específicas requeridas por la normativa (como diferenciales Tipo B/F). *Usuario: Instalador de puntos de recarga.*

**Regla 3 — Subfamilias: cuándo crear una nueva**
Antes de crear una subfamilia nueva, es obligatorio buscar si alguna de las existentes cubre el caso. Solo se permite crear una subfamilia nueva si:
1. El tipo de producto no tiene ningún equivalente funcional ni semántico entre las subfamilias vigentes.
2. Se prevé que la base de datos contendrá **más de 10 referencias** de ese tipo de producto.
3. El nombre respeta estrictamente el formato **Title Case en español** (ej: `"Interruptor Magnetotérmico"`, **nunca** `"interruptor magnetotérmico"`, ni `"INTERRUPTOR MAGNETOTERMICO"`).

**Regla 4 — Subfamilias Accesorio**
La subfamilia genérica `"Accesorio"` está prohibida. Cualquier accesorio debe estar explícitamente etiquetado bajo el estándar `"Accesorio [NombreFamilia]"` (ej: `"Accesorio Automatización"`, `"Accesorio Instalación"`, etc.) para evitar ambigüedades en los filtros.

**Regla 5 — Nombres de producto**
El campo `name` debe ser limpio, descriptivo y único para cada referencia. 
* Quedan **prohibidos** los nombres que consistan únicamente en el nombre de la marca (ej: `"Schneider Electric"`) o que repitan la misma etiqueta genérica para diferentes referencias (ej: `"CONTACTOR"` para 50 modelos distintos). El formato preferido es `[Tipo de producto] [Gama] [Características clave (polos, corriente, etc.)]`.

**Regla 6 — Imágenes**
Todo nuevo producto insertado debe ir acompañado de una URL de imagen válida. Si en el momento de la inserción no se dispone del enlace estático oficial, el campo `imagen` debe marcarse como `NULL` o cadena vacía y registrarse en la cola del scraper correspondiente para su descarga.

---

### Checklist antes de insertar producto nuevo

- [ ] **Familia:** ¿Está en la lista de las 10 familias permitidas?
- [ ] **Subfamilia:** ¿Existe ya en el listado de subfamilias permitidas o se justifica técnicamente crear una nueva?
- [ ] **Nombre:** ¿El campo `name` es descriptivo y sigue la convención comercial?
- [ ] **Unicidad:** ¿El campo `ref_fabricante` es único en la tabla `products`?
- [ ] **Imagen:** ¿Tiene imagen asignada o se ha quedado marcado como `NULL` para entrar en la cola del scraper?
