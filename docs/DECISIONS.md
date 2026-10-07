# Decisiones

## Sin backend

Los datos son locales. Todo el parseo y renderizado ocurre en el dispositivo, no
hay servidor ni base de datos remota. Reduce coste y complejidad y evita subir
datos de clientes.

## Persistencia con IndexedDB (en vez de localStorage)

`localStorage` está limitado a ~5 MB y bloquea el hilo principal. Una ruta puede
tener cientos de paradas; IndexedDB permite guardar estructuras mayores. Se usa
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

## Parada = coordenada exacta; paquete = fila

Se descartó el clustering por radio (`leaflet.markercluster`): agrupaba
ubicaciones cercanas pero distintas, lo que no reflejaba la realidad. En su
lugar, `lib/stops.ts` (`groupStops`) agrupa únicamente las filas con la **misma
latitud y longitud**: eso es una parada, y puede contener varios paquetes. Las
paradas con más de un paquete muestran un badge 📦N y, al pulsarlas, abren
`PackagesSheet` con la lista de paquetes. Los marcadores se crean con `L.marker`
+ `divIcon` y se integran con react-leaflet mediante `useMap()`.

## Numeración secuencial de paradas (no de paquetes)

El número del marcador es el índice de la parada (1..N en orden de aparición),
no el valor de la columna `Stop`. Así, si una parada tiene varios paquetes, la
siguiente no salta (1 → 2, no 1 → 4). El valor original de `Stop` se conserva en
la tabla y en el detalle del paquete.

## Primera y última parada = estación de salida

Por convención de la ruta, la primera y la última fila son la base (salida y
regreso). `groupStops` marca como `isDepot` el grupo que contiene la primera fila
y el que contiene la última. Se dibujan en verde con badge 🏠 y, si comparten
coordenada, quedan agrupados en una sola parada. El badge de paquetes se omite en
el depot.

## Selección de ruta numerada (1..N)

El Excel real tiene 20-30 pestañas, una por ruta. `listExcelSheets` obtiene los
nombres y se muestran **numerados de 1 a N** para que el conductor elija el
número de ruta asignado. Se guarda `routeNumber` (y `sheetName` como detalle) en
el dataset.

## Sin búsqueda ni filtro (de momento)

Decisión explícita para el MVP. Se añadirán más adelante si el volumen de
paradas lo requiere.

## Iconos PWA generados con script propio

Para no añadir dependencias pesadas (sharp, assets-generator) se genera un icono
placeholder PNG (fondo azul + diana blanca) con un script en Node
(`scripts/generate-icons.mjs`). Se puede sustituir por un icono real más
adelante.

## Deploy en GitHub Pages

Hosting estático gratuito con HTTPS, necesario para que la PWA sea instalable.
Alternativa para publicar en Play Store: empaquetar como TWA con PWABuilder
(requiere cuenta de desarrollador de pago único).
