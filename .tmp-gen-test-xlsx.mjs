import * as XLSX from 'xlsx'

const headers = ['Stop', 'Tranckin ID', 'Time (min)', 'Arrival', 'Time Window', 'Addres', 'Postal', 'Signature', 'Customer Notes', 'Latitud', 'Longitud', 'Place']

function rows(baseLat, baseLng, n) {
  const out = [headers]
  for (let i = 1; i <= n; i++) {
    const near = i <= n - 3 ? 0 : 0.00015 * i
    out.push([
      String(i), `TRK${i}`, 5 * i,
      `0${8 + (i % 10)}:${String((i * 7) % 60).padStart(2, '0')}`,
      i % 3 === 0 ? '10:00-14:00' : '',
      `Calle Ejemplo ${i}`, `2800${i % 10}`, i % 2 ? 'Sí' : '',
      i % 4 === 0 ? 'Llamar antes de llegar' : '',
      baseLat + near, baseLng + near, 'Madrid',
    ])
  }
  return out
}

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows(40.4168, -3.7038, 25)), 'Ruta 1')
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows(40.43, -3.69, 12)), 'Ruta 2')
XLSX.writeFile(wb, '/tmp/test-ruta.xlsx')
console.log('OK')
