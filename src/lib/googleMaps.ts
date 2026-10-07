import type { Stop } from '../types/stop'

export function googleMapsByCoordinates(stop: Pick<Stop, 'lat' | 'lng'>): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`
}

export function googleMapsByAddress(
  stop: Pick<Stop, 'address' | 'postal' | 'place'>,
): string {
  const parts = [stop.address, stop.postal, stop.place].filter(Boolean)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    parts.join(', '),
  )}`
}

export function googleMapsView(stop: Pick<Stop, 'lat' | 'lng'>): string {
  return `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`
}
