# CONTEXT — map-app-foryoudelivery

Contexto del proyecto para futuras sesiones de trabajo.

## Qué es

PWA (React + Vite + TypeScript) que lee un Excel de ruta de reparto, procesa las
ubicaciones en el cliente y las muestra en un mapa (Leaflet) con marcadores
numerados en azul. Indica qué paradas tienen ventana horaria y permite abrir
Google Maps por dirección o por coordenadas. **No usa backend**: todo se procesa
y persiste en el dispositivo.

## Stack

- Vite 7 + React 19 + TypeScript 5.9
- React Router 7 (`BrowserRouter`, `basename = import.meta.env.BASE_URL`)
- Estado global con Context + `useReducer` (`src/context/StopsContext.tsx`)
- Mapa: `leaflet` + `react-leaflet` (tiles OpenStreetMap). Las filas con
  coordenadas idénticas se agrupan en una sola **parada** con varios **paquetes**
- Excel: `xlsx` (SheetJS), importado dinámicamente
- Estilos: Tailwind CSS 4 + daisyUI 5
- Persistencia: IndexedDB con `idb`
- PWA: `vite-plugin-pwa` (generateSW, `autoUpdate`)
- Deploy: GitHub Pages vía GitHub Actions

## Comandos

```bash
npm install
npm run dev      # desarrollo
npm run lint     # typecheck (tsc -b)
npm run build    # typecheck + build + 404.html
npm run preview  # sirve dist/
npm run icons    # regenera iconos PWA en public/
```

## Estructura

```
src/
  App.tsx                 # Router + layout + guards
  main.tsx                # Entry + StopsProvider
  index.css               # Tailwind + daisyUI + estilos de marcadores
  context/StopsContext.tsx
  types/stop.ts
  lib/parseExcel.ts       # xlsx -> Stop[]
  lib/stops.ts            # agrupa filas por coordenada -> paradas
  lib/db.ts               # IndexedDB (idb)
  lib/googleMaps.ts       # deep links
  components/             # COMPARTIDOS: AppLayout, BottomNav, RequireData,
                          # EmptyState, ErrorAlert
  pages/
    LoadExcel/            # /load-excel  + components/
    Map/                  # /map         + components/
    Stops/                # /stops       + components/
public/                   # favicon.svg + iconos PWA (generados)
scripts/                  # postbuild.mjs, generate-icons.mjs
docs/                     # documentación y bitácora
.github/workflows/        # deploy a GitHub Pages
```

## Modelo de datos

`Stop` (ver `src/types/stop.ts`): `id, stop, trackingId, timeMin, arrival,
timeWindow, address, postal, signature, customerNotes, lat, lng, place`.

`LoadedDataset` añade `fileName, sheetName, routeNumber, loadedAt, skippedRows`.

**Parada vs paquete**: cada fila del Excel es un paquete. Las filas con la misma
latitud/longitud forman una única parada; una parada puede tener varios paquetes
(se indica con un badge 📦N en el mapa).

Las paradas se numeran **secuencialmente (1..N)** según su orden de aparición,
no por el valor de la columna `Stop` (evita saltos cuando una parada tiene varios
paquetes). La **primera y la última parada** se consideran la **estación de
salida** (`isDepot`) y se muestran con un pin verde y badge 🏠.

El parser normaliza cabeceras (tildes, mayúsculas y erratas como `Addres` /
`Tranckin ID`), detecta la fila de cabecera, valida coordenadas y descarta filas
sin lat/lng válidas, informando cuántas omitió. `listExcelSheets()` devuelve las
pestañas del libro; el usuario elige la ruta (numeradas de 1 a N) antes de
parsear (`parseExcelFile(file, sheetName)`).

## Rutas

- `/` → redirige a `/map` si hay datos, si no a `/load-excel`
- `/load-excel` → selección del archivo y de la pestaña (ruta numerada 1..N) + resumen
- `/map` → mapa con paradas numeradas en azul, badge de paquetes y estación de
  salida en verde (protegida)
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

MVP completo: carga de Excel (selección de pestaña/ruta 1..N), mapa con paradas
y paquetes, detalle, tabla, persistencia y PWA. Ver `docs/PROGRESS.md` para el
detalle y lo pendiente (búsqueda, geolocalización).
