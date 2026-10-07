export interface TileBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface OfflineMapMeta extends TileBounds {
  routeKey: string
  minZoom: number
  maxZoom: number
  tileCount: number
  downloadedAt: number
}

export const TILE_CACHE_NAME = 'map-tiles'
export const MAX_TILES = 2500
const TILE_URL = 'https://tile.openstreetmap.org'

function lonToTileX(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom)
}

function latToTileY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom,
  )
}

export function boundsFromPoints(
  points: { lat: number; lng: number }[],
): TileBounds | null {
  if (points.length === 0) return null
  let north = -Infinity
  let south = Infinity
  let east = -Infinity
  let west = Infinity
  for (const point of points) {
    north = Math.max(north, point.lat)
    south = Math.min(south, point.lat)
    east = Math.max(east, point.lng)
    west = Math.min(west, point.lng)
  }
  return { north, south, east, west }
}

export function tileUrls(
  bounds: TileBounds,
  minZoom: number,
  maxZoom: number,
): string[] {
  const urls: string[] = []
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const max = 2 ** zoom - 1
    const minX = Math.max(0, lonToTileX(bounds.west, zoom))
    const maxX = Math.min(max, lonToTileX(bounds.east, zoom))
    const minY = Math.max(0, latToTileY(bounds.north, zoom))
    const maxY = Math.min(max, latToTileY(bounds.south, zoom))
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        urls.push(`${TILE_URL}/${zoom}/${x}/${y}.png`)
      }
    }
  }
  return urls
}

export function estimateTileCount(
  bounds: TileBounds,
  minZoom: number,
  maxZoom: number,
): number {
  return tileUrls(bounds, minZoom, maxZoom).length
}

export interface DownloadOptions {
  minZoom: number
  maxZoom: number
  concurrency?: number
  signal?: AbortSignal
  onProgress?: (done: number, total: number) => void
}

export interface DownloadResult {
  total: number
  downloaded: number
  failed: number
  aborted: boolean
}

export async function downloadTiles(
  bounds: TileBounds,
  options: DownloadOptions,
): Promise<DownloadResult> {
  const urls = tileUrls(bounds, options.minZoom, options.maxZoom)
  const total = urls.length
  const concurrency = options.concurrency ?? 6
  const cache = await caches.open(TILE_CACHE_NAME)

  let downloaded = 0
  let failed = 0
  let index = 0
  let aborted = false

  async function worker() {
    while (index < total) {
      if (options.signal?.aborted) {
        aborted = true
        return
      }
      const current = index++
      const url = urls[current]
      try {
        const existing = await cache.match(url)
        if (!existing) {
          const response = await fetch(url, { mode: 'cors' })
          if (response.ok) {
            await cache.put(url, response.clone())
            downloaded += 1
          } else {
            failed += 1
          }
        } else {
          downloaded += 1
        }
      } catch {
        failed += 1
      }
      options.onProgress?.(downloaded + failed, total)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  return { total, downloaded, failed, aborted }
}
