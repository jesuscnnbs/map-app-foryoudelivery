import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { clearDataset, loadDataset, saveDataset } from '../lib/db'
import { parseExcelFile } from '../lib/parseExcel'
import { groupStops, type StopGroup } from '../lib/stops'
import type { LoadedDataset, Stop } from '../types/stop'

type Status = 'loading' | 'ready' | 'error'

interface StopsState {
  status: Status
  dataset: LoadedDataset | null
  selectedStopId: string | null
  error: string | null
}

type Action =
  | { type: 'HYDRATE_DONE'; dataset: LoadedDataset | null }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_DONE'; dataset: LoadedDataset }
  | { type: 'CLEAR' }
  | { type: 'SELECT'; id: string | null }
  | { type: 'ERROR'; error: string }

const EMPTY_STOPS: Stop[] = []

const initialState: StopsState = {
  status: 'loading',
  dataset: null,
  selectedStopId: null,
  error: null,
}

function reducer(state: StopsState, action: Action): StopsState {
  switch (action.type) {
    case 'HYDRATE_DONE':
      return { ...state, status: 'ready', dataset: action.dataset, error: null }
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null }
    case 'LOAD_DONE':
      return {
        status: 'ready',
        dataset: action.dataset,
        selectedStopId: null,
        error: null,
      }
    case 'CLEAR':
      return { status: 'ready', dataset: null, selectedStopId: null, error: null }
    case 'SELECT':
      return { ...state, selectedStopId: action.id }
    case 'ERROR':
      return { ...state, status: 'error', error: action.error }
    default:
      return state
  }
}

interface StopsContextValue extends StopsState {
  stops: Stop[]
  stopGroups: StopGroup[]
  selectedStop: Stop | null
  stopCount: number
  packagesCount: number
  loadFile: (
    file: File,
    sheetName: string,
    routeNumber: number,
  ) => Promise<LoadedDataset>
  clear: () => void
  selectStop: (id: string | null) => void
}

const StopsContext = createContext<StopsContextValue | null>(null)

export function StopsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let active = true
    loadDataset().then((dataset) => {
      if (active) dispatch({ type: 'HYDRATE_DONE', dataset })
    })
    return () => {
      active = false
    }
  }, [])

  const loadFile = useCallback(
    async (file: File, sheetName: string, routeNumber: number) => {
      dispatch({ type: 'LOAD_START' })
      try {
        const { stops, skippedRows } = await parseExcelFile(file, sheetName)
        if (stops.length === 0) {
          throw new Error(
            `La ruta ${routeNumber} ("${sheetName}") no contiene ubicaciones válidas con coordenadas.`,
          )
        }
        const dataset: LoadedDataset = {
          fileName: file.name,
          sheetName,
          routeNumber,
          loadedAt: Date.now(),
          stops,
          skippedRows,
        }
        dispatch({ type: 'LOAD_DONE', dataset })
        void saveDataset(dataset)
        return dataset
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error al procesar el archivo.'
        dispatch({ type: 'ERROR', error: message })
        throw error
      }
    },
    [],
  )

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    void clearDataset()
  }, [])

  const selectStop = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT', id })
  }, [])

  const stops = state.dataset?.stops ?? EMPTY_STOPS
  const stopGroups = useMemo(() => groupStops(stops), [state.dataset])

  const value = useMemo<StopsContextValue>(() => {
    const selectedStop = stops.find((s) => s.id === state.selectedStopId) ?? null
    return {
      ...state,
      stops,
      stopGroups,
      selectedStop,
      stopCount: stopGroups.length,
      packagesCount: stops.length,
      loadFile,
      clear,
      selectStop,
    }
  }, [state, stops, stopGroups, loadFile, clear, selectStop])

  return <StopsContext.Provider value={value}>{children}</StopsContext.Provider>
}

export function useStops(): StopsContextValue {
  const context = useContext(StopsContext)
  if (!context) {
    throw new Error('useStops debe usarse dentro de <StopsProvider>')
  }
  return context
}
