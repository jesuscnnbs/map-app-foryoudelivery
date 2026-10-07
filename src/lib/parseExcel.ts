import type { ParseResult, Stop } from '../types/stop'

type ColumnKey =
  | 'stop'
  | 'trackingId'
  | 'timeMin'
  | 'arrival'
  | 'timeWindow'
  | 'address'
  | 'postal'
  | 'signature'
  | 'customerNotes'
  | 'lat'
  | 'lng'
  | 'place'

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  stop: ['stop', 'parada', 'numero', 'n'],
  trackingId: ['trackingid', 'tranckinid', 'tracking', 'tranckin', 'id'],
  timeMin: ['timemin', 'time', 'tiempo', 'minutos'],
  arrival: ['arrival', 'llegada', 'hora'],
  timeWindow: ['timewindow', 'ventanahoraria', 'franja', 'horario'],
  address: ['address', 'addres', 'direccion', 'domicilio', 'calle'],
  postal: ['postal', 'postalcode', 'codigopostal', 'cp', 'zip'],
  signature: ['signature', 'firma'],
  customerNotes: ['customernotes', 'notes', 'notas', 'observaciones', 'comentarios'],
  lat: ['latitud', 'lat', 'latitude'],
  lng: ['longitud', 'lng', 'lon', 'long', 'longitude'],
  place: ['place', 'lugar', 'localidad', 'ciudad'],
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function buildColumnMap(headerRow: unknown[]): Partial<Record<ColumnKey, number>> {
  const map: Partial<Record<ColumnKey, number>> = {}
  headerRow.forEach((cell, index) => {
    const normalized = normalizeHeader(cell)
    if (!normalized) return
    for (const key of Object.keys(HEADER_ALIASES) as ColumnKey[]) {
      if (map[key] !== undefined) continue
      if (HEADER_ALIASES[key].includes(normalized)) {
        map[key] = index
      }
    }
  })
  return map
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const cleaned = String(value).trim().replace(',', '.')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function toCoordinate(value: unknown): number | null {
  const num = toNumber(value)
  if (num === null) return null
  return num
}

function findHeaderRow(rows: unknown[][]): number {
  const limit = Math.min(rows.length, 20)
  for (let i = 0; i < limit; i++) {
    const map = buildColumnMap(rows[i] ?? [])
    if (map.stop !== undefined && (map.lat !== undefined || map.lng !== undefined)) {
      return i
    }
  }
  return -1
}

async function readWorkbook(file: File) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  return XLSX.read(buffer, { type: 'array' })
}

export async function listExcelSheets(file: File): Promise<string[]> {
  const workbook = await readWorkbook(file)
  return workbook.SheetNames
}

export async function parseExcelFile(
  file: File,
  sheetName?: string,
): Promise<ParseResult> {
  const XLSX = await import('xlsx')
  const workbook = await readWorkbook(file)
  const selectedSheet =
    sheetName && workbook.Sheets[sheetName]
      ? sheetName
      : workbook.SheetNames[0]
  if (!selectedSheet) {
    return { stops: [], skippedRows: 0 }
  }
  const sheet = workbook.Sheets[selectedSheet]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  })

  const headerIndex = findHeaderRow(rows)
  if (headerIndex === -1) {
    throw new Error(
      `No se encontró una cabecera válida en la pestaña "${selectedSheet}". Debe incluir al menos "Stop" y "Latitud"/"Longitud".`,
    )
  }

  const columns = buildColumnMap(rows[headerIndex])
  const stops: Stop[] = []
  let skippedRows = 0

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const get = (key: ColumnKey): unknown =>
      columns[key] !== undefined ? row[columns[key] as number] : undefined

    const lat = toCoordinate(get('lat'))
    const lng = toCoordinate(get('lng'))
    if (lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      skippedRows += 1
      continue
    }

    const stop = toText(get('stop')) || String(i - headerIndex)
    stops.push({
      id: `${i}-${stop}`,
      stop,
      trackingId: toText(get('trackingId')),
      timeMin: toNumber(get('timeMin')),
      arrival: toText(get('arrival')),
      timeWindow: toText(get('timeWindow')),
      address: toText(get('address')),
      postal: toText(get('postal')),
      signature: toText(get('signature')),
      customerNotes: toText(get('customerNotes')),
      lat,
      lng,
      place: toText(get('place')),
    })
  }

  return { stops, skippedRows }
}
