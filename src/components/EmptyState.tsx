import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="text-4xl" aria-hidden>
        📭
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-xs text-sm text-base-content/70">{description}</p>
      )}
      {action}
    </div>
  )
}
