import type { Stop } from '../types/stop'

export interface LocationGroup {
  key: string
  number: number
  lat: number
  lng: number
  packages: Stop[]
  isDepot: boolean
  hasTimeWindow: boolean
}

export function coordinateKey(stop: Pick<Stop, 'lat' | 'lng'>): string {
  return `${stop.lat},${stop.lng}`
}

export function findLocationByStop(
  groups: LocationGroup[],
  stopId: string | null,
): LocationGroup | null {
  if (!stopId) return null
  return groups.find((group) => group.packages.some((stop) => stop.id === stopId)) ?? null
}

export function groupLocations(stops: Stop[]): LocationGroup[] {
  const map = new Map<string, LocationGroup>()

  stops.forEach((stop) => {
    const key = coordinateKey(stop)
    let group = map.get(key)
    if (!group) {
      group = {
        key,
        number: 0,
        lat: stop.lat,
        lng: stop.lng,
        packages: [],
        isDepot: false,
        hasTimeWindow: false,
      }
      map.set(key, group)
    }
    group.packages.push(stop)
    if (stop.timeWindow.trim()) group.hasTimeWindow = true
  })

  const groups = Array.from(map.values())
  groups.forEach((group, index) => {
    group.number = index + 1
  })

  if (groups.length > 0) {
    const firstKey = coordinateKey(stops[0])
    const lastKey = coordinateKey(stops[stops.length - 1])
    groups.forEach((group) => {
      if (group.key === firstKey || group.key === lastKey) group.isDepot = true
    })
  }

  return groups
}
