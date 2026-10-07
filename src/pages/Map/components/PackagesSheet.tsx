import type { LocationGroup } from '../../../lib/locations'
import type { Stop } from '../../../types/stop'

interface PackagesSheetProps {
  group: LocationGroup
  onClose: () => void
  onPick: (stop: Stop) => void
}

export default function PackagesSheet({ group, onClose, onPick }: PackagesSheetProps) {
  const title = group.isDepot
    ? 'Estación de salida'
    : `${group.packages.length} paquetes en esta ubicación`

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-base-100 shadow-xl"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-base-200 bg-base-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                group.isDepot ? 'bg-success' : 'bg-primary'
              }`}
            >
              {group.isDepot ? '🏠' : group.number}
            </span>
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-xs text-base-content/60">
                {group.packages[0].place || group.packages[0].address}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <ul className="divide-y divide-base-200">
          {group.packages.map((stop) => (
            <li key={stop.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => onPick(stop)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {stop.stop}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {stop.address || `Ubicación ${stop.stop}`}
                  </span>
                  <span className="block truncate text-xs text-base-content/60">
                    {stop.trackingId && `${stop.trackingId} · `}
                    {stop.arrival || 'Sin hora'}
                  </span>
                </span>
                {stop.timeWindow && (
                  <span className="badge badge-warning badge-sm shrink-0">🕒</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
