import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RequireData from './components/RequireData'
import { useStops } from './context/StopsContext'
import LoadExcelPage from './pages/LoadExcel/LoadExcelPage'
import MapPage from './pages/Map/MapPage'
import StopsPage from './pages/Stops/StopsPage'

function RootRedirect() {
  const { status, dataset } = useStops()

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return <Navigate to={dataset ? '/map' : '/load-excel'} replace />
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<RootRedirect />} />
          <Route path="load-excel" element={<LoadExcelPage />} />
          <Route
            path="map"
            element={
              <RequireData>
                <MapPage />
              </RequireData>
            }
          />
          <Route
            path="stops"
            element={
              <RequireData>
                <StopsPage />
              </RequireData>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
