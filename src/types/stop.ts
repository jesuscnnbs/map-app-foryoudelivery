export interface Stop {
  id: string
  stop: string
  trackingId: string
  timeMin: number | null
  arrival: string
  timeWindow: string
  address: string
  postal: string
  signature: string
  customerNotes: string
  lat: number
  lng: number
  place: string
}

export interface LoadedDataset {
  fileName: string
  sheetName: string
  routeNumber: number
  loadedAt: number
  stops: Stop[]
  skippedRows: number
}

export interface ParseResult {
  stops: Stop[]
  skippedRows: number
}
