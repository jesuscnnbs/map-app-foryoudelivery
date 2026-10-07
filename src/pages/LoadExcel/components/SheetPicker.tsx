interface SheetPickerProps {
  fileName: string
  sheets: string[]
  onSelect: (routeNumber: number, sheet: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function SheetPicker({
  fileName,
  sheets,
  onSelect,
  onCancel,
  loading = false,
}: SheetPickerProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Selecciona la ruta</h2>
          <p className="truncate text-xs text-base-content/60">{fileName}</p>
          <p className="mt-1 text-sm text-base-content/70">
            Elige el número de ruta asignado al conductor.
          </p>
        </div>

        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
          {sheets.map((sheet, index) => {
            const routeNumber = index + 1
            const showName = sheet.trim() !== String(routeNumber)
            return (
              <button
                key={sheet}
                type="button"
                className="btn btn-outline h-auto flex-col gap-0 py-2"
                disabled={loading}
                title={sheet}
                onClick={() => onSelect(routeNumber, sheet)}
              >
                <span className="text-lg font-bold leading-tight">
                  {routeNumber}
                </span>
                {showName && (
                  <span className="w-full truncate text-[10px] font-normal opacity-60">
                    {sheet}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
