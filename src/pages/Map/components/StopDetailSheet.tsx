import { googleMapsByAddress, googleMapsByCoordinates } from '../../../lib/googleMaps'
import type { Stop } from '../../../types/stop'

interface StopDetailSheetProps {
  stop: Stop
  locationNumber?: number
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-base-content/50">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

export default function StopDetailSheet({
  stop,
  locationNumber,
  onClose,
}: StopDetailSheetProps) {
  const addressLink = googleMapsByAddress(stop)
  const coordinatesLink = googleMapsByCoordinates(stop)
  const hasAddress = Boolean(stop.address.trim())

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Cerrar detalles"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-base-100 shadow-xl"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-base-200 bg-base-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
              {locationNumber ?? stop.stop}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">
                Paquete {stop.stop}
              </h2>
              {stop.address && (
                <p className="truncate text-xs text-base-content/60">
                  {stop.address}
                </p>
              )}
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

        <div className="flex flex-col gap-4 p-4">
          {stop.timeWindow && (
            <div className="flex items-center gap-2">
              <span className="badge badge-warning gap-1">🕒 Ventana horaria</span>
              <span className="text-sm font-medium">{stop.timeWindow}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Llegada" value={stop.arrival} />
            <DetailRow
              label="Tiempo"
              value={stop.timeMin !== null ? `${stop.timeMin} min` : ''}
            />
            <DetailRow label="Tracking ID" value={stop.trackingId} />
            <DetailRow label="Código postal" value={stop.postal} />
            <DetailRow label="Firma" value={stop.signature} />
          </div>

          <DetailRow label="Dirección" value={stop.address} />
          <DetailRow label="Notas del cliente" value={stop.customerNotes} />
          <DetailRow
            label="Coordenadas"
            value={`${stop.lat.toFixed(6)}, ${stop.lng.toFixed(6)}`}
          />

          <div className="grid grid-cols-1 gap-2 pt-1">
            {hasAddress && (
              <a
                href={addressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                📍 Ir a la dirección
              </a>
            )}
            <a
              href={coordinatesLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              🧭 Ir a las coordenadas
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
