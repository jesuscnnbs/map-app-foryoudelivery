import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStops } from '../context/StopsContext'

export default function RequireData({ children }: { children: ReactNode }) {
  const { status, dataset } = useStops()

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!dataset) {
    return <Navigate to="/load-excel" replace />
  }

  return <>{children}</>
}
