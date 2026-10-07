import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { LocationGroup } from '../../../lib/locations'

interface LocationMarkersProps {
  groups: LocationGroup[]
  selectedStopId: string | null
  onSelect: (id: string) => void
  onSelectGroup: (group: LocationGroup) => void
}

function labelSize(number: number): number {
  if (number >= 100) return 10
  if (number >= 10) return 11
  return 12
}

function buildIcon(group: LocationGroup, active: boolean) {
  const packages = group.packages.length
  const classes = ['stop-marker']
  if (active) classes.push('stop-marker--active')
  if (group.isDepot) classes.push('stop-marker--depot')
  if (packages > 1 && !group.isDepot) classes.push('stop-marker--multi')

  const badges: string[] = []
  if (group.hasTimeWindow) {
    badges.push('<span class="stop-marker__window" title="Tiene ventana horaria">🕒</span>')
  }
  if (group.isDepot) {
    badges.push('<span class="stop-marker__depot" title="Estación de salida">🏠</span>')
  } else if (packages > 1) {
    badges.push(
      `<span class="stop-marker__packages" title="${packages} paquetes en esta ubicación">📦${packages}</span>`,
    )
  }

  return L.divIcon({
    className: classes.join(' '),
    html: `
      <div class="stop-marker__pin">
        <span class="stop-marker__label" style="font-size:${labelSize(group.number)}px">${group.number}</span>
      </div>
      ${badges.join('')}
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

function groupOfStop(
  groups: LocationGroup[],
  stopId: string | null,
): LocationGroup | null {
  if (!stopId) return null
  return groups.find((group) => group.packages.some((stop) => stop.id === stopId)) ?? null
}

export default function LocationMarkers({
  groups,
  selectedStopId,
  onSelect,
  onSelectGroup,
}: LocationMarkersProps) {
  const map = useMap()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const groupsRef = useRef<LocationGroup[]>([])
  const prevSelectedRef = useRef<string | null>(null)

  useEffect(() => {
    const layer = L.layerGroup()
    const markers = new Map<string, L.Marker>()

    groups.forEach((group) => {
      const marker = L.marker([group.lat, group.lng], {
        icon: buildIcon(group, group.packages.some((s) => s.id === selectedStopId)),
      })
      if (group.packages.length === 1) {
        marker.on('click', () => onSelect(group.packages[0].id))
      } else {
        marker.on('click', () => onSelectGroup(group))
      }
      markers.set(group.key, marker)
      layer.addLayer(marker)
    })

    map.addLayer(layer)
    markersRef.current = markers
    groupsRef.current = groups
    prevSelectedRef.current = selectedStopId

    return () => {
      map.removeLayer(layer)
      markersRef.current = new Map()
    }
  }, [groups, map, onSelect, onSelectGroup])

  useEffect(() => {
    if (prevSelectedRef.current === selectedStopId) return
    const previous = groupOfStop(groupsRef.current, prevSelectedRef.current)
    if (previous) markersRef.current.get(previous.key)?.setIcon(buildIcon(previous, false))
    const current = groupOfStop(groupsRef.current, selectedStopId)
    if (current) markersRef.current.get(current.key)?.setIcon(buildIcon(current, true))
    prevSelectedRef.current = selectedStopId
  }, [selectedStopId])

  return null
}
