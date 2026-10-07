import { useCallback, useMemo, useState } from 'react'
import { useStops } from '../../context/StopsContext'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import type { LocationGroup } from '../../lib/locations'
import { boundsFromPoints } from '../../lib/tiles'
import MapView from './components/MapView'
import OfflineMapButton from './components/OfflineMapButton'
import PackagesSheet from './components/PackagesSheet'
import StopDetailSheet from './components/StopDetailSheet'

export default function MapPage() {
  const { locationGroups, selectedStop, selectStop, locationCount, packagesCount, dataset } =
    useStops()
  const online = useOnlineStatus()
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null)

  const handleSelectGroup = useCallback((group: LocationGroup) => {
    setSelectedGroup(group)
  }, [])

  const bounds = useMemo(() => boundsFromPoints(locationGroups), [locationGroups])
  const routeKey = dataset ? `${dataset.fileName}::${dataset.sheetName}` : ''

  return (
    <div className="relative h-full w-full">
      <MapView
        groups={locationGroups}
        selectedStopId={selectedStop?.id ?? null}
        onSelect={selectStop}
        onSelectGroup={handleSelectGroup}
      />

      <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-base-100/95 px-3 py-2 text-xs shadow">
        <p className="font-medium">
          {locationCount} ubicaciones · {packagesCount} paquetes
        </p>
        <p className="text-base-content/60">
          🏠 salida · 📦 varios paquetes · 🕒 ventana horaria
        </p>
      </div>

      <OfflineMapButton bounds={bounds} routeKey={routeKey} online={online} />

      {selectedGroup && (
        <PackagesSheet
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onPick={(stop) => {
            setSelectedGroup(null)
            selectStop(stop.id)
          }}
        />
      )}

      {selectedStop && (
        <StopDetailSheet stop={selectedStop} onClose={() => selectStop(null)} />
      )}
    </div>
  )
}
