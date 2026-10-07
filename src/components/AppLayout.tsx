import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import { useStops } from '../context/StopsContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import logo from '../assets/delivery-truck-truck-svgrepo-com.svg'

export default function AppLayout() {
  const { dataset, locationCount, packagesCount } = useStops()
  const online = useOnlineStatus()
  const location = useLocation()

  const title =
    location.pathname === '/load-excel'
      ? 'Cargar Excel'
      : location.pathname === '/stops'
        ? 'Lista de ubicaciones'
        : 'Mapa'

  return (
    <div className="flex h-full flex-col bg-base-200">
      <header
        className="flex items-center justify-between gap-2 bg-neutral px-4 pb-3 text-neutral-content"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
      >
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
          {dataset && (
            <p className="truncate text-xs opacity-90">
              Ruta {dataset.routeNumber} · {locationCount} ubicaciones ·{' '}
              {packagesCount} paquetes
            </p>
          )}
        </div>
        <img
          src={logo}
          alt="Rutas de reparto"
          className="h-9 w-9 shrink-0 rounded-lg"
        />
      </header>
      {!online && (
        <div className="bg-warning px-4 py-1 text-center text-xs font-medium text-warning-content">
          Sin conexión · usando datos y mapa guardados
        </div>
      )}
      <main className="relative flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
