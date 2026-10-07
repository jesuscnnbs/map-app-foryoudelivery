import { useCallback, useState } from 'react'
import { useStops } from '../../context/StopsContext'
import type { StopGroup } from '../../lib/stops'
import MapView from './components/MapView'
import PackagesSheet from './components/PackagesSheet'
import StopDetailSheet from './components/StopDetailSheet'

export default function MapPage() {
  const { stopGroups, selectedStop, selectStop, stopCount, packagesCount } =
    useStops()
  const [selectedGroup, setSelectedGroup] = useState<StopGroup | null>(null)

  const handleSelectGroup = useCallback((group: StopGroup) => {
    setSelectedGroup(group)
  }, [])

  return (
    <div className="relative h-full w-full">
      <MapView
        groups={stopGroups}
        selectedStopId={selectedStop?.id ?? null}
        onSelect={selectStop}
        onSelectGroup={handleSelectGroup}
      />

      <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-base-100/95 px-3 py-2 text-xs shadow">
        <p className="font-medium">
          {stopCount} paradas · {packagesCount} paquetes
        </p>
        <p className="text-base-content/60">
          🏠 salida · 📦 varios paquetes · 🕒 ventana horaria
        </p>
      </div>

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
