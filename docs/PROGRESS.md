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
- PWA: `vite-plugin-pwa`, manifest en español, iconos generados con script
  propio (sin dependencias) y `404.html` para SPA en GitHub Pages.
- Workflow de GitHub Actions para desplegar en GitHub Pages en cada push a
  `main`.

### Pendiente / ideas

- Búsqueda y filtro por Stop / Tracking ID / Place.
- Geolocalización y orden por cercanía.
- Cacheo de tiles del mapa para uso offline.

## 2026-10-06 — Selección de ruta (1..N) y parada/paquete

- **Selección de ruta**: el Excel tiene 20-30 pestañas (una por ruta). Se añade
  `listExcelSheets(file)` y `/load-excel` muestra un `SheetPicker` con las rutas
  **numeradas de 1 a N**. El dataset guarda `routeNumber` (y `sheetName` como
  detalle); la cabecera muestra "Ruta N · X paradas · Y paquetes".
- **Parada vs paquete**: se descarta el clustering por radio. `StopMarkers`
  agrupa solo las filas con la **misma coordenada exacta** → una parada. Un
  paquete = una fila. Las paradas con varios paquetes muestran un badge 📦N y al
  pulsarlas ubicacionesPackagesSheet` con la lista de paquetes de esa parada.
- **Contadores**: `stopCount` (paradas, coordenadas únicas) y `packagesCount`
  (filas) derivados en el contexto y mostrados en mapa, cabecera y lista.
- Verificado en navegador headless previamente el flujo de carga multi-pestaña,
  selección de ruta, detalle y enlaces a Google Maps. Sin errores de consola.

### Pendiente / ideas

- Búsqueda y filtro por Stop / Tracking ID / Place.
- Geolocalización y orden por cercanía.
- Cacheo de tiles del mapa para uso offline.
- Recordar la última ruta elegida.

## 2026-10-06 — Numeración por parada y estación de salida

- **Numeración secuencial**: `lib/stops.ts` (`groupStops`) numera las paradas
  1..N por orden de aparición, no por la columna `Stop`. Ya no hay saltos cuando
  una parada tiene varios paquetes (1 → 2, no 1 → 4).
- **Estación de salida**: la primera y la última parada se marcan como `isDepot`
  y se muestran en verde con badge 🏠; si comparten coordenada quedan agrupadas.
  Al pulsarlas se abre `PackagesSheet` con la etiqueta "Estación de salida".
- Verificado en navegador headless con 25 filas (22 en una parada): marcadores
  1,2,3,4, 2 depots detectados, sheet de salida con 22 registros. Sin errores de
  consola.

### Pendiente / ideas

- Búsqueda y filtro por Stop / Tracking ID / Place.
- Geolocalización y orden por cercanía.
- Cacheo de tiles del mapa para uso offline.
- Recordar la última ruta elegida.
