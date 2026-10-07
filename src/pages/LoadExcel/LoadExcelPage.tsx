import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorAlert from '../../components/ErrorAlert'
import InstallPrompt from '../../components/InstallPrompt'
import { useStops } from '../../context/StopsContext'
import { listExcelSheets } from '../../lib/parseExcel'
import logo from '../../assets/delivery-truck-truck-svgrepo-com.svg'
import ColumnsInfo from './components/ColumnsInfo'
import FilePicker from './components/FilePicker'
import SheetPicker from './components/SheetPicker'

export default function LoadExcelPage() {
  const { dataset, loadFile, clear, locationCount } = useStops()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<string[] | null>(null)

  async function handleSelect(file: File) {
    setLoading(true)
    setError(null)
    try {
      const names = await listExcelSheets(file)
      if (names.length === 0) {
        throw new Error('El archivo no contiene ninguna pestaña.')
      }
      if (names.length === 1) {
        await loadSheet(file, names[0], 1)
        return
      }
      setPendingFile(file)
      setSheets(names)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo leer el archivo.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadSheet(file: File, sheet: string, routeNumber: number) {
    setLoading(true)
    setError(null)
    try {
      await loadFile(file, sheet, routeNumber)
      navigate('/map')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo procesar la pestaña.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetPicker() {
    setPendingFile(null)
    setSheets(null)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-md flex-col gap-5 p-4 pb-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <InstallPrompt />

        {dataset ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3">
              <h2 className="card-title text-base">Ruta cargada</h2>
              <div className="text-sm">
                <p className="truncate font-medium">{dataset.fileName}</p>
                <p className="text-base-content/70">
                  Ruta <strong>{dataset.routeNumber}</strong>
                  {dataset.sheetName.trim() !== String(dataset.routeNumber) &&
                    ` (${dataset.sheetName})`}{' '}
                  · {locationCount} ubicaciones · {dataset.stops.length} paquetes
                  {dataset.skippedRows > 0 &&
                    ` · ${dataset.skippedRows} filas omitidas`}
                </p>
                <p className="text-xs text-base-content/50">
                  Cargado el {new Date(dataset.loadedAt).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="card-actions grid grid-cols-2 gap-2">
                <Link to="/map" className="btn btn-primary btn-sm">
                  Ver mapa
                </Link>
                <Link to="/stops" className="btn btn-outline btn-sm">
                  Ver lista
                </Link>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={clear}
              >
                Borrar ruta cargada
              </button>
            </div>
          </div>
        ) : sheets && pendingFile ? (
          <SheetPicker
            fileName={pendingFile.name}
            sheets={sheets}
            loading={loading}
            onSelect={(routeNumber, sheet) =>
              loadSheet(pendingFile, sheet, routeNumber)
            }
            onCancel={resetPicker}
          />
        ) : (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <img
                  src={logo}
                  alt="Rutas de reparto"
                  className="h-16 w-16 rounded-2xl"
                />
                <h2 className="text-lg font-semibold">Carga tu ruta</h2>
                <p className="text-sm text-base-content/70">
                  Selecciona el Excel con las ubicaciones para verlas en el mapa.
                </p>
              </div>
              <FilePicker onSelect={handleSelect} loading={loading} />
            </div>
          </div>
        )}

        <ColumnsInfo />

        <p className="text-center text-xs text-base-content/50">
          Los datos se procesan y guardan solo en este dispositivo.
        </p>
      </div>
    </div>
  )
}
