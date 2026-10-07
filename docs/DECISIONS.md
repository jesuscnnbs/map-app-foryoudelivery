# Decisiones

## Sin backend

Los datos son locales. Todo el parseo y renderizado ocurre en el dispositivo, no
hay servidor ni base de datos remota. Reduce coste y complejidad y evita subir
datos de clientes.

## Persistencia con IndexedDB (en vez de localStorage)

`localStorage` está limitado a ~5 MB y bloquea el hilo principal. Una ruta puede
tener cientos de ubicaciones; IndexedDB permite guardar estructuras mayores. Se usa
la librería `idb` por su API basada en promesas.

## `xlsx` con import dinámico

SheetJS pesa bastante. Se carga con `import('xlsx')` dentro de `parseExcelFile`
para que solo se descargue cuando el usuario va a procesar un archivo.

## `BrowserRouter` + `404.html` en GitHub Pages

GitHub Pages no reescribe rutas (devuelve 404). Se copia `index.html` a
`404.html` en el build (`scripts/postbuild.mjs`) y el service worker usa
`navigateFallback`, de modo que las rutas `/map`, `/stops` y `/load-excel`
funcionan en recargas y deep links sin usar `HashRouter`.

## Marcadores con `divIcon` en vez del icono por defecto

El icono por defecto de Leaflet rompe con los bundlers (rutas a imágenes). Se
usa un `divIcon` con HTML propio, que además permite mostrar el número y el
badge de ventana horaria. Los estilos están en `src/index.css`.

## UI en español y mobile-first

El usuario final usa la app desde el móvil durante el reparto. Navegación
inferior y bottom sheet en lugar de popups pequeños.

## Ubicación = coordenada exacta; paquete = fila

Se descartó el clustering por radio (`leaflet.markercluster`): agrupaba
coordenadas cercanas pero distintas, lo que no reflejaba la realidad. En su
lugar, `lib/locations.ts` (`groupLocations`) agrupa únicamente las filas con la
**misma latitud y longitud**: eso es una **ubicación**, y puede contener varios
paquetes. Las ubicaciones con más de un paquete muestran un badge 📦N y, al
pulsarlas, abren `PackagesSheet` con la lista de paquetes. Los marcadores se crean
con `L.marker` + `divIcon` y se integran con react-leaflet mediante `useMap()`.

Se usa "ubicación" (y no "parada") porque una parada puede incluir entregas en
varias ubicaciones; el concepto agrupado es la ubicación.

## Numeración secuencial de ubicaciones (no de paquetes)

El número del marcador es el índice de la ubicación (1..N en orden de aparición),
no el valor de la columna `Stop`. Así, si una ubicación tiene varios paquetes, la
siguiente no salta (1 → 2, no 1 → 4). El valor original de `Stop` se conserva en
la tabla y en el detalle del paquete.

## Primera y última ubicación = estación de salida

Por convención de la ruta, la primera y la última fila son la base (salida y
regreso). `groupLocations` marca como `isDepot` el grupo que contiene la primera
fila y el que contiene la última. Se dibujan en verde con badge 🏠 y, si
comparten coordenada, quedan agrupadas en una sola ubicación. El badge de
paquetes se omite en el depot.

## Selección de ruta numerada (1..N)

El Excel real tiene 20-30 pestañas, una por ruta. `listExcelSheets` obtiene los
nombres y se muestran **numerados de 1 a N** para que el conductor elija el
número de ruta asignado. Se guarda `routeNumber` (y `sheetName` como detalle) en
el dataset.

## Paleta de color estilo Amazon

Se define un tema propio de daisyUI (`amazon`) con los colores de la marca:
naranja `#ff9900`, azul `#146eb4`, negro `#000000`, azul oscuro `#232f3e` y gris
claro `#f2f2f2`. La cabecera usa `#232f3e`; el azul se usa en los marcadores y
botones primarios; el naranja en acentos (ventana horaria, estación de salida,
CTA). El logo es el SVG del camión (`src/assets/`).

## Iconos PWA desde el SVG del logo

Los iconos se generan con `@vite-pwa/assets-generator` a partir del SVG del
camión, integrado en `vite-plugin-pwa` (`pwaAssets`). El plugin genera los PNG
(192/512/maskable), el `favicon.ico` y el `apple-touch-icon` en el build, e
inyecta los enlaces en el `index.html` y los iconos en el manifest. El SVG debe
estar en `public/` (el plugin resuelve las salidas respecto a `publicDir`); un
script `scripts/sync-icons.mjs` lo copia desde `src/assets/` en `prebuild`.

## Mapa offline

- **Caché al navegar**: `workbox.runtimeCaching` cachea los tiles de OpenStreetMap
  (`tile.openstreetmap.org`) con estrategia `CacheFirst` en la caché `map-tiles`.
  Así el mapa no vuelve a pedir tiles ya vistos al hacer zoom o mover.
- **Descarga previa**: `lib/tiles.ts` calcula los tiles del bounding box de la
  ruta (zoom 12-17) y los descarga a la Cache API con progreso y cancelación.
  Los metadatos por ruta se guardan en IndexedDB.
- Se usa un único subdominio (`tile.openstreetmap.org`, sin `{s}`) para que la URL
  cacheada coincida exactamente con la que pide Leaflet.
- OSM desaconseja descargas masivas; se limita el aviso a ~2500 tiles.

## Instalación en el móvil

La PWA ya es instalable (manifest + service worker + HTTPS de GitHub Pages). Se
añade un botón "Instalar app" con `beforeinstallprompt` (Android) e instrucciones
para iOS ("Añadir a pantalla de inicio").

## Sin búsqueda ni filtro (de momento)

Decisión explícita para el MVP. Se añadirán más adelante si el volumen de
ubicaciones lo requiere.

## Deploy en GitHub Pages

Hosting estático gratuito con HTTPS, necesario para que la PWA sea instalable.
Alternativa para publicar en Play Store: empaquetar como TWA con PWABuilder
(requiere cuenta de desarrollador de pago único).
