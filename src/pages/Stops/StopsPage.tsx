import { useStops } from '../../context/StopsContext'
import StopDetailSheet from '../Map/components/StopDetailSheet'
import StopsTable from './components/StopsTable'

export default function StopsPage() {
  const { stops, dataset, selectedStop, selectStop, locationCount, packagesCount } =
    useStops()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 bg-base-100 px-4 py-2 text-xs">
        <span className="font-medium">
          {locationCount} ubicaciones · {packagesCount} paquetes
        </span>
        {dataset && dataset.skippedRows > 0 && (
          <span className="text-warning">
            {dataset.skippedRows} fila(s) omitida(s)
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <StopsTable
          stops={stops}
          selectedStopId={selectedStop?.id ?? null}
          onSelect={selectStop}
        />
      </div>

      {selectedStop && (
        <StopDetailSheet stop={selectedStop} onClose={() => selectStop(null)} />
      )}
    </div>
  )
}
