# Arquitectura

## Visión general

Aplicación 100% cliente. No hay backend ni llamadas a APIs propias. El único
tráfico externo son los tiles del mapa (OpenStreetMap).

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
2. Si hay varias pestañas, elige la ruta (1..N); `parseExcelFile` devuelve
   `{ stops, skippedRows }`.
3. El contexto guarda el `LoadedDataset` (nombre, pestaña, ruta, fecha, filas,
   omitidas) y lo persiste en IndexedDB.
4. Al arrancar, `StopsProvider` hidrata el estado desde IndexedDB.
5. Las rutas protegidas (`/map`, `/stops`) redirigen a `/load-excel` si no hay
   datos.

## Parseo del Excel

- `listExcelSheets(file)` devuelve los nombres de las pestañas. Si hay más de
  una (caso habitual: 20-30 rutas), se muestran numeradas de 1 a N y el usuario
  elige la suya antes de parsear. Se guarda `routeNumber` y `sheetName`.
- Cada fila es un paquete; las filas con la misma coordenada forman una
  **ubicación**.
- `parseExcelFile(file, sheetName)` procesa la pestaña indicada.
- `sheet_to_json` con `header: 1` para trabajar con filas crudas.
- Se busca la fila de cabecera en las primeras 20 filas (debe contener `Stop` y
  `Latitud`/`Longitud`).
- `HEADER_ALIASES` mapea cada campo a varios nombres normalizados (sin acentos,
  minúsculas, solo alfanuméricos), tolerando erratas.
- Coordenadas: acepta números y texto con coma decimal; descarta filas sin
  lat/lng o fuera de rango.
- `id` de cada fila: `${fila}-${stop}` para garantizar unicidad.

## Mapa

- `MapView` monta `MapContainer` + `TileLayer` (OSM, sin subdominio `{s}` para
  que las URLs coincidan con las cacheadas).
- `FitBounds` usa `useMap()` y `fitBounds` cuando cambian las coordenadas (no al
  seleccionar, para no resetear el zoom).
- `lib/locations.ts` (`groupLocations`) agrupa las filas por coordenada exacta
  (`lat,lng`): cada grupo es una **ubicación** con un `number` secuencial (1..N) y
  una lista de `packages`. No se agrupan coordenadas que difieren.
- La **primera y la última** ubicación se marcan como `isDepot` (estación de
  salida). Si comparten coordenada quedan en un único grupo.
- `LocationMarkers` dibuja un pin por ubicación: azul con el número secuencial;
  si tiene varios paquetes, badge 📦N; si es depot, pin naranja con badge 🏠.
- Al pulsar una ubicación de un solo paquete se abre `StopDetailSheet`; si tiene
  varios (o es depot) se abre `PackagesSheet` con la lista de paquetes.
- `locationCount` (ubicaciones) y `packagesCount` (filas) se derivan en el
  contexto.

## Mapa offline

- `workbox.runtimeCaching` cachea los tiles de `tile.openstreetmap.org` con
  `CacheFirst` en la caché `map-tiles` (`ExpirationPlugin`, `cacheableResponse`).
- `lib/tiles.ts`: cálculo de tiles por bounding box (Web Mercator) y descarga con
  concurrencia limitada, progreso y cancelación a la Cache API `map-tiles`.
- `OfflineMapButton` (en `/map`) lanza la descarga (zoom 12-17) y guarda los
  metadatos por ruta en IndexedDB (store `mapCache`).

## Persistencia

- Base de datos `rutas-reparto`:
  - store `dataset`, clave `current`: el `LoadedDataset` completo (filas ya
    parseadas), no el binario del Excel.
  - store `mapCache`: metadatos del mapa offline por ruta.

## PWA e instalación

- `vite-plugin-pwa` en modo `generateSW`, `registerType: 'autoUpdate'`.
- `pwaAssets` genera los iconos desde el SVG del camión e inyecta los enlaces en
  el `index.html` y los iconos en el manifest.
- Precaché de assets; `navigateFallback` apunta a `index.html` bajo el `base`.
- `404.html` (copia de `index.html` en el build) resuelve deep links en GitHub
  Pages, que no reescribe rutas.
- `useOnlineStatus` (banner de conexión) y `useInstallPrompt` (botón "Instalar
  app" + instrucciones iOS).
