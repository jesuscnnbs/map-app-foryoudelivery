export default async function run(page) {
  await page.waitForTimeout(2000)
  await page.reload()
  await page.waitForTimeout(1500)

  await page.setInputFiles('input[type=file]', '/tmp/test-ruta.xlsx')
  await page.getByText('Selecciona la ruta').waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: /^1\b/ }).first().click()
  await page.waitForSelector('.leaflet-container', { timeout: 15000 })
  await page.waitForTimeout(1200)

  await page.getByRole('button', { name: 'Descargar' }).click()
  await page.getByText('Mapa offline listo').waitFor({ timeout: 180000 })
  const tilesText = await page.evaluate(
    () => document.querySelector('.text-success')?.textContent ?? null,
  )

  await page.context().setOffline(true)
  await page.reload()
  await page.waitForSelector('.leaflet-container', { timeout: 20000 })
  await page.waitForTimeout(3000)

  const offlineState = await page.evaluate(() => ({
    banner: document.body.innerText.includes('Sin conexión'),
    loadedTiles: document.querySelectorAll('img.leaflet-tile-loaded').length,
    totalTiles: document.querySelectorAll('img.leaflet-tile').length,
    hasMarkers: document.querySelectorAll('.stop-marker').length,
  }))

  await page.context().setOffline(false)
  return { tilesText, offlineState }
}
