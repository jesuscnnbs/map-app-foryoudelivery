# Bitácora de avances

Registro cronológico de lo implementado. Añadir una entrada al cerrar cada
bloque de trabajo.

## 2026-10-06 — MVP inicial

- Scaffold del proyecto: Vite + React 19 + TypeScript, Tailwind CSS 4 + daisyUI 5.
- `base` de Vite configurado a `/map-app-foryoudelivery/` para GitHub Pages.
- Tipos `Stop`, `LoadedDataset`, `ParseResult` (`src/types/stop.ts`).
- `lib/parseExcel.ts`: lectura de `.xlsx/.xls/.csv`, normalización de cabeceras
  (tildes, mayúsculas, erratas `Addres` / `Tranckin ID`), detección de la fila
  de cabecera, validación de coordenadas y conteo de filas omitidas. `xlsx` se
  carga con `import()` dinámico para no engordar el bundle inicial.
- `lib/db.ts`: persistencia en IndexedDB con `idb` (guardar/cargar/borrar).
- `lib/googleMaps.ts`: deep links por dirección, por coordenadas y vista.
- `StopsContext`: `useReducer` + hidratación desde IndexedDB + `loadFile`,
  `clear`, `selectStop`.
- Layout compartido: `AppLayout`, `BottomNav` (Mapa / Lista / Cargar),
  `RequireData`, `EmptyState`, `ErrorAlert`.
- Página `/load-excel` con `FilePicker` y `ColumnsInfo`; al procesar redirige a
  `/map`.
- Página `/map`: Leaflet + OpenStreetMap, marcadores azules numerados con badge
  🕒 si hay ventana horaria, ajuste automático de bounds.
- `StopDetailSheet`: bottom sheet con todos los campos y botones a Google Maps.
- Página `/stops`: tabla con las 12 columnas; tocar una fila abre el detalle.
- PWA: `vite-plugin-pwa`, manifest en español y `404.html` para SPA en GitHub
  Pages.
- Workflow de GitHub Actions para desplegar en GitHub Pages en cada push a
  `main`.

## 2026-10-06 — Selección de ruta (1..N) y ubicación/paquete

- **Selección de ruta**: el Excel tiene 20-30 pestañas (una por ruta). Se añade
  `listExcelSheets(file)` y `/load-excel` muestra un `SheetPicker` con las rutas
  **numeradas de 1 a N**. El dataset guarda `routeNumber` (y `sheetName` como
  detalle).
- **Ubicación vs paquete**: se descarta el clustering por radio. `LocationMarkers`
  agrupa solo las filas con la **misma coordenada exacta** → una ubicación. Un
  paquete = una fila. Las ubicaciones con varios paquetes muestran un badge 📦N y
  al pulsarlas abren `PackagesSheet` con la lista de paquetes de esa ubicación.
- **Contadores**: `locationCount` (ubicaciones, coordenadas únicas) y
  `packagesCount` (filas) derivados en el contexto y mostrados en mapa, cabecera
  y lista.

## 2026-10-06 — Numeración por ubicación y estación de salida

- **Numeración secuencial**: `lib/locations.ts` (`groupLocations`) numera las
  ubicaciones 1..N por orden de aparición, no por la columna `Stop`. Ya no hay
  saltos cuando una ubicación tiene varios paquetes (1 → 2, no 1 → 4).
- **Estación de salida**: la primera y la última ubicación se marcan como
  `isDepot` y se muestran en verde con badge 🏠; si comparten coordenada quedan
  agrupadas. Al pulsarlas se abre `PackagesSheet` con la etiqueta "Estación de
  salida".
- Verificado en navegador headless con 25 filas (22 en una ubicación): marcadores
  1,2,3,4, 2 depots detectados, sheet de salida con 22 registros. Sin errores de
  consola.

## 2026-10-07 — Identidad visual y logo

- **Paleta Amazon** en un tema propio de daisyUI (`amazon`): naranja `#ff9900`,
  azul `#146eb4`, azul oscuro `#232f3e`, gris claro `#f2f2f2`, negro `#000000`.
  Cabecera en `#232f3e`, marcadores y primarios en azul, acentos en naranja.
- **Logo**: SVG del camión (`src/assets/delivery-truck-truck-svgrepo-com.svg`)
  usado en cabecera y en la pantalla de carga.
- **Iconos PWA**: generados desde el SVG con `@vite-pwa/assets-generator`
  integrado en `vite-plugin-pwa` (`pwaAssets`). El SVG se limpia (se elimina el
  `transform` del nodo raíz que lo dejaba en blanco al rasterizar) y
  `scripts/sync-icons.mjs` lo copia a `public/` en `prebuild`.

## 2026-10-07 — Uso sin conexión e instalación

- **Caché de tiles**: `workbox.runtimeCaching` cachea los tiles de OSM
  (`tile.openstreetmap.org`) con `CacheFirst` en `map-tiles`; al hacer zoom o
  mover el mapa no se vuelven a pedir los tiles ya vistos.
- **Descarga previa de la ruta**: `lib/tiles.ts` calcula y descarga los tiles del
  bounding box (zoom 12-17) con progreso y cancelación; botón en `/map`
  (`OfflineMapButton`) y estado "Mapa offline listo" persistido en IndexedDB.
- **Instalación**: botón "Instalar app" (`beforeinstallprompt`) e instrucciones
  para iOS (`InstallPrompt`).
- **Indicador offline**: banner en `AppLayout` con `useOnlineStatus`.
- **Renombrado**: el concepto "parada" pasa a "ubicación" en toda la UI y el
  código (`LocationGroup`, `groupLocations`, `locationGroups`, `locationCount`).

## 2026-10-07 — Detalle de paquete más claro

- En el detalle de un paquete se muestra el **número de la ubicación** (círculo)
  seguido del **número de paquete** ("Paquete N"), en lugar de mostrar el valor
  de la columna `Stop` como número principal (evita confusión al pulsar una
  burbuja: ubicación 117 → paquete 130).
- Se deja de mostrar el valor de la columna **`Place`** en las hojas de detalle
  (ubicación y paquete); se usa la dirección como subtítulo.
- `findLocationByStop` en `lib/locations.ts` para obtener la ubicación de un
  paquete.

### Pendiente / ideas

- Búsqueda y filtro por Stop / Tracking ID / Place.
- Geolocalización y orden por cercanía.
- Recordar la última ruta elegida.
- Proveedor de tiles con plan offline para producción (OSM desaconseja descargas
  masivas).
