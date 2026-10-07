import { useRef } from 'react'

interface FilePickerProps {
  onSelect: (file: File) => void
  loading?: boolean
}

export default function FilePicker({ onSelect, loading = false }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
          event.target.value = ''
        }}
      />
      <button
        type="button"
        className="btn btn-primary btn-lg w-full max-w-xs"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner" />
            Procesando…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
            Seleccionar archivo Excel
          </>
        )}
      </button>
      <p className="text-center text-xs text-base-content/60">
        Formatos admitidos: .xlsx, .xls y .csv
      </p>
    </div>
  )
}
