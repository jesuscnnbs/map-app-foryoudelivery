import type { Stop } from '../../../types/stop'

interface StopsTableProps {
  stops: Stop[]
  selectedStopId: string | null
  onSelect: (id: string) => void
}

const HEADERS = [
  'Stop',
  'Tranckin ID',
  'Time (min)',
  'Arrival',
  'Time Window',
  'Addres',
  'Postal',
  'Signature',
  'Customer Notes',
  'Latitud',
  'Longitud',
  'Place',
]

export default function StopsTable({
  stops,
  selectedStopId,
  onSelect,
}: StopsTableProps) {
  return (
    <div className="h-full overflow-auto">
      <table className="table table-pin-rows table-sm">
        <thead>
          <tr>
            {HEADERS.map((header) => (
              <th key={header} className="whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stops.map((stop) => (
            <tr
              key={stop.id}
              className={`cursor-pointer ${
                stop.id === selectedStopId ? 'bg-primary/10' : ''
              }`}
              onClick={() => onSelect(stop.id)}
            >
              <td className="font-semibold">
                <span className="flex items-center gap-1">
                  {stop.stop}
                  {stop.timeWindow && <span title="Ventana horaria">🕒</span>}
                </span>
              </td>
              <td className="whitespace-nowrap">{stop.trackingId}</td>
              <td>{stop.timeMin ?? ''}</td>
              <td className="whitespace-nowrap">{stop.arrival}</td>
              <td className="whitespace-nowrap">{stop.timeWindow}</td>
              <td className="min-w-48">{stop.address}</td>
              <td>{stop.postal}</td>
              <td>{stop.signature}</td>
              <td className="min-w-48">{stop.customerNotes}</td>
              <td className="whitespace-nowrap">{stop.lat.toFixed(6)}</td>
              <td className="whitespace-nowrap">{stop.lng.toFixed(6)}</td>
              <td>{stop.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
