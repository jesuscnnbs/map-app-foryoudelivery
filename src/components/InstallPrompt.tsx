import { isIos, useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { canInstall, installed, promptInstall } = useInstallPrompt()

  if (installed) return null

  if (canInstall) {
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={promptInstall}>
        📲 Instalar app
      </button>
    )
  }

  if (isIos()) {
    return (
      <div className="alert alert-info py-2 text-xs">
        <span>
          Para instalar: toca <strong>Compartir</strong> y luego{' '}
          <strong>Añadir a pantalla de inicio</strong>.
        </span>
      </div>
    )
  }

  return null
}
