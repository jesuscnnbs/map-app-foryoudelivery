import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadMapCache, saveMapCache } from '../../../lib/db'
import {
  MAX_TILES,
  downloadTiles,
  estimateTileCount,
  type OfflineMapMeta,
  type TileBounds,
} from '../../../lib/tiles'

interface OfflineMapButtonProps {
  bounds: TileBounds | null
  routeKey: string
  online: boolean
}

const MIN_ZOOM = 12
const MAX_ZOOM = 17

export default function OfflineMapButton({
  bounds,
  routeKey,
  online,
}: OfflineMapButtonProps) {
  const [meta, setMeta] = useState<OfflineMapMeta | null>(null)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'error'>('idle')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const abortRef = useRef<AbortController | null>(null)

  const supported = typeof caches !== 'undefined'

  useEffect(() => {
    let active = true
    loadMapCache(routeKey).then((value) => {
      if (active) setMeta(value)
    })
    return () => {
      active = false
    }
  }, [routeKey])

  const estimate = useMemo(
    () => (bounds ? estimateTileCount(bounds, MIN_ZOOM, MAX_ZOOM) : 0),
    [bounds],
  )

  const start = useCallback(async () => {
    if (!bounds) return
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('downloading')
    setProgress({ done: 0, total: estimate })
    try {
      const result = await downloadTiles(bounds, {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      })
      if (result.aborted) {
        setStatus('idle')
        return
      }
      const value: OfflineMapMeta = {
        routeKey,
        ...bounds,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        tileCount: result.downloaded,
        downloadedAt: Date.now(),
      }
      await saveMapCache(value)
      setMeta(value)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }, [bounds, estimate, routeKey])

  if (!supported || !bounds) return null

  if (status === 'downloading') {
    const percent =
      progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
    return (
      <div className="absolute inset-x-3 bottom-3 z-[600] rounded-xl bg-base-100/95 p-3 shadow-lg">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium">Descargando mapa…</span>
          <span className="text-base-content/60">
            {progress.done}/{progress.total}
          </span>
        </div>
        <progress className="progress progress-primary w-full" value={percent} max={100} />
        <button
          type="button"
          className="btn btn-ghost btn-xs mt-1 w-full"
          onClick={() => abortRef.current?.abort()}
        >
          Cancelar
        </button>
      </div>
    )
  }

  if (meta) {
    return (
      <div className="absolute inset-x-3 bottom-3 z-[600] flex items-center justify-between gap-2 rounded-xl bg-base-100/95 px-3 py-2 text-xs shadow-lg">
        <span className="flex items-center gap-1 font-medium text-success">
          ✅ Mapa offline listo
          <span className="text-base-content/50">({meta.tileCount} tiles)</span>
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          disabled={!online}
          onClick={start}
        >
          Actualizar
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-3 bottom-3 z-[600] flex items-center justify-between gap-2 rounded-xl bg-base-100/95 px-3 py-2 text-xs shadow-lg">
      <span className={estimate > MAX_TILES ? 'text-warning' : 'text-base-content/70'}>
        {status === 'error'
          ? 'Error al descargar el mapa.'
          : estimate > MAX_TILES
            ? `Ruta muy extensa (~${estimate} tiles). La descarga puede tardar.`
            : `Descarga el mapa para usarlo sin conexión (~${estimate} tiles)`}
      </span>
      <button
        type="button"
        className="btn btn-primary btn-xs shrink-0"
        disabled={!online}
        onClick={start}
      >
        {online ? 'Descargar' : 'Sin conexión'}
      </button>
    </div>
  )
}
