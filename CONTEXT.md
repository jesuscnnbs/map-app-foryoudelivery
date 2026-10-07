# CONTEXT — map-app-foryoudelivery

Contexto del proyecto para futuras sesiones de trabajo.

## Qué es

PWA (React + Vite + TypeScript) que lee un Excel de ruta de reparto, procesa las
ubicaciones en el cliente y las muestra en un mapa (Leaflet) con marcadores
numerados en azul. Indica qué ubicaciones tienen ventana horaria y permite abrir
Google Maps por dirección o por coordenadas. Funciona **sin conexión** (mapa
cacheado) y es **instalable** en el móvil. **No usa backend**: todo se procesa y
persiste en el dispositivo.

## Stack

- Vite 7 + React 19 + TypeScript 5.9
- React Router 7 (`BrowserRouter`, `basename = import.meta.env.BASE_URL`)
- Estado global con Context + `useReducer` (`src/context/StopsContext.tsx`)
- Mapa: `leaflet` + `react-leaflet` (tiles OpenStreetMap). Las filas con
  coordenadas idénticas se agrupan en una sola **ubicación** con varios
  **paquetes**
- Excel: `xlsx` (SheetJS), importado dinámicamente
- Estilos: Tailwind CSS 4 + daisyUI 5 (tema propio `amazon`)
- Persistencia: IndexedDB con `idb`
- PWA: `vite-plugin-pwa` (generateSW, `autoUpdate`) + `@vite-pwa/assets-generator`
- Deploy: GitHub Pages vía GitHub Actions

## Paleta (Amazon)

`#ff9900` (naranja) · `#146eb4` (azul) · `#000000` · `#232f3e` (azul oscuro) ·
`#f2f2f2` (gris claro). Cabecera en `#232f3e`, marcadores y primarios en azul,
acentos en naranja. Logo: `src/assets/delivery-truck-truck-svgrepo-com.svg`.

## Comandos

```bash
npm install
npm run dev      # desarrollo (--host)
npm run lint     # typecheck (tsc -b)
npm run build    # sync-iconos + typecheck + build + 404.html
npm run preview  # sirve dist/
npm run icons    # regenera iconos PWA desde el SVG
```

## Estructura

```
src/
  App.tsx                 # Router + layout + guards
  main.tsx                # Entry + StopsProvider
  index.css               # Tailwind + daisyUI (tema amazon) + marcadores
  context/StopsContext.tsx
  types/stop.ts
  hooks/                  # useOnlineStatus, useInstallPrompt
  lib/parseExcel.ts       # xlsx -> Stop[]
  lib/locations.ts        # agrupa filas por coordenada -> ubicaciones
  lib/tiles.ts            # tiles OSM offline (cálculo + descarga)
  lib/db.ts               # IndexedDB (idb)
  lib/googleMaps.ts       # deep links
  components/             # COMPARTIDOS: AppLayout, BottomNav, RequireData,
                          # EmptyState, ErrorAlert, InstallPrompt
  pages/
    LoadExcel/            # /load-excel  + components/
    Map/                  # /map         + components/
    Stops/                # /stops       + components/
public/                   # SVG del logo (generado) + iconos PWA (generados)
scripts/                  # postbuild.mjs, sync-icons.mjs
docs/                     # documentación y bitácora
.github/workflows/        # deploy a GitHub Pages
```

## Modelo de datos

`Stop` (ver `src/types/stop.ts`): `id, stop, trackingId, timeMin, arrival,
timeWindow, address, postal, signature, customerNotes, lat, lng, place`.

`LoadedDataset` añade `fileName, sheetName, routeNumber, loadedAt, skippedRows`.

**Ubicación vs paquete**: cada fila del Excel es un paquete. Las filas con la
misma latitud/longitud forman una única **ubicación**; una ubicación puede tener
varios paquetes (se indica con un badge 📦N en el mapa).

Las ubicaciones se numeran **secuencialmente (1..N)** según su orden de aparición,
no por el valor de la columna `Stop` (evita saltos cuando una ubicación tiene
varios paquetes). La **primera y la última ubicación** se consideran la **estación
de salida** (`isDepot`) y se muestran con un pin naranja y badge 🏠.

El parser normaliza cabeceras (tildes, mayúsculas y erratas como `Addres` /
`Tranckin ID`), detecta la fila de cabecera, valida coordenadas y descarta filas
sin lat/lng válidas, informando cuántas omitió. `listExcelSheets()` devuelve las
pestañas del libro; el usuario elige la ruta (numeradas de 1 a N) antes de
parsear (`parseExcelFile(file, sheetName)`).

## Offline e instalación

- Tiles de OSM cacheados con `workbox.runtimeCaching` (`CacheFirst`, caché
  `map-tiles`). Botón "Descargar mapa offline" en `/map` (zoom 12-17) con
  `lib/tiles.ts`; metadatos por ruta en IndexedDB (store `mapCache`).
- App shell precacheado por el service worker; dataset restaurado desde IndexedDB.
- `InstallPrompt` (botón Android / instrucciones iOS) y banner de conexión
  (`useOnlineStatus`).

## Rutas

- `/` → redirige a `/map` si hay datos, si no a `/load-excel`
- `/load-excel` → selección del archivo y de la pestaña (ruta numerada 1..N) + resumen
- `/map` → mapa con ubicaciones numeradas en azul, badge de paquetes y estación
  de salida en naranja (protegida)
- `/stops` → tabla con toda la información del Excel (protegida)

## Convenciones

- UI en **español**.
- Diseño **mobile-first**; bottom nav + bottom sheet (no popups pequeños).
- Sin comentarios en el código salvo que aporten contexto no evidente.
- Una page = una carpeta con su subcarpeta `components/`.
- Componentes compartidos en `src/components/`.

## Decisiones clave

Ver `docs/DECISIONS.md`.

## Estado actual

MVP completo: carga de Excel (selección de pestaña/ruta 1..N), mapa con
ubicaciones y paquetes, detalle, tabla, persistencia, mapa offline, instalación y
PWA. Ver `docs/PROGRESS.md` para el detalle y lo pendiente (búsqueda,
geolocalización).
