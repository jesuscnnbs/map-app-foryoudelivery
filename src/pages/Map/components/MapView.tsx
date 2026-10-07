import { useEffect, useMemo } from 'react'
import { latLngBounds } from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { StopGroup } from '../../../lib/stops'
import StopMarkers from './StopMarkers'

interface MapViewProps {
  groups: StopGroup[]
  selectedStopId: string | null
  onSelect: (id: string) => void
  onSelectGroup: (group: StopGroup) => void
}

function FitBounds({ groups, boundsKey }: { groups: StopGroup[]; boundsKey: string }) {
  const map = useMap()

  useEffect(() => {
    if (!boundsKey) return
    const bounds = latLngBounds(
      groups.map((g) => [g.lat, g.lng] as [number, number]),
    )
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    // Solo reajustar cuando cambian las coordenadas, no al seleccionar.
  }, [boundsKey, map])

  return null
}

export default function MapView({
  groups,
  selectedStopId,
  onSelect,
  onSelectGroup,
}: MapViewProps) {
  const center: [number, number] =
    groups.length > 0 ? [groups[0].lat, groups[0].lng] : [40.4168, -3.7038]

  const boundsKey = useMemo(
    () => groups.map((g) => `${g.lat},${g.lng}`).join('|'),
    [groups],
  )

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitBounds groups={groups} boundsKey={boundsKey} />
      <StopMarkers
        groups={groups}
        selectedStopId={selectedStopId}
        onSelect={onSelect}
        onSelectGroup={onSelectGroup}
      />
    </MapContainer>
  )
}
