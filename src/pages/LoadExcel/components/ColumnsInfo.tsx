const COLUMNS = [
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

export default function ColumnsInfo() {
  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium">
        Columnas esperadas en el Excel
      </div>
      <div className="collapse-content">
        <p className="mb-2 text-xs text-base-content/70">
          Se detectan automáticamente aunque el orden cambie. Son obligatorias{' '}
          <strong>Stop</strong>, <strong>Latitud</strong> y <strong>Longitud</strong>.
        </p>
        <div className="flex flex-wrap gap-1">
          {COLUMNS.map((column) => (
            <span key={column} className="badge badge-ghost badge-sm">
              {column}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
