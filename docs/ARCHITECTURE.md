# Arquitectura

## Visión general

Aplicación 100% cliente. No hay backend ni llamadas a APIs propias. El único
tráfico externo son los tiles del mapa (OpenStreetMap) y, opcionalmente, las
fuentes.

```
Archivo Excel
   │  (File API, en el móvil)
   ▼
parseExcel.ts ──► Stop[]  ──► StopsContext (useReducer)
                                   │        │
                                   │        └─► db.ts (IndexedDB)  ← persistencia
                                   ▼
                        ┌──────────┴──────────┐
                     MapPage               StopsPage
                   (react-leaflet)        (tabla daisyUI)
                        │
                        └─► StopDetailSheet ─► Google Maps (deep links)
```

## Flujo de datos

1. En `/load-excel` el usuario selecciona un archivo (`<input type="file">`).
2. `loadFile(file)` llama a `parseExcelFile`, que devuelve `{ stops, skippedRows }`.
3. El contexto guarda el `LoadedDataset` (nombre, fecha, ubicaciones, omitidas) y lo
   persiste en IndexedDB.
4. Al arrancar, `StopsProvider` hidrata el estado desde IndexedDB.
5. Las rutas protegidas (`/map`, `/stops`) redirigen a `/load-excel` si no hay
   datos.

## Parseo del Excel

- `listExcelSheets(file)` devuelve los nombres de las pestañas. Si hay más de
  una (caso habitual: 20-30 rutas), se muestran numeradas de 1 a N y el usuario
  elige la suya antes de parsear. Se guarda `routeNumber` y `sheetName`.
- Cada fila es un paquete; las filas con la misma coordenada forman una parada.
- `parseExcelFile(file, sheetName)` procesa la pestaña indicada.
- `sheet_to_json` con `header: 1` para trabajar con filas crudas.
- Se busca la fila de cabecera en las primeras 20 filas (debe contener `Stop` y
  `Latitud`/`Longitud`).
- `HEADER_ALIASES` mapea cada campo a varios nombres normalizados (sin acentos,
  minúsculas, solo alfanuméricos), tolerando erratas.
- Coordenadas: acepta números y texto con coma decimal; descarta filas sin
  lat/lng o fuera de rango.
- `id` de cada parada: `${fila}-${stop}` para garantizar unicidad.

## Mapa
ubicaciones
- `MapView` monta `MapContainer` + `TileLayer` (OSM).
- `FitBounds` usa `useMap()` y `fitBounds` al cambiar las paradas.
- `lib/stops.ts` (`groupStops`) agrupa las filas por coordenada exacta
  (`lat,lng`): cada grupo es una **parada** con un `number` secuencial (1..N) y
  una lista de `packages`. No se agrupan ubicaciones que difieren, solo las
  idénticas.
- La **primera y la última** parada se marcan como `isDepot` (estación de
  salida). Si comparten coordenada quedan en un único grupo.
- `StopMarkers` dibuja un pin por parada: azul con el número secuencial; si tiene
  varios paquetes, badge 📦N; si es depot, piubicaciones con badge 🏠.
- Al pulsar una parada de un solo paquete se abre `StopDetailSheet`; si tiene
  varios (o es depot) se abre `PackagesSheet` con la lista de paquetes.
- `stopCount` (paradas) y `packagesCount` (filas) se derivan en el contexto.

## Persistencia

- Base de datos `rutas-reparto`, store `dataset`, clave `current`.
- Se guarda el `LoadedDataset` completo (las paradas ya parseadas), no el
  binario del Excel.

## PWA

- `vite-plugin-pwa` en modo `generateSW`, `registerType: 'autoUpdate'`.
- Precaché de assets; `navigateFallback` apunta a `index.html` bajo el `base`.
- `404.html` (copia de `index.html` en el build) resuelve deep links en GitHub
  Pages, que no reescribe rutas.
