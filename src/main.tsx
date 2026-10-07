import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App'
import { StopsProvider } from './context/StopsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StopsProvider>
      <App />
    </StopsProvider>
  </StrictMode>,
)
